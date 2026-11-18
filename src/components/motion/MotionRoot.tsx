"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * App-wide motion settings:
 * - Motion follows the visitor's reduced-motion setting (transforms become instant).
 * - Lenis smooth scrolling runs only when motion is welcome. Anchor links scroll
 *   smoothly too and stop below the sticky header (scroll-padding-top).
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      {reduceMotion ? (
        children
      ) : (
        // anchors: smooth-scroll hash links. Lenis honors html's scroll-padding-top
        // (the header height), so no extra offset is needed.
        <ReactLenis root options={{ lerp: 0.1, anchors: true }}>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
