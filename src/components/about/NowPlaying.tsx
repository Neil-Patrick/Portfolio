"use client";

import { useEffect, useState } from "react";
import type { NowPlaying as NowPlayingData } from "@/lib/spotify";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";

/** How often to ask again while the tab is visible. */
const POLL_MS = 45_000;

/**
 * About page "At a Glance" readout of what Neil is listening to on Spotify:
 * album art, song, artist, and a small teal equalizer while it's playing
 * ("Last Played" otherwise). Polls /api/now-playing every 45 seconds while the
 * tab is visible. Renders nothing until there's a track, or if Spotify isn't
 * set up, so the panel never shows an empty slot.
 */
export function NowPlaying() {
  const [data, setData] = useState<NowPlayingData>({ status: "off" });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (document.hidden) return;
      try {
        const response = await fetch("/api/now-playing");
        if (response.ok && !cancelled) setData(await response.json());
      } catch {
        // Offline or the route failed: keep what's shown.
      }
    };
    load();
    const timer = window.setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  if (data.status === "off") return null;
  const playing = data.status === "playing";

  return (
    <dl className="mt-5 border-t border-line pt-5" data-now-playing={data.status}>
      <dt className="flex items-center gap-2 hud-label text-sm text-ink-muted">
        {playing && (
          <span aria-hidden className="flex h-3 items-end gap-0.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="eq-bar h-full w-0.5 bg-accent" style={{ animationDelay: `${i * -0.3}s` }} />
            ))}
          </span>
        )}
        {playing ? "Now Playing" : "Last Played"}
      </dt>
      <dd className="mt-2">
        <a href={data.url} {...newTab} className="group flex items-center gap-3">
          {data.image && (
            // A plain <img>: a 48px album thumbnail from Spotify's CDN doesn't need next/image's optimizer.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.image} alt="" width={48} height={48} loading="lazy" className="size-12 shrink-0 border border-line-strong object-cover" />
          )}
          <span className="min-w-0">
            <span className="block truncate font-display text-lg leading-snug font-semibold text-accent group-hover:underline">
              {data.title}
            </span>
            <span className="block truncate text-sm text-ink-muted">
              {data.artist}, on Spotify
            </span>
          </span>
          <span className="sr-only">{NEW_TAB_NOTE}</span>
        </a>
      </dd>
    </dl>
  );
}
