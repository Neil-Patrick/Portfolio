"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { usePalette, type Palette } from "@/components/background/scene-utils";
import { whenIntroDone } from "@/lib/intro";
import { SceneCanvas } from "./SceneCanvas";
import {
  circleGeometry,
  clamp01,
  createFlicker,
  disposeAll,
  easeOutBack,
  faceMaterial,
  lineMaterial,
  setOpacity,
  stepSpring,
  tickGeometry,
  type SceneProps,
  type Spring,
} from "./three-utils";

/**
 * Armillary Gyroscope: an old navigator's armillary sphere as a hologram.
 * Banded rings engraved with ticks spin on different axes (two pairs nested
 * as real gimbals, so their motion compounds) around a glowing wireframe
 * core on a polar axis. The whole sphere leans toward the cursor.
 * Entrance: the rings start closed and flat, then open and spin up with a
 * little overshoot.
 */

/** Rings, outermost first: radius, open tilt, spin speed (rad/s), tick count, and which ring it hangs in. */
const RINGS = [
  { radius: 2.7, tilt: new THREE.Euler(Math.PI / 2, 0, 0), speed: 0.16, ticks: 72, parent: -1 },
  { radius: 2.3, tilt: new THREE.Euler(Math.PI / 2, 0, 1.05), speed: -0.24, ticks: 60, parent: 0 },
  { radius: 1.9, tilt: new THREE.Euler(0.42, 0.95, 0), speed: 0.3, ticks: 48, parent: -1 },
  { radius: 1.45, tilt: new THREE.Euler(1.15, -0.6, 0.4), speed: -0.42, ticks: 36, parent: 2 },
];
const BAND = 0.07;

/** A banded ring: two close circles with engraved ticks between them, longer every 30°. */
function makeBand(palette: Palette, radius: number, ticks: number) {
  const band = new THREE.Group();
  band.add(new THREE.LineLoop(circleGeometry(radius), lineMaterial(palette, 0.7)));
  band.add(new THREE.LineLoop(circleGeometry(radius + BAND), lineMaterial(palette, 0.45)));
  band.add(new THREE.LineSegments(tickGeometry(radius, ticks, BAND, ticks / 12, BAND * 2.4), lineMaterial(palette, 0.5)));
  return band;
}

function build(palette: Palette) {
  const root = new THREE.Group();

  // Core: a wireframe icosahedron around a softly glowing solid one.
  const core = new THREE.Group();
  core.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.72, 1)), lineMaterial(palette, 0.85)));
  const glowMaterial = faceMaterial(palette, 0.22);
  core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), glowMaterial));
  root.add(core);

  // Polar axis with small end caps.
  const axis = new THREE.Group();
  axis.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -3.05, 0), new THREE.Vector3(0, 3.05, 0)]),
      lineMaterial(palette, 0.5),
    ),
  );
  for (const y of [-3.05, 3.05]) {
    const cap = new THREE.LineLoop(circleGeometry(0.12, 32), lineMaterial(palette, 0.6));
    cap.rotation.x = Math.PI / 2;
    cap.position.y = y;
    axis.add(cap);
  }
  root.add(axis);

  // Rings: frame (tilt) > spinner (spin) > band. Children hang in their parent's spinner.
  const rings = RINGS.map((def) => {
    const frame = new THREE.Group();
    const spinner = new THREE.Group();
    spinner.add(makeBand(palette, def.radius, def.ticks));
    frame.add(spinner);
    return { def, frame, spinner };
  });
  rings.forEach((ring) => (ring.def.parent < 0 ? root : rings[ring.def.parent].spinner).add(ring.frame));

  const materials: THREE.Material[] = [];
  root.traverse((node) => {
    const material = (node as THREE.Mesh).material as THREE.Material | undefined;
    if (material && material !== glowMaterial) materials.push(material);
  });

  return { root, core, glowMaterial, rings, materials };
}

function Gyroscope({ pointer, arrive }: Pick<SceneProps, "pointer" | "arrive">) {
  const palette = usePalette();
  const built = useMemo(() => build(palette), [palette]);
  // three.js objects change every frame, so the frame loop reaches them through a ref.
  const live = useRef(built);
  const [flicker] = useState(createFlicker);
  const phase = useRef<"wait" | "go" | "run" | "rest">(arrive ? "wait" : "rest");
  const startedAt = useRef(0);
  const tiltX = useRef<Spring>({ value: 0, velocity: 0 });
  const tiltY = useRef<Spring>({ value: 0, velocity: 0 });

  useEffect(() => {
    live.current = built;
    return () => disposeAll([built.root]);
  }, [built]);
  useEffect(() => {
    if (!arrive) return;
    return whenIntroDone(() => {
      phase.current = "go";
    });
  }, [arrive]);

  useFrame((state, delta) => {
    const scene = live.current;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30);
    if (phase.current === "go") {
      startedAt.current = t;
      phase.current = "run";
    }
    const since = phase.current === "rest" ? 99 : phase.current === "run" ? t - startedAt.current : -1;

    // Rings open from flat (all facing you) to their tilts, outermost first, then spin up past speed and settle.
    const spinUp = since < 0 ? 0 : easeOutBack(since / 1.8, 2.2);
    scene.rings.forEach((ring, i) => {
      const open = since < 0 ? 0 : easeOutBack((since - i * 0.12) / 1.2, 1.4);
      ring.frame.rotation.set(ring.def.tilt.x * open, ring.def.tilt.y * open, ring.def.tilt.z * open);
      ring.spinner.rotation.z += dt * ring.def.speed * spinUp;
    });

    // The core turns slowly and breathes.
    const grow = since < 0 ? 0.001 : Math.max(easeOutBack(since / 0.7, 1.8), 0.001);
    scene.core.scale.setScalar(grow);
    scene.core.rotation.y += dt * 0.25;
    scene.core.rotation.x += dt * 0.1;

    // The whole sphere leans toward the cursor.
    const p = pointer.current;
    stepSpring(tiltY.current, p.seen ? THREE.MathUtils.clamp(p.x, -1.5, 1.5) * 0.35 : Math.sin(t * 0.25) * 0.15, dt, 40, 12);
    stepSpring(tiltX.current, p.seen ? THREE.MathUtils.clamp(-p.y, -1.5, 1.5) * 0.25 : 0, dt, 40, 12);
    scene.root.rotation.set(0.18 + tiltX.current.value, -0.35 + tiltY.current.value, 0.12);

    const f = flicker(t) * (since < 0 ? 0 : clamp01(since / 0.3));
    setOpacity(scene.materials, f);
    scene.glowMaterial.opacity = (0.16 + 0.08 * Math.sin(t * 2)) * f;
  });

  return <primitive object={built.root} />;
}

export default function GyroscopeScene({ active, pointer, arrive, onReady }: SceneProps) {
  return (
    <SceneCanvas active={active} onReady={onReady}>
      <Gyroscope pointer={pointer} arrive={arrive} />
    </SceneCanvas>
  );
}
