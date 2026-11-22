"use client";

import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type PointerEvent } from "react";
import { site } from "@/content/site";
import { whenIntroDone } from "@/lib/intro";
import { ProfilePhoto } from "../ProfilePhoto";

/** Tilt follows the pointer with a little lag; depth pops out with a slight overshoot. */
const TILT = { stiffness: 150, damping: 18 };
const DEPTH = { stiffness: 120, damping: 12 };
/** Most a pointer can tilt the card, in degrees. */
const MAX_TILT = { x: 12, y: 16 };
/** How far each layer floats in front of the plate when separated, in px. */
const Z = { photo: 36, brackets: 64, name: 78, status: 100 };

/**
 * The landing's hologram card: a flat 2D profile card that splits into
 * floating 3D layers (plate, photo, brackets, name tag, status) once the
 * loading screen clears. It tilts toward the cursor, or with a finger dragged
 * across it; a tap folds it flat and pops it back out; idle, it sways gently.
 * Pure CSS 3D driven by Motion springs, so it works the same with touch.
 * With reduced motion it stays a flat, still card. The page's h1 is here.
 */
export function HologramCard() {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, TILT);
  const rotateY = useSpring(0, TILT);
  const depth = useSpring(0, DEPTH);
  const engaged = useRef(false);
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const zPhoto = useTransform(depth, [0, 1], [0, Z.photo]);
  const zBrackets = useTransform(depth, [0, 1], [0, Z.brackets]);
  const zName = useTransform(depth, [0, 1], [0, Z.name]);
  const zStatus = useTransform(depth, [0, 1], [0, Z.status]);
  // The holographic sheen slides across as the card turns.
  const sheenX = useTransform(rotateY, [-MAX_TILT.y, MAX_TILT.y], [0, 100]);
  const sheen = useMotionTemplate`${sheenX}% 50%`;

  // 2D, then 3D: the layers separate once the loading screen has cleared.
  useEffect(() => {
    if (reduceMotion) return;
    let timer = 0;
    const stopWaiting = whenIntroDone(() => {
      timer = window.setTimeout(() => depth.set(1), 300);
    });
    return () => {
      stopWaiting();
      window.clearTimeout(timer);
    };
  }, [reduceMotion, depth]);

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
    if (event.pointerType !== "mouse" && !reduceMotion) {
      engaged.current = true;
      tiltToward(event);
    }
  };
  // The mouse left: go back to the idle sway (a finger lifting is handled in onPointerUp).
  const onPointerLeave = () => {
    if (!press.current) engaged.current = false;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const tapped = press.current && !press.current.moved;
    press.current = null;
    if (event.pointerType !== "mouse") engaged.current = false;
    // A tap (not a drag) folds it flat, then it pops back out.
    if (tapped && !reduceMotion) {
      depth.set(0);
      window.setTimeout(() => depth.set(1), 380);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xs perspective-midrange sm:max-w-sm" data-hologram>
      <motion.div
        className="relative grid touch-pan-y gap-5 p-5 select-none transform-3d sm:p-6"
        style={{ rotateX, rotateY }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={() => {
          press.current = null;
          engaged.current = false;
        }}
      >
        {/* Back plate: bracketed surface with scanlines and a sliding sheen. */}
        <div aria-hidden className="hud-corners absolute inset-0 border border-line-strong bg-surface/90">
          <div className="holo-scanlines absolute inset-0" />
          <motion.div className="holo-sheen absolute inset-0" style={{ backgroundPosition: sheen }} />
        </div>

        {/* Status, floating highest. */}
        <motion.p
          className="relative flex items-center gap-2 justify-self-end hud-label text-xs text-accent"
          style={{ z: zStatus }}
          data-layer="status"
        >
          <span aria-hidden className="live-pulse size-2 shrink-0 rounded-full bg-accent" />
          {site.availability}
        </motion.p>

        {/* Photo, with brackets floating in front of it. */}
        <div className="relative transform-3d">
          <motion.div style={{ z: zPhoto }} data-layer="photo">
            <ProfilePhoto sizes="(min-width: 640px) 20rem, 80vw" priority />
          </motion.div>
          <motion.div aria-hidden className="hud-corners pointer-events-none absolute -inset-2" style={{ z: zBrackets }} data-layer="brackets" />
        </div>

        {/* Name tag: the page's main heading. */}
        <motion.div className="relative border-l-2 border-accent bg-canvas/80 px-3 py-2" style={{ z: zName }} data-layer="name">
          <h1 className="font-display text-3xl leading-tight font-bold">{site.name}</h1>
          <p className="text-sm text-ink-muted">{site.role}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
