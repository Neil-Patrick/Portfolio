import type { ThemePreference } from "./theme";

/**
 * Theme changes reveal themselves as a circle spreading out from the theme
 * control (View Transitions API). Browsers without it, and visitors who prefer
 * reduced motion, get an instant switch. The CSS half lives in globals.css
 * ("Theme reveal").
 */

/** The theme a preference actually shows right now ("system" resolves through the OS). */
export function resolvedTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Runs `apply` (which must change the theme synchronously) inside a circular
 * reveal centered on `origin`. Skips the effect when the visible theme won't
 * change, e.g. switching to System when the OS already matches.
 */
export function revealTheme(
  apply: () => void,
  origin: { x: number; y: number },
  from: ThemePreference,
  to: ThemePreference,
) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduceMotion || resolvedTheme(from) === resolvedTheme(to)) {
    apply();
    return;
  }

  const transition = document.startViewTransition(apply);
  // Radius that reaches the farthest corner of the viewport from the origin.
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {
      // Transition skipped (e.g. tab hidden): the theme is already applied.
    });
}
