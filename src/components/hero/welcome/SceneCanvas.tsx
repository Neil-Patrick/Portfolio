"use client";

import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

/**
 * The canvas every welcome scene renders into: transparent, a narrow
 * perspective camera looking at the origin, sharp on high-DPI screens, and
 * paused (one still frame) when `active` is false.
 */
export function SceneCanvas({
  active,
  onReady,
  children,
}: {
  active: boolean;
  onReady?: () => void;
  children: ReactNode;
}) {
  return (
    <Canvas
      aria-hidden
      data-welcome-canvas
      camera={{ position: [0, 0, 11], fov: 32 }}
      dpr={[1, 2]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={() => onReady?.()}
      style={{ position: "absolute", inset: 0 }}
    >
      {children}
    </Canvas>
  );
}
