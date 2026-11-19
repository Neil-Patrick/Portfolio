"use client";

import { useMotionValueEvent, useReducedMotion, useSpring } from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { revealTheme } from "@/lib/theme-transition";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isThemePreference,
  type ThemePreference,
} from "@/lib/theme";

/* ---- Tiny store: localStorage + in-memory fallback, shared by all instances ---- */

const listeners = new Set<() => void>();
let fallback: ThemePreference = "system";

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return fallback;
  }
}

function setPreference(preference: ThemePreference) {
  fallback = preference;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage unavailable (private mode, blocked). The choice lasts for this page view.
  }
  applyTheme(preference);
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  // Keep other open tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(readPreference());
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

/* ---- UI: the sun-and-moon dial ---- */

const LABELS: Record<ThemePreference, string> = { light: "Light", dark: "Dark", system: "System" };
const NEXT: Record<ThemePreference, ThemePreference> = { light: "dark", dark: "system", system: "light" };
/** Dial angle for each stop: sun up, moon up, or both on the horizon (twilight). */
const STOP: Record<ThemePreference, number> = { light: 0, dark: 180, system: 270 };
/** Same feel as the compass needle: a turn with a slight wobble. */
const DIAL_SPRING = { stiffness: 170, damping: 14 };

/** Smallest forward (clockwise) turn from `current` to the stop's angle, so the dial never spins back. */
function forwardTo(current: number, stop: number) {
  return current + ((((stop - current) % 360) + 360) % 360);
}

/**
 * Theme control: a small sky dial. The sun and moon ride a disc behind a
 * horizon; each click turns it forward one stop (Light → Dark → System) and
 * the new theme spreads out from the dial in a circle. A real button whose
 * name says the current theme and the next one.
 */
export function ThemeSwitcher() {
  // null on the server: the dial shows System until the client knows the saved choice.
  const preference = useSyncExternalStore(subscribe, readPreference, () => null);
  const reduceMotion = useReducedMotion();
  const clipId = useId();
  const discRef = useRef<SVGGElement>(null);
  // Angle the markup is rendered with; afterwards the spring drives the disc directly.
  const [initialAngle] = useState(STOP.system);
  const angle = useSpring(initialAngle, DIAL_SPRING);
  const known = useRef(false);

  // React Strict Mode (dev only) resets <html> attributes on remount; re-apply.
  useLayoutEffect(() => applyTheme(readPreference()), []);

  useMotionValueEvent(angle, "change", (value) => {
    discRef.current?.setAttribute("transform", `rotate(${value} 12 13)`);
  });

  // Follow the preference (clicks, other tabs). The first known value jumps, so
  // the dial doesn't spin on page load.
  useEffect(() => {
    if (!preference) return;
    const target = forwardTo(angle.get(), STOP[preference]);
    if (!known.current || reduceMotion) angle.jump(target);
    else angle.set(target);
    known.current = true;
  }, [preference, reduceMotion, angle]);

  const current = preference ?? "system";
  const next = NEXT[current];

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    revealTheme(
      () => setPreference(next),
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      current,
      next,
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Color Theme: ${LABELS[current]}. Switch to ${LABELS[next]}`}
      title={`Color Theme: ${LABELS[current]}`}
      data-theme-stop={current}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-ink hover:border-accent"
    >
      <svg aria-hidden focusable={false} viewBox="0 0 24 24" width={28} height={28}>
        <defs>
          {/* Only the sky above the horizon shows: a body below it has set. */}
          <clipPath id={clipId}>
            <rect x={0} y={0} width={24} height={13} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <g ref={discRef} transform={`rotate(${initialAngle} 12 13)`}>
            {/* Sun, at the top of the disc */}
            <g className="text-accent">
              <circle cx={12} cy={5.5} r={2.4} className="fill-current" />
              <g className="stroke-current" strokeWidth={1.2} strokeLinecap="round">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <line key={deg} x1={12} y1={1.4} x2={12} y2={2.2} transform={`rotate(${deg} 12 5.5)`} />
                ))}
              </g>
            </g>
            {/* Moon, at the bottom (a crescent cut from a disc) */}
            <path
              d="M14.2 17.6a3.6 3.6 0 1 0 0 5.6 2.9 2.9 0 1 1 0-5.6z"
              className="fill-current"
              transform="rotate(180 12 20.4)"
            />
          </g>
        </g>
        {/* Horizon */}
        <line x1={3} y1={13.5} x2={21} y2={13.5} className="stroke-ink-muted" strokeWidth={1.2} strokeLinecap="round" />
        {/* "A" for automatic, under the horizon, only in the System stop */}
        <text
          x={12}
          y={21}
          textAnchor="middle"
          className={`fill-ink-muted text-[7px] font-semibold transition-opacity duration-300 ${current === "system" ? "opacity-100" : "opacity-0"}`}
        >
          A
        </text>
      </svg>
    </button>
  );
}
