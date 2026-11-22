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
  stepSpring,
  tickGeometry,
  type SceneProps,
  type Spring,
} from "./three-utils";

/**
 * Circuit Monolith: a slowly turning slab with teal circuit traces etched on
 * its faces (generated from a fixed seed, so it's the same on every visit).
 * Pulses of light race up the traces, faster as the cursor comes near, over a
 * holographic projector disc; now and then it glitches sideways.
 * Entrance: it rises from below with an overshoot and a shockwave at its base.
 */

const SIZE = { width: 1.3, height: 3, depth: 0.4 };
const GRID = 0.1;
const BASE_Y = -1.78;

/**
 * Circuit traces on one face, in face coordinates (u across, v up), walked on a
 * grid from the bottom edge upward with sideways jogs, ending in a small pad.
 * Returns line segments plus, for each vertex, its distance along the trace
 * (the pulse shader runs light along that).
 */
function traceFace(random: () => number, halfU: number, halfV: number, count: number) {
  const segments: number[] = [];
  const along: number[] = [];
  const margin = GRID;
  const columns = Math.floor(((halfU - margin) * 2) / GRID);
  for (let k = 0; k < count; k++) {
    let u = -halfU + margin + Math.floor(random() * (columns + 1)) * GRID;
    let v = -halfV;
    let distance = random() * 2; // stagger the pulses between traces
    const add = (u2: number, v2: number) => {
      const length = Math.hypot(u2 - u, v2 - v);
      segments.push(u, v, u2, v2);
      along.push(distance, distance + length);
      distance += length;
      u = u2;
      v = v2;
    };
    while (v < halfV - margin) {
      add(u, Math.min(v + GRID * (2 + Math.floor(random() * 5)), halfV - margin));
      if (v >= halfV - margin || random() < 0.12) break;
      const step = GRID * (1 + Math.floor(random() * 3)) * (random() < 0.5 ? -1 : 1);
      const u2 = THREE.MathUtils.clamp(u + step, -halfU + margin, halfU - margin);
      if (u2 !== u) add(u2, v);
    }
    // End pad: a small square.
    const s = GRID * 0.3;
    const pad = [u - s, v - s, u + s, v - s, u + s, v - s, u + s, v + s, u + s, v + s, u - s, v + s, u - s, v + s, u - s, v - s];
    for (let i = 0; i < pad.length; i += 4) {
      segments.push(pad[i], pad[i + 1], pad[i + 2], pad[i + 3]);
      along.push(distance, distance);
    }
  }
  return { segments, along };
}

/** Light pulses along the traces: a dim base line with bright packets moving up it. */
function pulseMaterial(palette: Palette) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: palette.accent.clone() },
      uPhase: { value: 0 },
      uFade: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float along;
      varying float vAlong;
      void main() {
        vAlong = along;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uPhase;
      uniform float uFade;
      varying float vAlong;
      void main() {
        float d = fract(vAlong * 0.55 - uPhase);
        float pulse = smoothstep(0.0, 0.03, d) * (1.0 - smoothstep(0.03, 0.22, d));
        gl_FragColor = vec4(uColor, (0.22 + pulse) * uFade);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

function build(palette: Palette) {
  const random = seededRandom(2026);
  const outer = new THREE.Group();
  // A touch larger than its geometry, so it holds its own next to the other visuals.
  outer.scale.setScalar(1.15);
  const root = new THREE.Group();
  outer.add(root);
  const slab = new THREE.Group();
  root.add(slab);

  // The slab: opaque, so traces on the far side stay hidden; a touch lighter than the page.
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(SIZE.width, SIZE.height, SIZE.depth),
    new THREE.MeshBasicMaterial({ color: palette.canvas.clone().lerp(palette.ink, palette.dark ? 0.07 : 0.08) }),
  );
  slab.add(body);
  slab.add(new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), lineMaterial(palette, 0.8)));

  // Traces on all four sides: broad faces get more.
  const halfW = SIZE.width / 2;
  const halfH = SIZE.height / 2;
  const halfD = SIZE.depth / 2;
  const lift = 0.004;
  const faces = [
    { origin: new THREE.Vector3(0, 0, halfD + lift), u: new THREE.Vector3(1, 0, 0), halfU: halfW, count: 9 },
    { origin: new THREE.Vector3(0, 0, -halfD - lift), u: new THREE.Vector3(-1, 0, 0), halfU: halfW, count: 9 },
    { origin: new THREE.Vector3(halfW + lift, 0, 0), u: new THREE.Vector3(0, 0, -1), halfU: halfD, count: 2 },
    { origin: new THREE.Vector3(-halfW - lift, 0, 0), u: new THREE.Vector3(0, 0, 1), halfU: halfD, count: 2 },
  ];
  const positions: number[] = [];
  const along: number[] = [];
  for (const face of faces) {
    const trace = traceFace(random, face.halfU, halfH, face.count);
    for (let i = 0; i < trace.segments.length; i += 2) {
      const point = face.origin
        .clone()
        .addScaledVector(face.u, trace.segments[i])
        .add(new THREE.Vector3(0, trace.segments[i + 1], 0));
      positions.push(point.x, point.y, point.z);
    }
    along.push(...trace.along);
  }
  const traceGeometry = new THREE.BufferGeometry();
  traceGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  traceGeometry.setAttribute("along", new THREE.Float32BufferAttribute(along, 1));
  const pulses = pulseMaterial(palette);
  slab.add(new THREE.LineSegments(traceGeometry, pulses));

  // Holographic projector disc at the base.
  const disc = new THREE.Group();
  disc.position.y = BASE_Y;
  disc.rotation.x = -Math.PI / 2;
  disc.add(new THREE.LineLoop(circleGeometry(0.95), lineMaterial(palette, 0.55)));
  disc.add(new THREE.LineLoop(circleGeometry(1.32), lineMaterial(palette, 0.35)));
  disc.add(new THREE.LineSegments(tickGeometry(1.32, 48, 0.06, 6, 0.14), lineMaterial(palette, 0.45)));
  disc.add(new THREE.Mesh(new THREE.CircleGeometry(1.32, 64), faceMaterial(palette, 0.05)));
  root.add(disc);

  // Shockwave when it lands.
  const shockMaterial = lineMaterial(palette, 0);
  const shock = new THREE.LineLoop(circleGeometry(1, 96), shockMaterial);
  shock.rotation.x = -Math.PI / 2;
  shock.position.y = BASE_Y;
  shock.visible = false;
  root.add(shock);

  const materials: THREE.Material[] = [];
  root.traverse((node) => {
    const material = (node as THREE.Mesh).material as THREE.Material | undefined;
    if (material && material !== pulses && material !== shockMaterial && material !== body.material) {
      materials.push(material);
    }
  });

  return { outer, root, slab, disc, pulses, shock, shockMaterial, materials };
}

function Monolith({ pointer, arrive }: Pick<SceneProps, "pointer" | "arrive">) {
  const palette = usePalette();
  const built = useMemo(() => build(palette), [palette]);
  // three.js objects change every frame, so the frame loop reaches them through a ref.
  const live = useRef(built);
  const [flicker] = useState(createFlicker);
  const phase = useRef<"wait" | "go" | "run" | "rest">(arrive ? "wait" : "rest");
  const startedAt = useRef(0);
  const glitch = useRef({ next: 5, until: 0, offset: 0 });
  const tiltX = useRef<Spring>({ value: 0, velocity: 0 });
  const tiltY = useRef<Spring>({ value: 0, velocity: 0 });

  useEffect(() => {
    live.current = built;
    return () => disposeAll([built.outer]);
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

    // It rises from below and lands with a little overshoot.
    const rise = since < 0 ? 0 : easeOutBack(since / 1.1, 1.3);
    scene.slab.position.y = -4.4 * (1 - rise);
    scene.slab.visible = since >= 0;
    scene.disc.scale.setScalar(Math.max(since < 0 ? 0 : easeOutCubic(since / 0.6), 0.001));
    const wave = (since - 0.75) / 0.8;
    scene.shock.visible = wave > 0 && wave < 1;
    if (scene.shock.visible) {
      scene.shock.scale.setScalar(0.8 + 2.4 * easeOutCubic(wave));
      scene.shockMaterial.opacity = 0.9 * (1 - wave);
    }

    // Turns once every 40 seconds; leans a little toward the cursor.
    scene.slab.rotation.y += dt * ((Math.PI * 2) / 40);
    const p = pointer.current;
    stepSpring(tiltY.current, p.seen ? THREE.MathUtils.clamp(p.x, -1.5, 1.5) * 0.18 : 0, dt, 40, 12);
    stepSpring(tiltX.current, p.seen ? THREE.MathUtils.clamp(-p.y, -1.5, 1.5) * 0.12 : 0, dt, 40, 12);
    scene.root.rotation.set(0.08 + tiltX.current.value, tiltY.current.value, 0);

    // Pulses race faster as the cursor nears the center.
    const near = p.seen ? clamp01(1 - Math.hypot(p.x, p.y)) : 0;
    scene.pulses.uniforms.uPhase.value += dt * (0.35 + 1.1 * near);

    // Now and then, a sideways glitch.
    const g = glitch.current;
    if (t > g.next) {
      g.until = t + 0.16;
      g.next = t + 5 + Math.random() * 4;
    }
    g.offset = t < g.until ? (Math.random() - 0.5) * 0.18 : 0;
    scene.slab.position.x = g.offset;

    const f = flicker(t) * (since < 0 ? 0 : clamp01(since / 0.3));
    setOpacity(scene.materials, f);
    scene.pulses.uniforms.uFade.value = f;
  });

  return <primitive object={built.outer} />;
}

export default function MonolithScene({ active, pointer, arrive, onReady }: SceneProps) {
  return (
    <SceneCanvas active={active} onReady={onReady}>
      <Monolith pointer={pointer} arrive={arrive} />
    </SceneCanvas>
  );
}
