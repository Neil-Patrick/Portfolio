"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

/** Theme colors for the 3D scenes (background waves, landing welcome visuals). Client only. */

export type Palette = {
  cert: THREE.Color;
  accent: THREE.Color;
  project: THREE.Color;
  line: THREE.Color;
  ink: THREE.Color;
  canvas: THREE.Color;
  /** Dark canvas: glows add light (additive blending); on light, they blend normally. */
  dark: boolean;
};

/** Resolve a CSS color token to a THREE.Color by letting the browser compute it. */
function readToken(name: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return new THREE.Color(value);
}

function readPalette(): Palette {
  const canvas = readToken("--color-canvas");
  return {
    cert: readToken("--color-series-cert"),
    accent: readToken("--color-accent"),
    project: readToken("--color-series-project"),
    line: readToken("--color-line-strong"),
    ink: readToken("--color-ink"),
    canvas,
    dark: canvas.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5,
  };
}

/** Token colors, re-read when the theme changes (switcher or OS setting). */
export function usePalette() {
  const [palette, setPalette] = useState<Palette>(readPalette);
  useEffect(() => {
    const update = () => setPalette(readPalette());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  return palette;
}
