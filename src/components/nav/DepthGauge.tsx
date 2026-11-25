"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { RingMark } from "../RingNode";

/**
 * "Depth gauge": an on-page index for the home page. A hairline on the right
 * edge carries one tick per section (like the compass dial's ticks), and a
 * teal circle (the site's node shape) springs to the section being read.
 * Ticks are plain hash links; Lenis smooth-scrolls them below the header.
 * Hidden below `lg`, where it would crowd the content.
 */

type Item = { id: string; label: string };

/** Row height = touch-target size. */
const ROW = 44;
/** Half the circle (14px), so its center sits on the row center. */
const HALF = 7;
/** Same feel as the compass needle. */
const SPRING = { stiffness: 170, damping: 13 };

export function DepthGauge({ items }: { items: Item[] }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const markerY = useSpring(ROW / 2 - HALF, SPRING);
  const fillHeight = useTransform(markerY, (y) => Math.max(y + HALF - ROW / 2, 0));

  // The current section is the last one whose top has passed a line a third of
  // the way down the screen. Checked at most once per frame while scrolling.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let index = 0;
      items.forEach((item, i) => {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= line) index = i;
      });
      setActive(index);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  useEffect(() => {
    const target = active * ROW + ROW / 2 - HALF;
    if (reduceMotion) markerY.jump(target);
    else markerY.set(target);
  }, [active, reduceMotion, markerY]);

  return (
    <nav
      aria-label="On This Page"
      className="fixed top-1/2 right-2 z-10 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative w-11">
        {/* The gauge line, through the middle of every row. */}
        <span aria-hidden className="absolute inset-y-[22px] left-1/2 w-px -translate-x-1/2 bg-line-strong" />
        <ul>
          {items.map((item, i) => {
            const current = i === active;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={current ? "location" : undefined}
                  className="group relative flex size-11 items-center justify-center outline-none"
                >
                  {/* Tick, reaching left from the line; longer for the current section. */}
                  <span
                    aria-hidden
                    className={`absolute top-1/2 right-1/2 h-px transition-[width,background-color] duration-300 ${
                      current ? "w-3.5 bg-accent" : "w-2 bg-line-strong group-hover:bg-ink-muted"
                    }`}
                  />
                  {/* Label: shown only on hover or keyboard focus. */}
                  <span
                    className={`pointer-events-none absolute right-full mr-1 rounded-xs bg-canvas/85 px-2 py-0.5 text-xs whitespace-nowrap tracking-widest opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none ${
                      current ? "text-accent" : "text-ink-muted"
                    }`}
                  >
                    {item.label}
                  </span>
                  {/* Focus ring around the hit area. */}
                  <span
                    aria-hidden
                    className="absolute inset-1 rounded-full group-focus-visible:outline-2 group-focus-visible:outline-focus"
                  />
                </a>
              </li>
            );
          })}
        </ul>
        {/* Teal fill from the first row down to the circle, as on the other pages' scroll rail. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-[22px] left-1/2 w-px -translate-x-1/2 bg-accent"
          style={{ height: fillHeight }}
        />
        {/* The needle tip: springs to the current section. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 drop-shadow-glow"
          style={{ y: markerY, x: "-50%" }}
        >
          <RingMark className="size-3.5" />
        </motion.span>
      </div>
    </nav>
  );
}
