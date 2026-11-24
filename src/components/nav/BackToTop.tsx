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
 * past the middle of the page: a HUD square with corner brackets whose teal
 * outline traces how far down you are. A click glides back to the top (Lenis),
 * or jumps there with reduced motion, and moves focus to the top of the
 * content so keyboard users carry on from there.
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
      className="group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-11 place-items-center bg-canvas/85 text-ink backdrop-blur-md transition-[opacity,translate,color] duration-300 ease-out hud-corners hover:text-accent not-data-shown:pointer-events-none not-data-shown:translate-y-2 not-data-shown:opacity-0 sm:right-6"
    >
      {/* Progress outline: a hairline square that fills with teal as you scroll down. */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 44 44" fill="none">
        <rect x={0.5} y={0.5} width={43} height={43} className="stroke-line" strokeWidth={1} />
        <motion.rect
          x={0.5}
          y={0.5}
          width={43}
          height={43}
          className="stroke-accent"
          strokeWidth={1.5}
          style={{ pathLength: scrollYProgress }}
        />
      </svg>
      <Icon icon={ChevronUp} className="transition-transform motion-safe:group-hover:-translate-y-0.5" />
    </button>
  );
}
