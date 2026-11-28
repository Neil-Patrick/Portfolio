"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import {
  badgeImage,
  certifications,
  credentialCategories,
  featuredCertification,
  formatMonth,
  type Certification,
  type CredentialCategoryId,
} from "@/content/credentials";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { CredentialEmblem } from "./CredentialEmblem";
import { Icon } from "./icons";

type Filter = CredentialCategoryId | "all";

/** Every credential, oldest first: the path runs left to right through time, then loops. */
const all: Certification[] = [featuredCertification, ...certifications].sort((a, b) => a.date.localeCompare(b.date));
const N = all.length;
const countOf = (id: CredentialCategoryId) => all.filter((cert) => cert.category === id).length;
const isCategory = (value: string): value is CredentialCategoryId =>
  credentialCategories.some((category) => category.id === value);
const categoryLabel = (id: CredentialCategoryId) => credentialCategories.find((c) => c.id === id)!.label;
const keyOf = (cert: Certification) => `${cert.date}-${cert.code}`;

/** The strip holds three copies of the set; the view stays on the middle one, so it loops both ways. */
const COPIES = 3;
const STEP = 116;
const HEIGHT = 196;
const MID = 92;
const NODE = 64;
const SET = N * STEP;
const nodeX = (g: number) => g * STEP + STEP / 2;

/**
 * The wave the line and the emblems ride on, in the strip's on-screen space:
 * height at screen x for the current amplitude and phase. Calm at rest; while
 * the strip is dragged or swiped the amplitude swells with the speed, so the
 * line and the emblems ripple, then settle back.
 */
const WAVELENGTH = 520;
const REST_AMPLITUDE = 10;
const MAX_AMPLITUDE = 38;
const waveAt = (x: number, amplitude: number, phase: number) =>
  MID + amplitude * Math.sin((x / WAVELENGTH) * Math.PI * 2 + phase) + amplitude * 0.35 * Math.sin((x / (WAVELENGTH * 0.47)) * Math.PI * 2 - phase * 1.6);

/** Pointer travel (px) before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 6;
/** How long the strip must sit still before it snaps to the nearest credential. */
const SETTLE_MS = 140;

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Credentials page body, top to bottom:
 * 1. A looping drag carousel: every certification is a circular emblem (its
 *    code, issuer and year, ringed in the issuer's color) riding one wavy
 *    line, oldest to newest, then round again. The wave swells while the strip
 *    moves and settles when it stops. Drag it (mouse, with a
 *    little momentum) or swipe it; it settles on the nearest credential and
 *    selects it. Clicking an emblem glides it to the center. Emblems grow
 *    toward the center and fade toward the edges, pulses of light run along
 *    the line, and the selected emblem's inner ring turns. No scrollbar or
 *    arrow buttons; keyboard users move with the arrow keys and Home/End.
 * 2. The selected credential's details, with its real Credly badge (untouched)
 *    and a "Verify on Credly" link.
 * 3. Browse by field: category chips over rows (emblem, name, issuer, month,
 *    Credly link), grouped by field under All. The choice lives in the URL
 *    hash (/credentials#web-development). Picking a row selects it above.
 */
export function CredentialPath({ header }: { header?: ReactNode }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState(N - 1);
  const strip = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0, lastX: 0, lastT: 0, velocity: 0 });
  const tween = useRef(0);
  const animating = useRef(false);
  const settleTimer = useRef<number | undefined>(undefined);
  const line = useRef<SVGPathElement>(null);
  const pulse = useRef<SVGPathElement>(null);
  const wave = useRef({ amplitude: REST_AMPLITUDE, phase: 0, lastLeft: 0, lastT: 0, speed: 0 });

  // Follow the hash on arrival and on back/forward.
  useEffect(() => {
    const fromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      setFilter(isCategory(hash) ? hash : "all");
    };
    fromHash();
    window.addEventListener("popstate", fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("popstate", fromHash);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  /**
   * Draw one frame: the line along the wave across the visible strip, each
   * emblem lifted onto the wave at its on-screen x, and the depth effect
   * (emblems grow toward the center and fade toward the edges).
   */
  const paint = useCallback(() => {
    const el = strip.current;
    if (!el) return;
    const width = el.clientWidth;
    const { amplitude, phase } = wave.current;
    let d = "";
    for (let x = 0; x <= width; x += 8) d += `${x === 0 ? "M" : "L"}${x} ${waveAt(x, amplitude, phase).toFixed(1)}`;
    line.current?.setAttribute("d", d);
    pulse.current?.setAttribute("d", d);
    const half = width / 2;
    nodes.current.forEach((node, g) => {
      if (!node) return;
      const screenX = nodeX(g) - el.scrollLeft;
      if (screenX < -NODE || screenX > width + NODE) return; // off screen: leave it
      const dist = Math.min(Math.abs(screenX - half) / half, 1);
      node.style.setProperty("--wave-y", `${(waveAt(screenX, amplitude, phase) - MID).toFixed(1)}px`);
      node.style.setProperty("--depth-scale", (1.3 - 0.5 * dist).toFixed(3));
      node.style.setProperty("--depth-fade", (1 - 0.65 * Math.pow(dist, 1.4)).toFixed(3));
    });
  }, []);

  // The wave's motion: speed from how fast the strip moves swells the amplitude; it eases back at rest.
  useEffect(() => {
    if (reduceMotion()) return;
    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (strip.current) observer.observe(strip.current);
    const tick = (now: number) => {
      const el = strip.current;
      const w = wave.current;
      if (el && visible && !document.hidden) {
        const dt = Math.min((now - (w.lastT || now)) / 1000, 0.05);
        // Speed in px/s; a jump from the loop wrap (a whole set) is ignored.
        const moved = el.scrollLeft - w.lastLeft;
        const speed = Math.abs(moved) > SET / 2 ? w.speed : Math.abs(moved) / Math.max(dt, 0.001);
        w.speed += (speed - w.speed) * 0.25;
        const target = REST_AMPLITUDE + Math.min(w.speed / 40, MAX_AMPLITUDE - REST_AMPLITUDE);
        w.amplitude += (target - w.amplitude) * 0.08;
        w.phase += dt * (0.6 + w.speed / 900) * Math.sign(moved || 1);
        w.lastLeft = el.scrollLeft;
        paint();
      }
      w.lastT = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [paint]);

  /** Keep the view on the middle copy: jump a whole set when it drifts to either side (invisible). */
  const wrap = useCallback(() => {
    const el = strip.current;
    if (!el) return 0;
    let shift = 0;
    if (el.scrollLeft < SET * 0.5) shift = SET;
    else if (el.scrollLeft > SET * 1.5) shift = -SET;
    if (shift) el.scrollLeft += shift;
    return shift;
  }, []);

  /** Glide (or jump, with reduced motion) so strip position `g` sits in the middle. */
  const glideTo = useCallback(
    (g: number, smooth = true) => {
      const el = strip.current;
      if (!el) return;
      cancelAnimationFrame(tween.current);
      const target = nodeX(g) - el.clientWidth / 2;
      if (!smooth || reduceMotion()) {
        el.scrollLeft = target;
        wrap();
        paint();
        return;
      }
      const from = el.scrollLeft;
      const start = performance.now();
      animating.current = true;
      const frame = (now: number) => {
        const t = Math.min((now - start) / 450, 1);
        el.scrollLeft = from + (target - from) * easeOut(t);
        paint();
        if (t < 1) tween.current = requestAnimationFrame(frame);
        else {
          animating.current = false;
          wrap();
          paint();
        }
      };
      tween.current = requestAnimationFrame(frame);
    },
    [paint, wrap],
  );

  /** The copy of credential `i` nearest to the current view. */
  const nearestCopy = (i: number) => {
    const el = strip.current;
    if (!el) return N + i;
    const center = el.scrollLeft + el.clientWidth / 2;
    return [i, i + N, i + 2 * N].reduce((best, g) => (Math.abs(nodeX(g) - center) < Math.abs(nodeX(best) - center) ? g : best));
  };

  const select = (i: number, g = nearestCopy(i), focus = false) => {
    setSelected(i);
    if (focus) tabs.current[i]?.focus({ preventScroll: true });
    glideTo(g);
  };

  // Start with the newest credential centered on the middle copy.
  useEffect(() => {
    glideTo(N + N - 1, false);
    const onResize = () => paint();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(tween.current);
      window.clearTimeout(settleTimer.current);
    };
  }, [glideTo, paint]);

  /** When the strip comes to rest after a drag, swipe or wheel, snap to the nearest credential and select it. */
  const onScroll = () => {
    paint();
    if (animating.current || drag.current.active) return;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const el = strip.current;
      if (!el || animating.current || drag.current.active) return;
      wrap();
      const g = Math.round((el.scrollLeft + el.clientWidth / 2 - STEP / 2) / STEP);
      const i = ((g % N) + N) % N;
      setSelected(i);
      glideTo(g);
    }, SETTLE_MS);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const to: Record<string, number> = {
      ArrowRight: (selected + 1) % N,
      ArrowDown: (selected + 1) % N,
      ArrowLeft: (selected - 1 + N) % N,
      ArrowUp: (selected - 1 + N) % N,
      Home: 0,
      End: N - 1,
    };
    if (event.key in to) {
      event.preventDefault();
      select(to[event.key], undefined, true);
    }
  };

  // Mouse dragging (touch uses the strip's native horizontal scroll), with a little momentum on release.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !strip.current) return;
    cancelAnimationFrame(tween.current);
    animating.current = false;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startLeft: strip.current.scrollLeft,
      lastX: event.clientX,
      lastT: event.timeStamp,
      velocity: 0,
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || !strip.current) return;
    const dx = event.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      d.moved = true;
      strip.current.setPointerCapture(event.pointerId);
    }
    if (!d.moved) return;
    strip.current.scrollLeft = d.startLeft - dx;
    d.startLeft += wrap(); // keep dragging smoothly across the loop seam
    paint();
    const dt = Math.max(event.timeStamp - d.lastT, 1);
    d.velocity = (event.clientX - d.lastX) / dt;
    d.lastX = event.clientX;
    d.lastT = event.timeStamp;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (!d.moved || !strip.current) return;
    if (reduceMotion()) {
      onScroll();
      return;
    }
    let v = d.velocity * 16; // px per frame
    const step = () => {
      const el = strip.current;
      if (!el) return;
      if (Math.abs(v) < 0.5) {
        onScroll(); // settle and snap
        return;
      }
      el.scrollLeft -= v;
      wrap();
      paint();
      v *= 0.92;
      tween.current = requestAnimationFrame(step);
    };
    tween.current = requestAnimationFrame(step);
  };
  // A press that turned into a drag is not a click on the emblem under it.
  const onClickCapture = (event: MouseEvent) => {
    if (drag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
    }
  };

  const choose = (next: Filter) => {
    setFilter(next);
    const url = next === "all" ? window.location.pathname : `#${next}`;
    window.history.pushState(null, "", url);
  };

  const filterChip = (id: Filter, label: string, count: number) => {
    const pressed = filter === id;
    return (
      <li key={id}>
        <button
          type="button"
          aria-pressed={pressed}
          onClick={() => choose(id)}
          className={`hud-notch hud-notch-edge inline-flex min-h-11 items-center gap-2 border py-1.5 pr-4 pl-3 transition-colors focus-visible:-outline-offset-4 ${
            pressed
              ? "border-accent bg-accent text-on-accent focus-visible:outline-on-accent"
              : "border-line-strong hover:border-accent hover:text-accent hover:[--edge:var(--color-accent)]"
          }`}
        >
          <span className="hud-label text-sm">{label}</span>
          <span aria-hidden className="text-xs font-semibold tabular-nums opacity-70">
            {count}
          </span>
          <span className="sr-only">({count})</span>
        </button>
      </li>
    );
  };

  const current = all[selected];
  const groups = credentialCategories.filter((category) => filter === "all" || category.id === filter);
  const shown = filter === "all" ? N : countOf(filter);
  const image = badgeImage(current);

  return (
    <>
      {/* Screen 1: the page title, the carousel and the selected credential. */}
      <div className="screen-section">
      {header && <div className="mb-12 sm:mb-16">{header}</div>}
      {/* 1. The looping carousel. The line is drawn in the strip's own (non-scrolling) space, behind the emblems. */}
      <div className="credential-carousel relative -mx-4 sm:mx-0">
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
          <path ref={line} className="fill-none stroke-line-strong" strokeWidth={1.5} />
          <path ref={pulse} className="credential-pulse fill-none stroke-accent" strokeWidth={2} strokeLinecap="round" />
        </svg>
      <div
        ref={strip}
        className="credential-strip cursor-hand-open relative overflow-x-auto overscroll-x-contain select-none"
        data-credential-path
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        <div className="relative" style={{ width: SET * COPIES, height: HEIGHT }}>
          {/* The emblems. Only the middle copy is the real tab list; the copies either side are visual. */}
          <div role="tablist" aria-label="Credentials, oldest to newest" aria-orientation="horizontal" onKeyDown={onKeyDown}>
            {Array.from({ length: N * COPIES }, (_, g) => {
              const i = g % N;
              const cert = all[i];
              const isCurrent = i === selected;
              const real = g >= N && g < 2 * N;
              const emblem = (
                <span className="credential-node relative block" style={{ width: NODE, height: NODE }}>
                  {/* Soft glow behind the selected emblem. */}
                  {isCurrent && <span aria-hidden className="emblem-glow absolute -inset-2 rounded-full" />}
                  <CredentialEmblem cert={cert} active={isCurrent} className="relative size-full" />
                </span>
              );
              const place = {
                left: nodeX(g) - NODE / 2,
                top: MID - NODE / 2,
              };
              return real ? (
                <button
                  key={g}
                  ref={(el) => {
                    tabs.current[i] = el;
                    nodes.current[g] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`credential-tab-${i}`}
                  aria-selected={isCurrent}
                  aria-controls="credential-detail"
                  tabIndex={isCurrent ? 0 : -1}
                  onClick={() => select(i, g)}
                  data-category={cert.category}
                  draggable={false}
                  className="absolute rounded-full focus-visible:outline-offset-4"
                  style={place}
                >
                  {emblem}
                  <span className="sr-only">
                    {cert.name}, {formatMonth(cert.date)}
                  </span>
                </button>
              ) : (
                <div
                  key={g}
                  ref={(el) => {
                    nodes.current[g] = el;
                  }}
                  aria-hidden
                  onClick={() => select(i, g)}
                  className="absolute rounded-full"
                  style={place}
                >
                  {emblem}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {/* 2. The selected credential, with its real Credly badge. */}
      <section
        id="credential-detail"
        role="tabpanel"
        aria-labelledby={`credential-tab-${selected}`}
        aria-live="polite"
        className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10"
      >
        {image ? (
          <Image
            key={image}
            src={image}
            alt={`${current.name} badge`}
            width={160}
            height={160}
            sizes="160px"
            className="badge-in size-32 object-contain sm:size-40"
            data-credly-badge
          />
        ) : (
          <CredentialEmblem cert={current} className="size-32 sm:size-40" />
        )}
        <div className="min-w-0">
          <p className="hud-label text-sm text-ink-muted">
            {categoryLabel(current.category)}
            <span className="tabular-nums">
              {" "}
              ({selected + 1} of {N})
            </span>
          </p>
          <h2 className="mt-1 font-display text-3xl leading-tight font-bold wrap-break-word sm:text-4xl">{current.name}</h2>
          <p className="mt-2 text-ink-muted">{current.issuer}</p>
          <p className="mt-1 hud-label text-sm text-ink-muted tabular-nums">
            Earned {formatMonth(current.date)}
            {current.expires && <>, valid until {formatMonth(current.expires)}</>}
          </p>
          {current.url && (
            <a
              href={current.url}
              {...newTab}
              className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline underline-offset-4 hover:no-underline"
            >
              <Icon icon={ExternalLink} />
              Verify on Credly
              <span className="sr-only">
                : {current.name}
                {NEW_TAB_NOTE}
              </span>
            </a>
          )}
        </div>
      </section>

      </div>

      {/* 3. Browse by field, on a screen of its own. */}
      <section aria-labelledby="browse-heading" className="screen-section">
        <h2 id="browse-heading" className="mb-5 hud-label text-lg text-ink">
          Browse by Field
        </h2>
        <nav aria-label="Filter credentials">
          <ul className="flex flex-wrap gap-2">
            {filterChip("all", "All", N)}
            {credentialCategories.map((category) => filterChip(category.id, category.label, countOf(category.id)))}
          </ul>
        </nav>
        <p aria-live="polite" className="mt-4 text-sm text-ink-muted">
          Showing {shown} of {N} credentials
        </p>

        <div className="mt-8 grid gap-10">
          {groups.map((category) => {
            const certs = all.filter((cert) => cert.category === category.id).reverse(); // newest first
            return (
              <section key={category.id} aria-labelledby={`group-${category.id}`} data-category={category.id}>
                <h3 id={`group-${category.id}`} className="mb-3 flex items-center gap-3 hud-label text-sm text-ink-muted">
                  {category.label}
                  <span aria-hidden className="h-px flex-1 bg-line" />
                  <span className="tabular-nums">{certs.length}</span>
                </h3>
                <ul className="grid gap-1">
                  {certs.map((cert) => (
                    <li key={keyOf(cert)} className="hud-row flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 py-2 pr-2 pl-3">
                      {/* Picking a row selects it in the carousel and brings the carousel into view. */}
                      <button
                        type="button"
                        onClick={() => {
                          select(all.indexOf(cert));
                          strip.current?.scrollIntoView({ block: "center", behavior: reduceMotion() ? "instant" : "smooth" });
                        }}
                        className="group flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <CredentialEmblem cert={cert} active={cert === current} className="size-11 shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-semibold wrap-break-word transition-colors group-hover:text-accent">{cert.name}</span>
                          <span className="block text-sm text-ink-muted">
                            {cert.issuer}, {formatMonth(cert.date)}
                          </span>
                        </span>
                      </button>
                      {cert.url && (
                        <a
                          href={cert.url}
                          {...newTab}
                          className="inline-flex min-h-11 items-center gap-2 hud-label text-xs text-accent hover:underline"
                        >
                          <Icon icon={ExternalLink} />
                          Credly
                          <span className="sr-only">
                            : verify {cert.name}
                            {NEW_TAB_NOTE}
                          </span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
