"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { whenIntroDone } from "@/lib/intro";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>";
const DURATION = 600;

/**
 * HUD "decode": the text briefly scrambles through random glyphs and settles
 * into place, left to right, once. By default it runs on mount; with `inView`
 * it waits until the text scrolls into view. The server and first client
 * render show the real text, and screen readers only ever get the real text.
 * With reduced motion it stays still.
 */
export function DecodeText({ text, inView = false }: { text: string; inView?: boolean }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const [shown, setShown] = useState(text);
  const start = inView ? seen : true;

  useEffect(() => {
    if (reduceMotion || !start) return;
    let frame = 0;
    let begin = 0;
    const tick = (now: number) => {
      begin ||= now;
      const progress = Math.min((now - begin) / DURATION, 1);
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
    // On the home page's first visit, wait for the loading screen to clear, so the decode is seen.
    const stopWaiting = whenIntroDone(() => {
      frame = requestAnimationFrame(tick);
    });
    return () => {
      stopWaiting();
      cancelAnimationFrame(frame);
      setShown(text);
    };
  }, [text, reduceMotion, start]);

  return (
    <span ref={ref}>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
