/**
 * Theme preference shared by the inline <head> script and the ThemeSwitcher.
 *
 * "light" / "dark" set data-theme on <html>. "system" removes it, so CSS
 * (color-scheme + light-dark() in globals.css) follows the OS setting live.
 */

export const THEME_STORAGE_KEY = "theme";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === "string" &&
    (THEME_PREFERENCES as readonly string[]).includes(value)
  );
}

export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", preference);
}

/**
 * Runs synchronously in <head> before first paint, so a saved light/dark
 * choice never flashes the wrong theme. Must stay plain ES5 with no imports.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
