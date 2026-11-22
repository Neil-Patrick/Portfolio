"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { INTRO_DONE_EVENT } from "@/lib/intro";

/** Inputs that skip the loading screen. */
const SKIP_EVENTS = ["keydown", "pointerdown", "wheel", "touchstart"] as const;
/** The overlay's own end (globals.css); a safety net past it, measured from page load. */
const SAFETY_MS = 3600;

/**
 * Runs the loading screen's edges (the look and timeline are CSS):
 * - keeps the page still underneath while it plays;
 * - any key, click, wheel, or touch skips it (a quick fade);
 * - when it ends: marks it done (so navigating back home never replays it),
 *   restores scrolling, and announces `intro:done` for the landing's handoff.
 */
export function IntroController() {
  const lenis = useLenis();

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play" && root.dataset.intro !== "skip") return;
    const overlay = document.querySelector<HTMLElement>("[data-intro-overlay]");
    const previousOverflow = root.style.overflow;
    let finished = false;

    const skip = () => {
      if (root.dataset.intro === "play") root.dataset.intro = "skip";
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === overlay && (event.animationName === "intro-out" || event.animationName === "intro-skip")) {
        finish();
      }
    };
    const release = () => {
      SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip));
      overlay?.removeEventListener("animationend", onAnimationEnd);
      window.clearTimeout(timer);
      root.style.overflow = previousOverflow;
      lenis?.start();
    };
    function finish() {
      if (finished) return;
      finished = true;
      release();
      root.dataset.intro = "done";
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
    }

    root.style.overflow = "hidden";
    lenis?.stop();
    SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { passive: true }));
    overlay?.addEventListener("animationend", onAnimationEnd);
    const timer = window.setTimeout(finish, Math.max(0, SAFETY_MS - performance.now()));

    // On a slow device the CSS may already have finished before this code ran.
    if (!overlay || !overlay.getAnimations().some((animation) => animation.playState === "running")) finish();

    return () => {
      if (!finished) release();
    };
  }, [lenis]);

  return null;
}
