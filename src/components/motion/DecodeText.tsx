"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>";
const DURATION = 600;

/**
 * HUD "decode": the text briefly scrambles through random glyphs and settles
 * into place, left to right, once on mount. The server and first client render
 * show the real text, and screen readers only ever get the real text.
 * With reduced motion it stays still.
 */
export function DecodeText({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const settled = Math.floor(progress * text.length);
      setShown(
        [...text]
          .map((char, i) =>
            i < settled || char === " " ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join(""),
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setShown(text);
    };
  }, [text, reduceMotion]);

  return (
    <>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}
