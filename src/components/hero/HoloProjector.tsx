"use client";

import { motion, useInView, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { site } from "@/content/site";
import { cssVars } from "@/lib/css-vars";
import { whenIntroDone } from "@/lib/intro";

type Phase = "off" | "on" | "glitch";

/** Parallax follows the pointer with a little lag. */
const DRIFT = { stiffness: 120, damping: 20 };
/** Most the figure drifts with the pointer, in px. */
const MAX_DRIFT = { x: 10, y: 6 };
/** How long the tap glitch runs before the figure re-projects, in ms (matches holo-glitch in globals.css). */
const GLITCH_MS = 320;

/** Tick marks around the emitter's outer ring: [x1, y1, x2, y2] on the 400 x 120 base. */
const TICKS = Array.from({ length: 48 }, (_, i) => {
  const t = (i / 48) * Math.PI * 2;
  const long = i % 6 === 0;
  const [rx, ry, grow] = [184, 42, long ? 1.07 : 1.035];
  return [200 + rx * Math.cos(t), 62 + ry * Math.sin(t), 200 + rx * grow * Math.cos(t), 62 + ry * grow * Math.sin(t)].map(
    (n) => Math.round(n * 10) / 10,
  );
});

/**
 * The landing's hologram: the illustrated avatar (never the real photo) stands
 * in a beam of light above a ring emitter. It projects in bottom-up once the
 * loading screen clears and it is scrolled into view, then idles: a rare flicker, a scan band rising through
 * it, ring dashes orbiting, a slow float. A pointer (or a dragging finger)
 * drifts it in parallax; a tap glitches it and re-projects. The project-in and
 * idle loops are CSS (globals.css, "Hologram projector"), driven by data-phase;
 * under reduced motion it is simply shown, still. The Open to Work chip lives
 * in the landing's text column; the name (h1) has its own section above.
 */
export function HoloProjector() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("off");
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const timers = useRef<number[]>([]);

  const driftX = useSpring(0, DRIFT);
  const driftY = useSpring(0, DRIFT);

  // Projects in once it is scrolled into view (and the loading screen has cleared). With reduced motion it
  // stays "off", which the CSS only hides under prefers-reduced-motion: no-preference, so it is simply shown
  // (and markup matches the server).
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, amount: 0.35 });
  useEffect(() => {
    if (reduceMotion || !inView) return;
    let timer = 0;
    const stopWaiting = whenIntroDone(() => {
      timer = window.setTimeout(() => setPhase("on"), 150);
    });
    return () => {
      stopWaiting();
      window.clearTimeout(timer);
    };
  }, [reduceMotion, inView]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const driftToward = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    driftX.set(Math.max(-1, Math.min(1, x)) * MAX_DRIFT.x);
    driftY.set(Math.max(-1, Math.min(1, y)) * MAX_DRIFT.y);
  };
  const settle = () => {
    driftX.set(0);
    driftY.set(0);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    // Mouse: hovering drifts it. Touch and pen: only while pressed (a drag).
    if (event.pointerType !== "mouse" && !press.current) return;
    if (press.current && Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 8) {
      press.current.moved = true;
    }
    driftToward(event);
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    press.current = { x: event.clientX, y: event.clientY, moved: false };
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const tapped = press.current && !press.current.moved;
    press.current = null;
    if (event.pointerType !== "mouse") settle();
    // A tap (not a drag) glitches the projection, then it re-projects bottom-up.
    if (tapped && !reduceMotion && phase === "on") {
      setPhase("glitch");
      timers.current.push(
        window.setTimeout(() => {
          setPhase("off");
          timers.current.push(window.setTimeout(() => setPhase("on"), 60));
        }, GLITCH_MS),
      );
    }
  };

  return (
    <div ref={root} className="mx-auto w-full max-w-md select-none" data-hologram data-phase={phase}>
      <div
        className="relative aspect-4/5 touch-pan-y"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => !press.current && settle()}
        onPointerCancel={() => {
          press.current = null;
          settle();
        }}
      >
        {/* Beam: rises from the emitter, widening and fading upward. */}
        <div aria-hidden className="holo-beam absolute inset-x-[6%] top-[6%] bottom-[12%]" />

        {/* Emitter: perspective rings, orbiting dashes, ticks, a glowing core. */}
        <svg
          aria-hidden
          viewBox="0 0 400 124"
          className="holo-base absolute inset-x-0 bottom-0 w-full origin-bottom overflow-visible"
        >
          <ellipse cx={200} cy={62} rx={196} ry={46} className="fill-none stroke-line-strong" strokeWidth={1} />
          <g className="stroke-accent/45" strokeWidth={1}>
            {TICKS.map(([x1, y1, x2, y2]) => (
              <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
          <ellipse cx={200} cy={62} rx={184} ry={42} className="fill-none stroke-accent/60" strokeWidth={1.25} />
          <ellipse
            cx={200}
            cy={62}
            rx={140}
            ry={31}
            className="holo-orbit fill-none stroke-accent"
            strokeWidth={2}
            strokeDasharray="3 9 24 9"
          />
          <ellipse cx={200} cy={62} rx={92} ry={19} className="fill-accent/10 stroke-accent/50" strokeWidth={1} />
          <ellipse cx={200} cy={62} rx={58} ry={11} className="holo-core fill-accent/70" />
          <ellipse cx={200} cy={62} rx={30} ry={5} className="fill-ink/80" />
        </svg>

        {/* The figure: the keyed-out illustration, with scanlines and a scan band clipped to its shape. */}
        <motion.div className="absolute inset-x-[16%] top-[6%] bottom-[9%]" style={{ x: driftX, y: driftY }} data-layer="figure">
          <div className="holo-float size-full">
            <div className="holo-figure relative size-full" style={cssVars({ "--holo-mask": `url(${site.avatar.holo})` })}>
              <Image
                src={site.avatar.holo}
                alt={site.avatar.alt}
                width={site.avatar.holoSize.width}
                height={site.avatar.holoSize.height}
                // Already a right-sized WebP; unoptimized so the loader's preload warms this exact file.
                unoptimized
                priority
                className="size-full object-contain object-bottom"
              />
              <div aria-hidden className="holo-fx absolute inset-0 overflow-hidden" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
