"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useId, useLayoutEffect, useSyncExternalStore } from "react";
import { Icon } from "./icons";
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

const OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Icon icon={Sun} /> },
  { value: "dark", label: "Dark", icon: <Icon icon={Moon} /> },
  { value: "system", label: "System", icon: <Icon icon={Monitor} /> },
];

/** Three-way theme toggle as a bordered segmented control. */
export function ThemeSwitcher() {
  const name = useId();
  // null on the server: no option is checked until the client knows the saved choice.
  const preference = useSyncExternalStore(subscribe, readPreference, () => null);

  // React Strict Mode (dev only) resets <html> attributes on remount; re-apply.
  useLayoutEffect(() => applyTheme(readPreference()), []);

  return (
    <fieldset className="flex w-fit gap-0.5 rounded-sm border border-line-strong p-0.5">
      <legend className="sr-only">Color Theme</legend>
      {OPTIONS.map((option) => (
        <label
          key={option.value}
          title={option.label}
          className="grid size-11 cursor-pointer place-items-center rounded-xs text-ink-muted hover:text-ink has-checked:bg-accent has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
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
