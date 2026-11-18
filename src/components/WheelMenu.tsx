"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { sections } from "@/content/site";
import { sectionIcons } from "./icons";

/** Degrees between neighbouring items; item 0 sits at 12 o'clock, then clockwise. */
const STEP = 360 / sections.length;
/** Pointer this close to the center doesn't aim (like a controller stick's dead zone). */
const DEAD_ZONE_PX = 24;

/** Turn from `from` to `to` (degrees) the short way round, keeping a running total. */
function turnTowards(from: number, to: number) {
  const delta = ((((to - from) % 360) + 540) % 360) - 180;
  return from + delta;
}

/**
 * Radial navigation. A button opens a native modal <dialog> (focus trap, Escape,
 * inert page for free) with one icon per entry in `sections`, laid out on a ring.
 * An arrow on the hub's edge aims at the highlighted item; the hub shows its name
 * and tagline. Aim with the mouse (anywhere around the ring), arrow keys, or Tab.
 */
export function WheelMenu() {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [arrowAngle, setArrowAngle] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const dialogId = useId();
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = Math.max(
    0,
    sections.findIndex((s) => s.href === pathname),
  );
  const active = highlighted ?? currentIndex;
  const activeSection = sections[active];

  // Keep React state in sync however the dialog closes (Escape, outside click, link, button).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      setHighlighted(null);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const aim = (index: number) => {
    setHighlighted(index);
    setArrowAngle((angle) => turnTowards(angle, index * STEP));
  };

  const openWheel = () => {
    setArrowAngle((angle) => turnTowards(angle, currentIndex * STEP));
    dialogRef.current?.showModal();
    setOpen(true);
    // Start on the current page's item, like a game menu remembering your place.
    linkRefs.current[currentIndex]?.focus();
  };

  const closeWheel = () => dialogRef.current?.close();

  /** Which item a screen point aims at, or null inside the dead zone / outside the ring. */
  const indexAt = (x: number, y: number) => {
    const ring = ringRef.current?.getBoundingClientRect();
    if (!ring) return null;
    const dx = x - (ring.left + ring.width / 2);
    const dy = y - (ring.top + ring.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance < DEAD_ZONE_PX || distance > ring.width / 2) return null;
    const degrees = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    return Math.round(degrees / STEP) % sections.length;
  };

  const onPointerMove = (event: PointerEvent<HTMLDialogElement>) => {
    if (event.pointerType !== "mouse") return;
    const index = indexAt(event.clientX, event.clientY);
    if (index !== null && index !== highlighted) aim(index);
  };

  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    // Links and buttons handle their own clicks.
    if ((event.target as Element).closest("a, button")) return;
    const ring = ringRef.current?.getBoundingClientRect();
    if (!ring) return;
    const distance = Math.hypot(
      event.clientX - (ring.left + ring.width / 2),
      event.clientY - (ring.top + ring.height / 2),
    );
    // Outside the ring: close. Inside it: open whatever the arrow aims at.
    if (distance > ring.width / 2) return closeWheel();
    const index = indexAt(event.clientX, event.clientY);
    if (index === null) return;
    closeWheel();
    router.push(sections[index].href);
  };

  const onRingKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const links = linkRefs.current;
    const from = links.findIndex((link) => link === document.activeElement);
    const next = (Math.max(from, 0) + step + links.length) % links.length;
    links[next]?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={openWheel}
        className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface"
      >
        <span className="sr-only">Open navigation</span>
        <WheelIcon />
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="Navigation"
        onClick={onDialogClick}
        onPointerMove={onPointerMove}
        className="wheel-dialog fixed inset-0 m-0 size-full max-h-none max-w-none place-items-center overflow-hidden bg-canvas/90 p-0 text-ink backdrop:bg-transparent open:grid"
      >
        {/* Close sits exactly where the open button was: press the same spot to close. */}
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <div className="container-page flex h-header items-center justify-end">
            <button
              type="button"
              onClick={closeWheel}
              className="pointer-events-auto grid size-11 place-items-center rounded-full border border-line bg-canvas transition-colors hover:bg-surface"
            >
              <span className="sr-only">Close navigation</span>
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden
                focusable={false}
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div ref={ringRef} className="wheel-ring relative">
          <div className="wheel-track absolute top-1/2 left-1/2 -translate-1/2 rounded-full" />

          {/* Hub: arrow sweeps its edge, text stays in the middle. */}
          <div className="wheel-hub absolute top-1/2 left-1/2 -translate-1/2 rounded-full border border-line bg-canvas">
            <div
              data-testid="wheel-arrow-track"
              className="wheel-arrow absolute inset-0"
              style={{ rotate: `${arrowAngle}deg` }}
            >
              <svg
                data-testid="wheel-arrow"
                viewBox="0 0 16 10"
                className="absolute top-1.5 left-1/2 h-2.5 w-4 -translate-x-1/2 text-accent sm:top-2 sm:h-3.5 sm:w-5"
                aria-hidden
                focusable={false}
              >
                <path d="M8 0 16 10H0z" fill="currentColor" />
              </svg>
            </div>
            <div
              data-testid="wheel-readout"
              aria-hidden
              className="wheel-readout absolute top-1/2 left-1/2 -translate-1/2 text-center"
            >
              <p className="text-xs font-semibold tracking-wider uppercase sm:text-sm">
                {activeSection.label}
              </p>
              <p className="mt-1 hidden text-sm text-ink-muted sm:block">{activeSection.tagline}</p>
            </div>
          </div>

          <nav aria-label="Primary">
            <ul onKeyDown={onRingKeyDown}>
              {sections.map((section, i) => {
                const SectionIcon = sectionIcons[section.id];
                const current = i === currentIndex;
                return (
                  <li key={section.id}>
                    <Link
                      ref={(el) => {
                        linkRefs.current[i] = el;
                      }}
                      href={section.href}
                      aria-current={current ? "page" : undefined}
                      data-highlighted={i === active ? "" : undefined}
                      onClick={closeWheel}
                      onFocus={() => aim(i)}
                      style={{ "--i": i, "--count": sections.length } as CSSProperties}
                      className="wheel-item group absolute top-1/2 left-1/2 aspect-square rounded-full"
                    >
                      <span
                        className={`wheel-face grid size-full place-content-center justify-items-center gap-1 rounded-full border-2 bg-surface text-ink-muted group-data-highlighted:bg-canvas group-data-highlighted:text-ink group-data-highlighted:ring-4 group-data-highlighted:ring-accent/40 ${
                          current ? "border-accent" : "border-line"
                        }`}
                      >
                        <SectionIcon className="size-7 sm:size-9" />
                        <span aria-hidden className="wheel-caption text-xs font-medium">
                          {section.label}
                        </span>
                      </span>
                      <span className="sr-only">{section.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}

/** A ring with six nodes, hinting at the radial menu. */
function WheelIcon() {
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    return { cx: 12 + 8 * Math.cos(angle), cy: 12 + 8 * Math.sin(angle) };
  });
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden focusable={false}>
      <circle cx={12} cy={12} r={8} strokeOpacity={0.4} />
      {nodes.map((n, i) => (
        <circle key={i} cx={n.cx.toFixed(2)} cy={n.cy.toFixed(2)} r={2} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}
