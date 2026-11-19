"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { WaveFallback } from "./WaveFallback";

// three.js + react-three-fiber load only on the client, after the page is interactive.
const WaveLines = dynamic(() => import("./WaveLines"), { ssr: false });

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
 * Fixed wave background behind every home section. The static lines show
 * first, then the animated ones fade in once loaded. With reduced motion only
 * the static lines show and the 3D code is never downloaded. The animation
 * pauses while the tab is hidden.
 */
export function PageBackground() {
  const reduceMotion = useReducedMotion();
  // False on the server (static lines only), the real capability on the client.
  const webgl = useSyncExternalStore(noSubscribe, hasWebGL, () => false);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const animate = webgl && !reduceMotion;

  return (
    <div aria-hidden data-bg="waves" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready && animate ? "opacity-0" : "opacity-100"}`}>
        <WaveFallback />
      </div>
      {animate && <WaveLines active={tabVisible} onReady={() => setReady(true)} />}
    </div>
  );
}
