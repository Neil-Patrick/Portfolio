"use client";

import { Monitor } from "pixelarticons/react/Monitor.js";
import { Moon } from "pixelarticons/react/Moon.js";
import { Sun } from "pixelarticons/react/Sun.js";
import { useId, useLayoutEffect, useSyncExternalStore } from "react";
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

/* ---- UI ---- */

const iconProps = { width: 20, height: 20, "aria-hidden": true, focusable: false } as const;

const OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun {...iconProps} /> },
  { value: "dark", label: "Dark", icon: <Moon {...iconProps} /> },
  { value: "system", label: "System", icon: <Monitor {...iconProps} /> },
];

/** Three-way theme toggle, drawn as a sunken slot tray; the chosen option lights up. */
export function ThemeSwitcher() {
  const name = useId();
  // null on the server: no option is checked until the client knows the saved choice.
  const preference = useSyncExternalStore(subscribe, readPreference, () => null);

  // React Strict Mode (dev only) resets <html> attributes on remount; re-apply.
  useLayoutEffect(() => applyTheme(readPreference()), []);

  return (
    <fieldset className="pixel-slot flex w-fit p-pixel">
      <legend className="sr-only">Color theme</legend>
      {OPTIONS.map((option) => (
        <label
          key={option.value}
          title={option.label}
          className="grid size-11 cursor-pointer place-items-center text-ink hover:bg-panel has-checked:bg-accent has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={preference === option.value}
            onChange={() => setPreference(option.value)}
            className="sr-only"
          />
          {option.icon}
          <span className="sr-only">{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
