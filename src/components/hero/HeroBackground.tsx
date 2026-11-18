"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HeroFallback } from "./HeroFallback";

// three.js + react-three-fiber load only on the client, after the page is interactive.
const NeuralNetwork = dynamic(() => import("./NeuralNetwork"), { ssr: false });

let webglSupport: boolean | undefined;

/** Checked once per page load (creating a context is not free), then cached. */
function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

const noSubscribe = () => () => {};

/**
 * Hero background: the static network first, then the 3D network once it has
 * loaded (the static one fades out). The 3D scene animates only while the hero
 * is on screen and the tab is visible; with reduced motion it stays a still frame.
 */
export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // False on the server (static fallback only), the real capability on the client.
  const webgl = useSyncExternalStore(noSubscribe, hasWebGL, () => false);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    if (node) observer.observe(node);

    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
        <HeroFallback />
      </div>
      {webgl && (
        <NeuralNetwork active={onScreen && tabVisible && !reduceMotion} onReady={() => setReady(true)} />
      )}
    </div>
  );
}
