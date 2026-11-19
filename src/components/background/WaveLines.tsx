"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { usePalette } from "./scene-utils";
import { SEGMENTS, WAVES, waveY } from "./waves";

/**
 * Subtle wave lines behind the home page (lazy-loaded, client only).
 * A few accent-colored hairlines drift very slowly; scrolling nudges their
 * phase a little so they feel alive while reading. No pointer effects.
 */

type Props = {
  /** Animate continuously. False renders a still frame (hidden tab). */
  active: boolean;
  onReady?: () => void;
};

/** Scroll distance (px) for one radian of phase shift: a slow, gentle response. */
const SCROLL_PHASE = 1 / 1400;

function Lines({ active }: { active: boolean }) {
  const palette = usePalette();
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const elapsed = useRef(0);

  // One THREE.Line per wave. WebGL lines are always 1px wide: true hairlines.
  const lines = useMemo(
    () =>
      WAVES.map((wave) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array((SEGMENTS + 1) * 3), 3));
        const material = new THREE.LineBasicMaterial({ transparent: true, opacity: wave.opacity, depthWrite: false });
        return new THREE.Line(geometry, material);
      }),
    [],
  );

  useEffect(() => {
    lines.forEach((line) => (line.material as THREE.LineBasicMaterial).color.copy(palette.accent));
    invalidate();
  }, [lines, palette, invalidate]);

  useEffect(
    () => () =>
      lines.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }),
    [lines],
  );

  useFrame((_, delta) => {
    if (active) elapsed.current += Math.min(delta, 0.05); // no jumps after a paused tab
    const shift = window.scrollY * SCROLL_PHASE;
    const { width, height } = size;
    // R3F's orthographic camera spans the canvas in pixels, centered on 0.
    lines.forEach((line, i) => {
      const positions = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let s = 0; s <= SEGMENTS; s++) {
        const x = (s / SEGMENTS) * width;
        const y = waveY(WAVES[i], x, elapsed.current, height, shift);
        positions.setXYZ(s, x - width / 2, height / 2 - y, 0);
      }
      positions.needsUpdate = true;
    });
  });

  return (
    <>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  );
}

export default function WaveLines({ active, onReady }: Props) {
  return (
    <Canvas
      aria-hidden
      data-bg-canvas="waves"
      orthographic
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 2]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={() => onReady?.()}
    >
      <Lines active={active} />
    </Canvas>
  );
}
