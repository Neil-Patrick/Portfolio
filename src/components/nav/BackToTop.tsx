"use client";

import { useLenis } from "lenis/react";
import { ChevronUp } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Icon } from "../icons";

/** Shows once the visitor is past this share of the page's scroll. */
const SHOW_AFTER = 0.5;

/**
 * Back-to-top control, bottom right on every page. It appears once you're
 * past the middle of the page: a circle node (the shape the site uses for
 * points in a sequence, like the scroll rail and the credential carousel) whose
 * teal outline traces how far down you are, glowing softly on hover. A click
 * glides back to the top (Lenis), or jumps there with reduced motion, and
 * moves focus to the top of the content so keyboard users carry on from there.
 */
export function BackToTop() {
  const lenis = useLenis();
  const { scrollYProgress } = useScroll();
  const [shown, setShown] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (progress) => setShown(progress > SHOW_AFTER));

  const toTop = () => {
    document.getElementById("main")?.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0 });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to Top"
      title="Back to Top"
      inert={!shown}
      data-shown={shown || undefined}
      data-back-to-top
      className="group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-12 place-items-center text-ink transition-[opacity,translate,color] duration-300 ease-out hover:text-accent focus-visible:text-accent not-data-shown:pointer-events-none not-data-shown:translate-y-2 not-data-shown:opacity-0 sm:right-6"
    >
      {/* The circle: a dark face, a hairline track, and a teal line that fills with your scroll progress. */}
      <svg
        aria-hidden
        className="glow-node pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="47" vectorEffect="non-scaling-stroke" className="fill-canvas/90 stroke-line-strong" strokeWidth={1} />
        {/* Starts at 12 o'clock and runs clockwise. */}
        <motion.circle
          cx="50"
          cy="50"
          r="47"
          transform="rotate(-90 50 50)"
          vectorEffect="non-scaling-stroke"
          className="stroke-accent"
          strokeWidth={1.5}
          style={{ pathLength: scrollYProgress }}
        />
      </svg>
      <Icon icon={ChevronUp} className="relative transition-transform motion-safe:group-hover:-translate-y-0.5" />
    </button>
  );
}
