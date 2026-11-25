"use client";

import { useState } from "react";
import * as THREE from "three";

/** Token colors for the 3D background scene (client only). */

export type Palette = { cert: THREE.Color; accent: THREE.Color; project: THREE.Color; line: THREE.Color };

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
  return {
    cert: readToken("--color-series-cert"),
    accent: readToken("--color-accent"),
    project: readToken("--color-series-project"),
    line: readToken("--color-line-strong"),
  };
}

/** Token colors, read once on mount (the site is dark only, so they never change). */
export function usePalette() {
  const [palette] = useState<Palette>(readPalette);
  return palette;
}
