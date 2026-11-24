/**
 * The home page's cyberpunk loading screen (src/components/intro/).
 *
 * State lives on <html data-intro>:
 * - "play": the loader is running (set before first paint by introInitScript,
 *   which runs in the root layout's <head>);
 * - "skip": the visitor skipped it (a quick fade);
 * - "done": it finished.
 * No attribute: no loader on this visit (another page, reduced motion, the
 * skip mark below, or no JavaScript).
 */

/** A sessionStorage mark that skips the loader. The site never sets it; the UI tests do, to keep it out of their way. */
export const INTRO_SEEN_KEY = "intro-seen";
export const INTRO_DONE_EVENT = "intro:done";

/**
 * Runs in <head> while the HTML is parsed, before anything paints, so the page
 * never flashes before the loader (whose markup comes first in <body>, before
 * the header). Home page only; plays on every full load (a refresh included),
 * but not when navigating to Home within the site. `?intro` plays it even with
 * the skip mark. Never plays with reduced motion. Must stay plain ES5 with no imports.
 */
export const introInitScript = `(function(){try{if(location.pathname!=="/")return;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;var k=${JSON.stringify(
  INTRO_SEEN_KEY,
)},force=/[?&]intro(=|&|$)/.test(location.search);if(!force&&sessionStorage.getItem(k))return;document.documentElement.setAttribute("data-intro","play")}catch(e){}})()`;

/** True while the loader is on screen. Client only. */
export function introRunning() {
  const state = document.documentElement.dataset.intro;
  return state === "play" || state === "skip";
}

/**
 * Calls `callback` once the loader has cleared, or right away when it isn't
 * running. Returns a cleanup that cancels the wait. Client only.
 */
export function whenIntroDone(callback: () => void) {
  if (!introRunning()) {
    callback();
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener(INTRO_DONE_EVENT, handler, { once: true });
  return () => window.removeEventListener(INTRO_DONE_EVENT, handler);
}
