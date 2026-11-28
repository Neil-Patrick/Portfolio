"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react";

/** Tilt follows the pointer with a little lag; depth pops out with a slight overshoot. */
const TILT = { stiffness: 150, damping: 18 };
const DEPTH = { stiffness: 120, damping: 12 };
/** Most a pointer can tilt the card, in degrees. */
const MAX_TILT = { x: 12, y: 16 };
/** How far each layer floats in front of the plate when separated, in px. */
const Z = { content: 36, brackets: 64 };

/**
 * The hologram card (the previous landing card's look, now holding the About
 * portrait): a bracketed plate with scanlines and a sheen that slides as it
 * turns, the content floating in front, corner brackets floating further out.
 * Once it scrolls into view the layers separate into depth; it tilts toward the
 * cursor, or with a finger dragged across it, and sways gently when idle. Clicks
 * belong to the content: a drag that ends on the content never counts as a
 * click. With reduced motion it is a flat, still card.
 */
export function HoloCard({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const card = useRef<HTMLDivElement>(null);
  const inView = useInView(card, { once: true, amount: 0.4 });
  const rotateX = useSpring(0, TILT);
  const rotateY = useSpring(0, TILT);
  const depth = useSpring(0, DEPTH);
  const engaged = useRef(false);
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const dragged = useRef(false);

  const zContent = useTransform(depth, [0, 1], [0, Z.content]);
  const zBrackets = useTransform(depth, [0, 1], [0, Z.brackets]);
  const sheenX = useTransform(rotateY, [-MAX_TILT.y, MAX_TILT.y], [0, 100]);
  const sheen = useMotionTemplate`${sheenX}% 50%`;

  // Flat, then 3D: the layers separate once the card is in view.
  useEffect(() => {
    if (reduceMotion || !inView) return;
    const timer = window.setTimeout(() => depth.set(1), 200);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, inView, depth]);

  // Idle sway while nobody is tilting it.
  useAnimationFrame((time) => {
    if (reduceMotion || engaged.current) return;
    rotateY.set(Math.sin(time / 2600) * 7);
    rotateX.set(Math.cos(time / 3400) * 4);
  });

  const tiltToward = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    rotateY.set(Math.max(-1, Math.min(1, x)) * MAX_TILT.y);
    rotateX.set(-Math.max(-1, Math.min(1, y)) * MAX_TILT.x);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    // Mouse: hovering tilts. Touch and pen: only while pressed (a drag).
    if (event.pointerType !== "mouse" && !press.current) return;
    engaged.current = true;
    if (press.current && Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 8) {
      press.current.moved = true;
    }
    tiltToward(event);
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    press.current = { x: event.clientX, y: event.clientY, moved: false };
    dragged.current = false;
    if (event.pointerType !== "mouse" && !reduceMotion) {
      engaged.current = true;
      tiltToward(event);
    }
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragged.current = Boolean(press.current?.moved);
    press.current = null;
    if (event.pointerType !== "mouse") engaged.current = false;
  };
  // A drag to tilt must not also flip the content: swallow the click it ends with.
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragged.current) return;
    dragged.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div ref={card} className="mx-auto w-full perspective-midrange" data-holo-card>
      <motion.div
        className="relative touch-pan-y p-4 select-none transform-3d sm:p-5"
        style={{ rotateX, rotateY }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          if (!press.current) engaged.current = false;
        }}
        onPointerCancel={() => {
          press.current = null;
          engaged.current = false;
        }}
        onClickCapture={onClickCapture}
      >
        {/* Back plate: bracketed surface with scanlines and a sliding sheen. */}
        <div aria-hidden className="hud-corners absolute inset-0 border border-line-strong bg-surface/90">
          <div className="holo-scanlines absolute inset-0" />
          <motion.div className="holo-sheen absolute inset-0" style={{ backgroundPosition: sheen }} />
        </div>

        {/* Content, with brackets floating in front of it. */}
        <div className="relative transform-3d">
          <motion.div style={{ z: zContent }} data-layer="content">
            {children}
          </motion.div>
          <motion.div aria-hidden className="hud-corners pointer-events-none absolute -inset-2" style={{ z: zBrackets }} data-layer="brackets" />
        </div>
      </motion.div>
    </div>
  );
}
