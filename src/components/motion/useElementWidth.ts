"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The live width of an element, for SVG drawn in real pixels (so strokes,
 * dashes and circles never stretch). Starts at `fallback` on the server and
 * before the first measurement.
 */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}
