"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { hasWebGL, noSubscribe } from "@/lib/webgl";
import { WaveFallback } from "./WaveFallback";
import type { Intensity } from "./waves";

// three.js + react-three-fiber load only on the client, after the page is interactive.
const WaveLines = dynamic(() => import("./WaveLines"), { ssr: false });

/**
 * The site's one background, behind every page (rendered once in the root
 * layout): a faint grid and vignette, and teal "signal lines" with pulses of
 * light travelling along them. Full on Home, calmer on the section pages so
 * text stays easy to read. The static lines show first, then the animated
 * ones fade in once loaded. With reduced motion (or no WebGL) only the static
 * lines show and the 3D code is never downloaded. The animation pauses while
 * the tab is hidden.
 */
export function PageBackground() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const intensity: Intensity = pathname === "/" ? "full" : "calm";
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
    <div aria-hidden data-bg="waves" data-intensity={intensity} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready && animate ? "opacity-0" : "opacity-100"}`}>
        <WaveFallback intensity={intensity} />
      </div>
      {animate && <WaveLines active={tabVisible} intensity={intensity} onReady={() => setReady(true)} />}
      <div className="bg-vignette absolute inset-0" />
    </div>
  );
}
