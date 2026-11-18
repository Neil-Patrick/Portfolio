"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildNetwork, type NetworkLayout } from "./network-layout";

/**
 * Full-bleed 3D neural network for the home hero (lazy-loaded, client only).
 * Nodes and links slowly rotate, pulses travel along links like data flowing,
 * and the whole network leans toward the cursor. Colors come from the CSS
 * tokens so it follows light and dark mode.
 */

type Props = {
  /** Animate continuously. False renders a still frame (off-screen, hidden tab, reduced motion). */
  active: boolean;
  onReady?: () => void;
};

type Palette = { cert: THREE.Color; accent: THREE.Color; project: THREE.Color; line: THREE.Color };

const PULSES = 26;

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

/** Re-read the palette when the theme changes (switcher or OS setting). */
function usePalette() {
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

/** Soft round sprite so points render as glowing dots instead of squares. */
function useDotTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.9)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function Network({ layout, active, palette }: { layout: NetworkLayout; active: boolean; palette: Palette }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const dot = useDotTexture();
  const invalidate = useThree((state) => state.invalidate);

  // Cursor anywhere on the page (the hero text sits above the canvas).
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const nodeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(layout.nodes.flat(), 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(layout.nodes.length * 3), 3));
    return geometry;
  }, [layout]);

  const edgeGeometry = useMemo(() => {
    const positions = layout.edges.flatMap(([a, b]) => [...layout.nodes[a], ...layout.nodes[b]]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [layout]);

  // Each pulse travels one edge from start to end, then hops to another edge.
  const pulses = useMemo(
    () =>
      Array.from({ length: PULSES }, (_, i) => ({
        edge: (i * 7) % Math.max(layout.edges.length, 1),
        t: (i / PULSES) % 1,
        speed: 0.25 + ((i * 37) % 10) / 20,
      })),
    [layout],
  );
  const pulseGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(PULSES * 3), 3));
    return geometry;
  }, []);

  // Node colors from the theme.
  useEffect(() => {
    const colors = nodeGeometry.getAttribute("color") as THREE.BufferAttribute;
    const tones = [palette.cert, palette.accent, palette.project];
    layout.tones.forEach((tone, i) => colors.setXYZ(i, tones[tone].r, tones[tone].g, tones[tone].b));
    colors.needsUpdate = true;
    invalidate();
  }, [palette, layout, nodeGeometry, invalidate]);

  const placePulses = (advance: number) => {
    const positions = pulseGeometry.getAttribute("position") as THREE.BufferAttribute;
    pulses.forEach((pulse, i) => {
      pulse.t += advance * pulse.speed;
      if (pulse.t >= 1) {
        pulse.t -= 1;
        pulse.edge = (pulse.edge * 31 + 17 + i) % layout.edges.length;
      }
      const [a, b] = layout.edges[pulse.edge] ?? [0, 0];
      const [ax, ay, az] = layout.nodes[a];
      const [bx, by, bz] = layout.nodes[b];
      positions.setXYZ(i, ax + (bx - ax) * pulse.t, ay + (by - ay) * pulse.t, az + (bz - az) * pulse.t);
    });
    positions.needsUpdate = true;
  };

  useFrame((_, delta) => {
    if (!tilt.current || !spin.current) return;
    if (!active) {
      placePulses(0);
      return;
    }
    const step = Math.min(delta, 0.05); // avoid jumps after a paused tab
    spin.current.rotation.y += step * 0.05;
    // Lean toward the cursor, eased.
    tilt.current.rotation.x += (pointer.current.y * 0.18 - tilt.current.rotation.x) * 0.04;
    tilt.current.rotation.z += (-pointer.current.x * 0.06 - tilt.current.rotation.z) * 0.04;
    tilt.current.position.x += (pointer.current.x * 0.4 - tilt.current.position.x) * 0.04;
    placePulses(step);
  });

  return (
    <group ref={tilt}>
      <group ref={spin}>
        <lineSegments geometry={edgeGeometry}>
          {/* No depth writes, or the lines clip a notch out of the node glows. */}
          <lineBasicMaterial color={palette.line} transparent opacity={0.35} depthWrite={false} />
        </lineSegments>
        <points geometry={nodeGeometry}>
          <pointsMaterial
            size={0.32}
            map={dot}
            vertexColors
            transparent
            depthWrite={false}
            sizeAttenuation
          />
        </points>
        <points geometry={pulseGeometry}>
          <pointsMaterial size={0.22} map={dot} color={palette.accent} transparent depthWrite={false} sizeAttenuation />
        </points>
      </group>
    </group>
  );
}

export default function NeuralNetwork({ active, onReady }: Props) {
  // Fewer nodes on small screens: lighter to render, less visual noise.
  const [layout] = useState(() => buildNetwork(window.innerWidth < 768 ? 55 : 110));
  const palette = usePalette();

  return (
    <Canvas
      aria-hidden
      data-hero-canvas
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 9], fov: 55 }}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={() => onReady?.()}
    >
      <Network layout={layout} active={active} palette={palette} />
    </Canvas>
  );
}
