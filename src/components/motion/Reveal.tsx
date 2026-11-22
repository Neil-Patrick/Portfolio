"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Slides in from the left instead, like lines printing on a HUD log. */
const itemLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Reveals its <RevealItem> children in sequence the first time it scrolls into
 * view. With reduced motion, CSS keeps every [data-reveal] element visible (globals.css).
 */
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "dl";
}) {
  const Component = as === "ul" ? motion.ul : as === "dl" ? motion.dl : motion.div;
  return (
    <Component
      className={className}
      variants={container}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
  from = "below",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  from?: "below" | "left";
}) {
  const Component = as === "li" ? motion.li : motion.div;
  return (
    <Component data-reveal className={className} variants={from === "left" ? itemLeft : item}>
      {children}
    </Component>
  );
}
