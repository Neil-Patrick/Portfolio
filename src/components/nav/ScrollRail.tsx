"use client";

import { useLenis } from "lenis/react";
import { motion, useScroll, useTransform } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { homeIndex } from "@/content/site";
import { RingMark } from "../RingNode";
import { DepthGauge } from "./DepthGauge";

/** The rail's height: a third of the screen, never cramped or huge. */
const RAIL = "clamp(10rem, 34vh, 20rem)";

/**
 * The site's scrollbar (the browser's own is hidden), on the right edge of
 * every page at desktop widths. Home shows the depth gauge (a tick per
 * section). Every other page gets a progress rail: a hairline track that
 * fills teal down to a glowing circle which follows your scroll. Like a
 * scrollbar, click anywhere on the rail to jump there or drag the circle.
 * Mouse only: keyboard and screen reader users scroll the page as usual, so
 * the progress rail is hidden from assistive tech. Hidden on short pages that
 * don't scroll, and below `lg`, where it would crowd the content.
 */
export function ScrollRail() {
  const pathname = usePathname();
  if (pathname === "/") return <DepthGauge items={homeIndex} />;
  return <ProgressRail key={pathname} />;
}

function ProgressRail() {
  const lenis = useLenis();
  const { scrollYProgress } = useScroll();
  const track = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);
  const [dragging, setDragging] = useState(false);
  const top = useTransform(scrollYProgress, (p) => `${p * 100}%`);
  const fill = useTransform(scrollYProgress, (p) => p);

  // Only show when the page is taller than the screen (rechecked as content loads).
  useEffect(() => {
    const check = () => setScrolls(document.documentElement.scrollHeight > window.innerHeight + 40);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(document.body);
    window.addEventListener("resize", check);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  const scrollToPointer = (event: PointerEvent<HTMLDivElement>, smooth: boolean) => {
    const rect = track.current!.getBoundingClientRect();
    const share = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    const y = share * (document.documentElement.scrollHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(y, { immediate: !smooth });
    else window.scrollTo({ top: y, behavior: smooth ? "smooth" : "instant" });
  };

  if (!scrolls) return null;

  return (
    <div
      aria-hidden
      data-scroll-rail
      className="fixed top-1/2 right-2 z-10 hidden -translate-y-1/2 lg:block"
    >
      <div
        ref={track}
        className="group cursor-hand-open relative w-11 touch-none"
        style={{ height: RAIL }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
          scrollToPointer(event, true);
        }}
        onPointerMove={(event) => dragging && scrollToPointer(event, false)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* Track, end caps, and the teal fill down to the circle. */}
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line-strong transition-colors group-hover:bg-ink-muted" />
        <span className="absolute top-0 left-1/2 h-px w-2.5 -translate-x-1/2 bg-line-strong" />
        <span className="absolute bottom-0 left-1/2 h-px w-2.5 -translate-x-1/2 bg-line-strong" />
        <motion.span
          className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 origin-top bg-accent"
          style={{ scaleY: fill }}
        />
        {/* The circle: follows the scroll, glows, grows a little while held. */}
        <motion.span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top }}>
          <span
            className={`block drop-shadow-glow transition-transform duration-200 ${dragging ? "scale-150" : "group-hover:scale-125"}`}
          >
            <RingMark className="size-3.5" filled={dragging} />
          </span>
        </motion.span>
      </div>
    </div>
  );
}
