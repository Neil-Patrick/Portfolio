/**
 * The home page's cyberpunk loading screen (src/components/intro/).
 *
 * State lives on <html data-intro>:
 * - "play": the loader is running (set before first paint by introInitScript);
 * - "skip": the visitor skipped it (a quick fade);
 * - "done": it finished.
 * No attribute: no loader on this visit (already seen in this tab, reduced
 * motion, or no JavaScript).
 */

export const INTRO_SEEN_KEY = "intro-seen";
export const INTRO_DONE_EVENT = "intro:done";

/**
 * Runs while the HTML is parsed, just before the loader's markup, so the page
 * never flashes before the loader. Plays once per tab; `?intro` replays it.
 * Never plays with reduced motion. Must stay plain ES5 with no imports.
 */
export const introInitScript = `(function(){try{if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;var k=${JSON.stringify(
  INTRO_SEEN_KEY,
)},force=/[?&]intro(=|&|$)/.test(location.search);if(!force&&sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1");document.documentElement.setAttribute("data-intro","play")}catch(e){}})()`;

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
