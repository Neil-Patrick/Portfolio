"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { introRunning } from "@/lib/intro";
import { hasWebGL, noSubscribe } from "@/lib/webgl";
import { WelcomeStill } from "./fallbacks";
import { isWelcomeKind, type WelcomeKind } from "./kinds";
import type { PointerState } from "./three-utils";

// Each scene is its own chunk (sharing the three.js one with the wave background); only the shown one loads.
const SCENES = {
  compass: dynamic(() => import("./CompassScene"), { ssr: false }),
  gyroscope: dynamic(() => import("./GyroscopeScene"), { ssr: false }),
  monolith: dynamic(() => import("./MonolithScene"), { ssr: false }),
} satisfies Record<WelcomeKind, unknown>;

/** Temporary comparison switch: /?visual=gyroscope shows that one. Goes once a visual is chosen. */
function readChoice(fallback: WelcomeKind) {
  const requested = new URLSearchParams(window.location.search).get("visual");
  return isWelcomeKind(requested) ? requested : fallback;
}

/**
 * The landing's 3D welcome animation. The still version shows first; the
 * scene lazy-loads and crossfades in, and stays a still with reduced motion
 * or without WebGL. It pauses off-screen and in hidden tabs, follows the
 * cursor, and plays its entrance as the loading screen clears (when it played).
 */
export function WelcomeVisual({ kind: defaultKind }: { kind: WelcomeKind }) {
  const kind = useSyncExternalStore(noSubscribe, () => readChoice(defaultKind), () => defaultKind);
  const reduceMotion = useReducedMotion();
  const webgl = useSyncExternalStore(noSubscribe, hasWebGL, () => false);
  // The entrance plays only if the loading screen is on now (only read in the browser).
  const [arrive] = useState(() => typeof document !== "undefined" && introRunning());
  const container = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, seen: false });
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    // Mouse position relative to the visual's center (-1..1 across it, y up). Touch doesn't steer.
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = element.getBoundingClientRect();
      pointer.current = {
        x: (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
        y: -(event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
        seen: true,
      };
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  const animate = webgl && !reduceMotion;
  const Scene = SCENES[kind];

  return (
    <div ref={container} data-welcome={kind} className="relative mx-auto aspect-square w-full max-w-lg">
      <div
        data-welcome-still
        className={`absolute inset-0 transition-opacity duration-700 ${animate && ready ? "opacity-0" : "opacity-100"}`}
      >
        <WelcomeStill kind={kind} />
      </div>
      {animate && (
        <Scene key={kind} active={inView && tabVisible} pointer={pointer} arrive={arrive} onReady={() => setReady(true)} />
      )}
      {/* Hologram scanlines over the whole visual. */}
      <div aria-hidden className="holo-scanlines absolute inset-0" />
    </div>
  );
}
