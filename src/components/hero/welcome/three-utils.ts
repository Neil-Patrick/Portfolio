import type { RefObject } from "react";
import * as THREE from "three";
import type { Palette } from "@/components/background/scene-utils";

/** Cursor position relative to the visual's center: -1..1 across it (y up), beyond outside it. */
export type PointerState = { x: number; y: number; seen: boolean };

/** What WelcomeVisual hands every scene. */
export type SceneProps = {
  /** Animate continuously. False renders a still frame (off-screen or hidden tab). */
  active: boolean;
  pointer: RefObject<PointerState>;
  /** Play the entrance (the loading screen just played); otherwise start at rest. */
  arrive: boolean;
  onReady?: () => void;
};

/** A damped spring (semi-implicit Euler), mutated in place. Defaults feel like the compass needle. */
export type Spring = { value: number; velocity: number };
export function stepSpring(spring: Spring, target: number, dt: number, stiffness = 170, damping = 13) {
  const force = (target - spring.value) * stiffness - spring.velocity * damping;
  spring.velocity += force * dt;
  spring.value += spring.velocity * dt;
}

/** Signed shortest turn between two angles, in radians. */
export function shortestTurn(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
export const easeOutCubic = (t: number) => 1 - (1 - clamp01(t)) ** 3;
/** Overshoots a little, then settles. */
export const easeOutBack = (t: number, s = 1.6) => {
  const x = clamp01(t) - 1;
  return 1 + (s + 1) * x ** 3 + s * x ** 2;
};

/**
 * A hologram flicker: returns an opacity factor that's 1 most of the time,
 * with a brief stutter every 4 to 9 seconds.
 */
export function createFlicker() {
  let next = 3 + Math.random() * 3;
  let until = 0;
  return (time: number) => {
    if (time > next) {
      until = time + 0.14;
      next = time + 4 + Math.random() * 5;
    }
    if (time < until) return Math.random() < 0.5 ? 0.3 : 0.75;
    return 1;
  };
}

/** Seeded random numbers (mulberry32), so procedural shapes are the same on every visit. */
export function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A hairline material in the theme accent: glows (adds light) on dark, blends normally on light. */
export function lineMaterial(palette: Palette, opacity: number, color: THREE.Color = palette.accent) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

/** A faint filled face for the hologram's surfaces. */
export function faceMaterial(palette: Palette, opacity: number, color: THREE.Color = palette.accent) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

/** A circle in the XY plane, as a closed line. */
export function circleGeometry(radius: number, segments = 128) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

/** Radial ticks around a circle in the XY plane (pairs of points for LineSegments). */
export function tickGeometry(radius: number, count: number, length: number, longEvery = 0, longLength = length * 2) {
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const l = longEvery && i % longEvery === 0 ? longLength : length;
    const c = Math.cos(a);
    const s = Math.sin(a);
    positions.push(c * radius, s * radius, 0, c * (radius + l), s * (radius + l), 0);
  }
  return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
}

/** Sets every material's opacity to its base value times `factor` (bases stored in userData). */
export function setOpacity(materials: THREE.Material[], factor: number) {
  for (const material of materials) {
    const base = (material.userData.baseOpacity as number | undefined) ?? material.opacity;
    material.userData.baseOpacity = base;
    material.opacity = base * factor;
  }
}

/** Frees geometries and materials when a scene unmounts. */
export function disposeAll(objects: THREE.Object3D[]) {
  for (const root of objects) {
    root.traverse((node) => {
      const mesh = node as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
  }
}
