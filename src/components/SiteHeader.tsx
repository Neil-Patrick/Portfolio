"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { site } from "@/content/site";
import { CompassMenu } from "./nav/CompassMenu";

/**
 * Top bar: name (home link) and the compass that opens the
 * site navigation (same at every screen size). Transparent at the top of the
 * page, so the home hero runs edge to edge; once scrolled it becomes a blurred
 * surface.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <header
      className={`sticky top-0 z-20 transition-colors duration-300 ${
        scrolled ? "bg-canvas/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-header items-center justify-between gap-4">
        <Link href="/" className="inline-flex min-h-11 min-w-0 items-center font-semibold">
          <span className="truncate">{site.name}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          <CompassMenu />
        </div>
      </div>
    </header>
  );
}
