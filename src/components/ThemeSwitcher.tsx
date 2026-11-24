"use client";

import { Moon, Sun, SunMoon, type LucideIcon } from "lucide-react";
import { useLayoutEffect, useState, useSyncExternalStore, type MouseEvent } from "react";
import { revealTheme } from "@/lib/theme-transition";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isThemePreference,
  type ThemePreference,
} from "@/lib/theme";
import { Icon } from "./icons";

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

/* ---- UI: the HUD mode chip ---- */

/** The cycle order, which is also the order of the ticks under the glyph. */
const MODES: ThemePreference[] = ["light", "dark", "system"];
const LABELS: Record<ThemePreference, string> = { light: "Light", dark: "Dark", system: "System" };
const GLYPHS: Record<ThemePreference, LucideIcon> = { light: Sun, dark: Moon, system: SunMoon };
const NEXT: Record<ThemePreference, ThemePreference> = { light: "dark", dark: "system", system: "light" };

/**
 * Theme control: a borderless HUD chip, the same shape as the compass. The
 * glyph shows the current mode (sun, moon, or both for System) and three ticks
 * underneath mark where it sits in the Light → Dark → System cycle. A click
 * glitches the glyph for a moment (globals.css, "glitch-press"), then the new
 * theme spreads out from the chip in a circle. A real button whose name says
 * the current theme and the next one.
 */
export function ThemeSwitcher() {
  // null on the server: the chip shows System until the client knows the saved choice.
  const preference = useSyncExternalStore(subscribe, readPreference, () => null);
  // Bumped on each click; the glyph's key, so the glitch replays every time.
  const [presses, setPresses] = useState(0);

  // React Strict Mode (dev only) resets <html> attributes on remount; re-apply.
  useLayoutEffect(() => applyTheme(readPreference()), []);

  const current = preference ?? "system";
  const next = NEXT[current];

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPresses((count) => count + 1);
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
      className="group grid size-11 shrink-0 place-content-center justify-items-center gap-1 rounded-sm text-ink transition-colors hover:text-accent"
    >
      <span key={presses} className={presses ? "glitch-press" : undefined}>
        <Icon icon={GLYPHS[current]} size={20} />
      </span>
      <span aria-hidden className="flex gap-0.5">
        {MODES.map((mode) => (
          <span
            key={mode}
            data-theme-tick={mode}
            data-active={mode === current || undefined}
            className={`h-0.5 w-1.5 transition-colors ${mode === current ? "bg-accent" : "bg-line-strong group-hover:bg-accent/40"}`}
          />
        ))}
      </span>
    </button>
  );
}
