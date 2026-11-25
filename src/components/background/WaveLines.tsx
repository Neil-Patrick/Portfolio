"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { usePalette } from "./scene-utils";
import { INTENSITY, SEGMENTS, WAVES, waveY, type Intensity } from "./waves";

/**
 * The site background's signal lines (lazy-loaded, client only). A few grey
 * hairlines drift very slowly, and soft teal pulses of light travel along
 * some of them like data down a cable. Scrolling nudges the phase a
 * little so they feel alive while reading. No pointer effects.
 */

type Props = {
  /** Animate continuously. False renders a still frame (hidden tab). */
  active: boolean;
  intensity: Intensity;
  onReady?: () => void;
};

/** Pulse speed (px per second) and glow size (px). */
const PULSE_SPEED = 140;
const PULSE_SIZE = 18;

/** A soft round glow, drawn once into a texture: bright core, gentle falloff. */
function glowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/** Scroll distance (px) for one radian of phase shift: a slow, gentle response. */
const SCROLL_PHASE = 1 / 1400;

function Lines({ active, intensity }: { active: boolean; intensity: Intensity }) {
  const { lines: lineCount, opacity, pulses } = INTENSITY[intensity];
  const palette = usePalette();
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const elapsed = useRef(0);

  // One THREE.Line per wave. WebGL lines are always 1px wide: true hairlines.
  const lines = useMemo(
    () =>
      WAVES.slice(0, lineCount).map((wave) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array((SEGMENTS + 1) * 3), 3));
        const material = new THREE.LineBasicMaterial({ transparent: true, opacity: wave.opacity * opacity, depthWrite: false });
        return new THREE.Line(geometry, material);
      }),
    [lineCount, opacity],
  );

  // One glowing point per pulsing wave, spaced out so they don't travel in step.
  const glow = useMemo(() => glowTexture(), []);
  const pulse = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(pulses.length * 3), 3));
    const material = new THREE.PointsMaterial({
      size: PULSE_SIZE,
      sizeAttenuation: false,
      map: glow,
      transparent: true,
      opacity: 0.85 * opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Points(geometry, material);
  }, [pulses, opacity, glow]);

  useEffect(() => {
    // Lines are neutral grey; only the pulses carry the teal accent.
    lines.forEach((line) => (line.material as THREE.LineBasicMaterial).color.copy(palette.line));
    (pulse.material as THREE.PointsMaterial).color.copy(palette.accent);
    invalidate();
  }, [lines, pulse, palette, invalidate]);

  useEffect(
    () => () => {
      lines.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      pulse.geometry.dispose();
      (pulse.material as THREE.Material).dispose();
    },
    [lines, pulse],
  );
  useEffect(() => () => glow.dispose(), [glow]);

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
    // Pulses run left to right along their wave, then re-enter from the left edge.
    const track = width + 2 * PULSE_SIZE;
    const pulsePositions = pulse.geometry.getAttribute("position") as THREE.BufferAttribute;
    pulses.forEach((waveIndex, i) => {
      const x = ((elapsed.current * PULSE_SPEED + (i * track) / pulses.length) % track) - PULSE_SIZE;
      const y = waveY(WAVES[waveIndex], x, elapsed.current, height, shift);
      pulsePositions.setXYZ(i, x - width / 2, height / 2 - y, 0);
    });
    pulsePositions.needsUpdate = true;
  });

  return (
    <>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
      <primitive object={pulse} />
    </>
  );
}

export default function WaveLines({ active, intensity, onReady }: Props) {
  return (
    <Canvas
      aria-hidden
      data-bg-canvas="waves"
      orthographic
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={() => onReady?.()}
    >
      <Lines active={active} intensity={intensity} />
    </Canvas>
  );
}
