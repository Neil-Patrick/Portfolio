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
  easeOutCubic,
  faceMaterial,
  lineMaterial,
  seededRandom,
  setOpacity,
  shortestTurn,
  stepSpring,
  tickGeometry,
  type SceneProps,
  type Spring,
} from "./three-utils";

/**
 * Holo Compass: the nav button's compass rose rebuilt as a 3D hologram. Each
 * point is beveled (a lit half and a shaded half meeting on a raised ridge)
 * with glowing edges; two tilted HUD rings turn around it. A separate north
 * needle swings toward the visitor's cursor with the compass menu's spring
 * wobble. Entrance: the points fly in from all sides and lock with a flash.
 */

/** The rose's points: bearing (degrees), length, half-width, and strength (diagonals are fainter). */
const POINTS = [
  { bearing: 0, length: 2.1, width: 0.27, strength: 1 },
  { bearing: 90, length: 1.75, width: 0.25, strength: 1 },
  { bearing: 180, length: 1.75, width: 0.25, strength: 1 },
  { bearing: 270, length: 1.75, width: 0.25, strength: 1 },
  { bearing: 45, length: 1.05, width: 0.16, strength: 0.55 },
  { bearing: 135, length: 1.05, width: 0.16, strength: 0.55 },
  { bearing: 225, length: 1.05, width: 0.16, strength: 0.55 },
  { bearing: 315, length: 1.05, width: 0.16, strength: 0.55 },
];

type Piece = { object: THREE.Object3D; from: THREE.Vector3; spin: THREE.Euler; baseZ: number };

/** One beveled point, pointing up before it's turned to its bearing. */
function makePoint(palette: Palette, length: number, width: number, strength: number) {
  const tip = new THREE.Vector3(0, length, 0);
  const right = new THREE.Vector3(width, 0.14, 0);
  const left = new THREE.Vector3(-width, 0.14, 0);
  const ridge = new THREE.Vector3(0, 0, 0.24);
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([tip, right, ridge]), faceMaterial(palette, 0.3 * strength)));
  group.add(new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([tip, ridge, left]), faceMaterial(palette, 0.1 * strength)));
  group.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([tip, right, right, ridge, ridge, tip, tip, left, left, ridge]),
      lineMaterial(palette, 0.9 * strength),
    ),
  );
  return group;
}

/** A HUD ring: a circle with ticks, inside a tilted frame, spinning about its own axis. */
function makeRing(palette: Palette, radius: number, ticks: number, tilt: THREE.Euler) {
  const frame = new THREE.Group();
  frame.rotation.copy(tilt);
  const spinner = new THREE.Group();
  spinner.add(new THREE.LineLoop(circleGeometry(radius), lineMaterial(palette, 0.45)));
  spinner.add(new THREE.LineSegments(tickGeometry(radius, ticks, 0.07, ticks / 8, 0.16), lineMaterial(palette, 0.55)));
  frame.add(spinner);
  return { frame, spinner };
}

function build(palette: Palette) {
  const random = seededRandom(7);
  const root = new THREE.Group();
  const rose = new THREE.Group();
  root.add(rose);

  const pieces: Piece[] = POINTS.map((point) => {
    const object = makePoint(palette, point.length, point.width, point.strength);
    const baseZ = -THREE.MathUtils.degToRad(point.bearing);
    object.rotation.z = baseZ;
    rose.add(object);
    // Where it flies in from: far off in a random direction, tumbling.
    const from = new THREE.Vector3(random() - 0.5, random() - 0.5, random() * 0.6 - 0.1).normalize().multiplyScalar(6 + random() * 3);
    const spin = new THREE.Euler((random() - 0.5) * 6, (random() - 0.5) * 6, (random() - 0.5) * 6);
    return { object, from, spin, baseZ };
  });

  // Knotted center: a ring with four interlaced loops.
  const knot = new THREE.Group();
  knot.position.z = 0.26;
  knot.add(new THREE.LineLoop(circleGeometry(0.42, 64), lineMaterial(palette, 0.85)));
  for (let i = 0; i < 4; i++) {
    const loop = new THREE.LineLoop(circleGeometry(0.2, 48), lineMaterial(palette, 0.7));
    const a = (i * Math.PI) / 2;
    loop.position.set(Math.sin(a) * 0.21, Math.cos(a) * 0.21, 0);
    knot.add(loop);
  }
  rose.add(knot);

  // The needle: bright north half, dim south half, in front of the rose.
  const needle = new THREE.Group();
  needle.position.z = 0.42;
  const north = [new THREE.Vector3(0, 2.45, 0), new THREE.Vector3(0.11, 0, 0), new THREE.Vector3(-0.11, 0, 0)];
  const south = [new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(0.11, 0, 0), new THREE.Vector3(-0.11, 0, 0)];
  needle.add(new THREE.Mesh(new THREE.BufferGeometry().setFromPoints(north), faceMaterial(palette, 0.75)));
  needle.add(new THREE.Mesh(new THREE.BufferGeometry().setFromPoints(south), faceMaterial(palette, 0.25, palette.line)));
  needle.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([north[0], north[1], north[1], south[0], south[0], north[2], north[2], north[0]]),
      lineMaterial(palette, 1),
    ),
  );
  rose.add(needle);

  const rings = [
    makeRing(palette, 2.75, 72, new THREE.Euler(1.18, 0, 0)),
    makeRing(palette, 3.02, 48, new THREE.Euler(-1.22, 0.35, 0)),
  ];
  rings.forEach((ring) => root.add(ring.frame));

  // The lock-on flash: a ring that bursts outward once the rose assembles.
  const flashMaterial = lineMaterial(palette, 0);
  const flash = new THREE.LineLoop(circleGeometry(1, 96), flashMaterial);
  flash.visible = false;
  root.add(flash);

  const mainMaterials: THREE.Material[] = [];
  rose.traverse((node) => {
    const material = (node as THREE.Mesh).material as THREE.Material | undefined;
    if (material) mainMaterials.push(material);
  });
  const ringMaterials: THREE.Material[] = [];
  rings.forEach((ring) =>
    ring.frame.traverse((node) => {
      const material = (node as THREE.Mesh).material as THREE.Material | undefined;
      if (material) ringMaterials.push(material);
    }),
  );

  return { root, pieces, knot, needle, rings, flash, flashMaterial, mainMaterials, ringMaterials };
}

function Compass({ pointer, arrive }: Pick<SceneProps, "pointer" | "arrive">) {
  const palette = usePalette();
  const built = useMemo(() => build(palette), [palette]);
  // three.js objects change every frame, so the frame loop reaches them through a ref.
  const live = useRef(built);
  const [flicker] = useState(createFlicker);
  const phase = useRef<"wait" | "go" | "run" | "rest">(arrive ? "wait" : "rest");
  const startedAt = useRef(0);
  const tiltX = useRef<Spring>({ value: 0, velocity: 0 });
  const tiltY = useRef<Spring>({ value: 0, velocity: 0 });
  const heading = useRef<Spring>({ value: 0, velocity: 0 });

  useEffect(() => {
    live.current = built;
    return () => disposeAll([built.root]);
  }, [built]);
  // With the loading screen, the entrance waits until it clears.
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
    // Seconds since the entrance began; at rest it's long over, while waiting it hasn't begun.
    const since = phase.current === "rest" ? 99 : phase.current === "run" ? t - startedAt.current : -1;

    // Points fly in, staggered, and lock.
    scene.pieces.forEach((piece, i) => {
      const p = since < 0 ? 0 : easeOutBack((since - i * 0.07) / 0.85, 1.2);
      piece.object.visible = since >= i * 0.07;
      piece.object.position.copy(piece.from).multiplyScalar(1 - p);
      piece.object.rotation.set(piece.spin.x * (1 - p), piece.spin.y * (1 - p), piece.baseZ + piece.spin.z * (1 - p));
    });
    const settle = since < 0 ? 0 : easeOutBack((since - 0.7) / 0.6, 2);
    scene.knot.scale.setScalar(Math.max(settle, 0.001));
    scene.needle.scale.setScalar(Math.max(easeOutBack((since - 0.95) / 0.6, 2), 0.001));
    const ringsIn = since < 0 ? 0 : easeOutCubic((since - 0.2) / 1.1);
    scene.rings.forEach((ring, i) => {
      ring.frame.scale.setScalar(0.35 + 0.65 * ringsIn);
      ring.spinner.rotation.z += dt * (i === 0 ? 0.12 : -0.08);
    });

    // The lock-on flash.
    const burst = (since - 1.15) / 0.75;
    scene.flash.visible = burst > 0 && burst < 1;
    if (scene.flash.visible) {
      scene.flash.scale.setScalar(0.6 + 3 * easeOutCubic(burst));
      scene.flashMaterial.opacity = 0.9 * (1 - burst);
    }

    // The needle swings toward the cursor (or wanders without one), with the menu's wobble.
    const p = pointer.current;
    const target = p.seen ? Math.atan2(p.x, p.y) : Math.sin(t * 0.4) * 0.9;
    stepSpring(heading.current, heading.current.value + shortestTurn(heading.current.value, target), dt);
    scene.needle.rotation.z = -heading.current.value;

    // Float, sway, and lean toward the cursor.
    stepSpring(tiltY.current, p.seen ? THREE.MathUtils.clamp(p.x, -1.5, 1.5) * 0.3 : 0, dt, 40, 12);
    stepSpring(tiltX.current, p.seen ? THREE.MathUtils.clamp(-p.y, -1.5, 1.5) * 0.22 : 0, dt, 40, 12);
    scene.root.position.y = Math.sin(t * 0.8) * 0.07;
    scene.root.rotation.set(-0.12 + tiltX.current.value, Math.sin(t * 0.3) * 0.2 + tiltY.current.value, 0);

    // Hologram flicker, and a fade-in at the start of the entrance.
    const f = flicker(t) * (since < 0 ? 0 : clamp01(since / 0.3));
    setOpacity(scene.mainMaterials, f);
    setOpacity(scene.ringMaterials, f * ringsIn);
  });

  return <primitive object={built.root} />;
}

export default function CompassScene({ active, pointer, arrive, onReady }: SceneProps) {
  return (
    <SceneCanvas active={active} onReady={onReady}>
      <Compass pointer={pointer} arrive={arrive} />
    </SceneCanvas>
  );
}
