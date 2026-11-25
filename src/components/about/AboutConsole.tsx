"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type ConsolePanel = {
  /** Also the URL hash that opens it (/about#github). */
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * The About page's console: a strip of tabs on the top edge of one HUD module
 * at a time. Real WAI-ARIA tabs (arrow keys, Home and End; only the active tab
 * is in the tab order). The open tab lives in the URL hash (pushState, so Back
 * works and the page doesn't jump); no hash opens the first one. Every panel is
 * rendered on the server and passed in, so the GitHub data stays a cached
 * server component; inactive panels are `hidden`.
 */
export function AboutConsole({ panels }: { panels: ConsolePanel[] }) {
  const [active, setActive] = useState(panels[0].id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Follow the hash on arrival and on back/forward.
  useEffect(() => {
    const fromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      setActive(panels.some((panel) => panel.id === hash) ? hash : panels[0].id);
    };
    fromHash();
    window.addEventListener("popstate", fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("popstate", fromHash);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [panels]);

  const open = (id: string) => {
    if (id === active) return;
    setActive(id);
    window.history.pushState(null, "", `#${id}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = panels.findIndex((panel) => panel.id === active);
    const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: panels.length - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = (target + panels.length) % panels.length;
    open(panels[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="About sections" onKeyDown={onKeyDown}
        // Phones: one row of three equal tabs (labels may wrap); wider: tabs sized to their labels.
        className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:gap-2"
      >
        {panels.map((panel, i) => {
          const selected = panel.id === active;
          return (
            <button
              key={panel.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${panel.id}`}
              aria-selected={selected}
              aria-controls={`panel-${panel.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => open(panel.id)}
              className={`hud-notch hud-notch-edge inline-flex min-h-11 items-center justify-center border px-2 py-1.5 text-center hud-label text-xs leading-tight transition-colors focus-visible:-outline-offset-4 sm:px-4 sm:text-sm ${
                selected
                  ? "border-accent bg-accent text-on-accent focus-visible:outline-on-accent"
                  : "border-line-strong text-ink-muted hover:border-accent hover:text-accent hover:[--edge:var(--color-accent)]"
              }`}
            >
              {panel.label}
            </button>
          );
        })}
      </div>
      {/* A hairline under the tab strip (open layout: no box around the panels). */}
      <span aria-hidden className="mt-3 block h-px bg-line" />

      {panels.map((panel) => (
        <div
          key={panel.id}
          role="tabpanel"
          id={`panel-${panel.id}`}
          aria-labelledby={`tab-${panel.id}`}
          hidden={panel.id !== active}
          data-panel={panel.id}
          className="mt-10"
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}
