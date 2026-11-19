"use client";

import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { sections } from "@/content/site";
import { Icon, SectionIcon } from "../icons";
import { bearing, bearingOf, nearestIndex, polar, shortestTurn } from "./compass-geometry";
import { CompassRose } from "./CompassRose";

/**
 * Site navigation as a compass: page icons sit around a ring, and the compass
 * needle in the middle swings to whichever one you aim at (mouse direction,
 * hover, focus, or arrow keys). Built on a native modal <dialog>, so focus is
 * trapped, Escape closes it, and focus returns to the trigger.
 */

const COUNT = sections.length;
/** Ring radius, as a percentage of the dial. Items sit on the ring. */
const RADIUS = 38;
/** A real compass needle settles with a little wobble. */
const NEEDLE_SPRING = { stiffness: 170, damping: 13 };
const POP = { type: "spring", stiffness: 260, damping: 20 } as const;

export function CompassMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Drives the dial's content; the dialog itself closes after the exit animation.
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();

  const current = Math.max(
    sections.findIndex((section) => section.href === pathname),
    0,
  );

  const show = () => {
    setOpen(true);
    dialogRef.current?.showModal();
  };
  const hide = () => setOpen(false);

  // No page scrolling behind the open menu (Lenis and native scroll alike).
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      lenis?.start();
      root.style.overflow = previous;
    };
  }, [open, lenis]);

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Navigation"
        className="group grid size-11 place-items-center rounded-sm border border-line-strong text-ink hover:border-accent"
      >
        <CompassRose size={28} className="transition-transform duration-500 motion-safe:group-hover:rotate-45" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site navigation"
        className="compass-dialog"
        // Escape: run the closing animation instead of closing at once.
        onCancel={(event) => {
          event.preventDefault();
          hide();
        }}
      >
        <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
          {open && <Dial key="dial" current={current} onClose={hide} />}
        </AnimatePresence>
      </dialog>
    </>
  );
}

function Dial({ current, onClose }: { current: number; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const dialRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [aim, setAim] = useState(current);
  const start = bearing(current, COUNT);
  const angle = useRef(start);
  // The needle starts a quarter-turn off and swings in to the current page.
  const needle = useSpring(reduceMotion ? start : start - 90, NEEDLE_SPRING);

  // On open: swing the needle in, and put focus on the current page (autoFocus only works on form controls).
  useEffect(() => {
    needle.set(angle.current);
    linkRefs.current[current]?.focus();
  }, [needle, current]);

  const aimAt = (index: number) => {
    if (index === aim) return;
    setAim(index);
    angle.current = shortestTurn(angle.current, bearing(index, COUNT));
    if (reduceMotion) needle.jump(angle.current);
    else needle.set(angle.current);
  };

  // Mouse direction from the center picks the item, like a game's radial menu.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < rect.width * 0.08) return; // dead zone in the middle
    aimAt(nearestIndex(bearingOf(dx, dy), COUNT));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (aim + step + COUNT) % COUNT;
    aimAt(next);
    linkRefs.current[next]?.focus();
  };

  return (
    <>
      {/* Dim and blur the page (an element rather than ::backdrop, so it animates both ways). */}
      <motion.div
        aria-hidden
        className="fixed inset-0 bg-canvas/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      />

      {/* Click anywhere outside the dial to close. */}
      <div
        className="fixed inset-0 grid place-items-center"
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        {/* Close button in the trigger's spot. */}
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <div className="container-page flex h-header items-center justify-end">
            <motion.button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="pointer-events-auto grid size-11 place-items-center rounded-sm border border-line-strong hover:border-accent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Icon icon={X} size={20} />
            </motion.button>
          </div>
        </div>

        <div
          ref={dialRef}
          onPointerMove={onPointerMove}
          className="relative aspect-square w-[min(92vw,78vh,38rem)]"
        >
          <Ring reduceMotion={Boolean(reduceMotion)} />

          {/* Compass: spins in, then its needle (north point) follows the aim. */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className="text-ink-muted"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -180, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                <motion.div style={{ rotate: needle }}>
                  <CompassRose className="size-[min(24vw,11rem)]" />
                </motion.div>
              </motion.div>
              <div className="mt-2 h-7 sm:mt-3 sm:h-9">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={aim}
                    data-testid="compass-aim"
                    className="text-lg font-semibold tracking-widest sm:text-2xl"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {sections[aim].label}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Page links around the ring. */}
          <nav aria-label="Primary" onKeyDown={onKeyDown}>
            <ul>
              {sections.map((section, i) => {
                const { x, y } = polar(bearing(i, COUNT), RADIUS);
                const active = i === aim;
                return (
                  <motion.li
                    key={section.id}
                    className="absolute"
                    style={{ x: "-50%", y: "-50%" }}
                    initial={reduceMotion ? { left: `${50 + x}%`, top: `${50 + y}%`, opacity: 0 } : { left: "50%", top: "50%", opacity: 0, scale: 0.3 }}
                    animate={{ left: `${50 + x}%`, top: `${50 + y}%`, opacity: 1, scale: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0, transition: { duration: 0.15 } }
                        : { left: "50%", top: "50%", opacity: 0, scale: 0.3, transition: { duration: 0.18 } }
                    }
                    transition={{ ...POP, delay: reduceMotion ? 0 : 0.12 + i * 0.04 }}
                  >
                    <Link
                      ref={(node) => {
                        linkRefs.current[i] = node;
                      }}
                      href={section.href}
                      aria-current={i === current ? "page" : undefined}
                      onClick={onClose}
                      onPointerEnter={(event) => event.pointerType === "mouse" && aimAt(i)}
                      onFocus={() => aimAt(i)}
                      className="group relative flex flex-col items-center outline-none"
                    >
                      <span
                        className={`grid size-14 place-items-center rounded-full border bg-surface transition-[scale,border-color,box-shadow,color] duration-200 group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-focus sm:size-16 ${
                          active ? "scale-108 border-accent text-accent shadow-glow" : "border-line-strong text-ink"
                        }`}
                      >
                        <SectionIcon id={section.id} className="size-6" />
                      </span>
                      <motion.span
                        className={`absolute top-full mt-1.5 rounded-xs bg-canvas px-1.5 py-0.5 text-xs whitespace-nowrap tracking-widest sm:text-sm ${
                          active ? "text-accent" : "text-ink-muted"
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: reduceMotion ? 0 : 0.35 + i * 0.04 }}
                      >
                        {section.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

/** The dial's ring and compass ticks (every 10°, longer every 90°). The ring draws itself in. */
function Ring({ reduceMotion }: { reduceMotion: boolean }) {
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);
  return (
    <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
      {/* Rotated so the ring draws from north, clockwise. */}
      <g transform="rotate(-90 50 50)">
        <motion.circle
          cx={50}
          cy={50}
          r={RADIUS}
          fill="none"
          className="stroke-line-strong"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          initial={reduceMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </g>
      <motion.g
        className="stroke-line"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ delay: reduceMotion ? 0 : 0.25, duration: 0.4 }}
      >
        {ticks.map((deg) => {
          const long = deg % 90 === 0;
          const inner = polar(deg, RADIUS - (long ? 8 : 5));
          const outer = polar(deg, RADIUS - 3);
          return (
            <line
              key={deg}
              x1={50 + inner.x}
              y1={50 + inner.y}
              x2={50 + outer.x}
              y2={50 + outer.y}
              strokeWidth={long ? 1.5 : 1}
              vectorEffect="non-scaling-stroke"
              className={long ? "stroke-line-strong" : undefined}
            />
          );
        })}
      </motion.g>
    </svg>
  );
}
