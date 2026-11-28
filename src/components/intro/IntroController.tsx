"use client";

import { useLenis } from "lenis/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { sections, site } from "@/content/site";
import { INTRO_DONE_EVENT } from "@/lib/intro";

/** A click (or tap) anywhere, or any key, continues. Scrolling doesn't, so a stray swipe can't cut it short. */
const CONTINUE_EVENTS = ["click", "keydown"] as const;
/** The overlay's own end (globals.css, about 5.4s); a safety net past it, measured from page load. */
const SAFETY_MS = 6200;

/** Warms up what's heavy while the loader plays, so the page feels instant after it. */
function preload(router: ReturnType<typeof useRouter>) {
  const tasks: Promise<unknown>[] = [
    // The wave background's three.js scene (its own chunk).
    import("../background/WaveLines"),
    document.fonts?.ready ?? Promise.resolve(),
  ];
  // The landing's hologram avatar, so it can project in the moment the loader clears.
  const avatar = new Image();
  avatar.src = site.avatar.holo;
  tasks.push(avatar.decode().catch(() => undefined));
  // The other pages, so the first click elsewhere is quick.
  sections.filter((section) => section.href !== "/").forEach((section) => router.prefetch(section.href));
  return Promise.allSettled(tasks);
}

/**
 * Runs the loading screen's edges (the look and timeline are CSS):
 * - keeps the page still underneath while it plays;
 * - preloads the heavy parts meanwhile and marks the "Assets" row Ready;
 * - a click anywhere or any key continues (a quick fade);
 * - when it ends: marks it done (so navigating back home never replays it),
 *   restores scrolling, and announces `intro:done` for the landing's handoff.
 */
export function IntroController() {
  const lenis = useLenis();
  const router = useRouter();

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play" && root.dataset.intro !== "skip") return;
    const overlay = document.querySelector<HTMLElement>("[data-intro-overlay]");
    const assets = document.querySelector<HTMLElement>("[data-intro-assets]");
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
      CONTINUE_EVENTS.forEach((type) => window.removeEventListener(type, skip));
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
    CONTINUE_EVENTS.forEach((type) => window.addEventListener(type, skip));
    overlay?.addEventListener("animationend", onAnimationEnd);
    const timer = window.setTimeout(finish, Math.max(0, SAFETY_MS - performance.now()));
    preload(router).then(() => {
      if (assets) {
        assets.textContent = "Ready";
        assets.dataset.ready = "";
      }
    });

    // On a slow device the CSS may already have finished before this code ran.
    if (!overlay || !overlay.getAnimations().some((animation) => animation.playState === "running")) finish();

    return () => {
      if (!finished) release();
    };
  }, [lenis, router]);

  return null;
}
