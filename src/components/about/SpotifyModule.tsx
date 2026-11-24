"use client";

import { useEffect, useState } from "react";
import { SpotifyLogo } from "./SpotifyLogo";
import type { SpotifyFeed, SpotifyTrack } from "@/lib/spotify";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { ConsoleModule } from "./ConsoleModule";

/** How often to ask again while the tab is visible. */
const POLL_MS = 45_000;

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });

/** "3 min. ago", "2 hr. ago", "yesterday": when a track was played. */
function playedAgo(iso: string) {
  const minutes = Math.round((Date.parse(iso) - Date.now()) / 60_000);
  if (minutes > -60) return relative.format(Math.min(minutes, -1), "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

/** Three teal bars bouncing like a level meter (still under reduced motion: globals.css, eq-bar). */
function Equalizer() {
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="eq-bar h-full w-0.5 bg-accent" style={{ animationDelay: `${i * -0.25}s` }} />
      ))}
    </span>
  );
}

/** Album art, unaltered as Spotify requires (no border or overlay; 4px corners, 8px when large). A plain <img>: a small thumbnail from Spotify's CDN doesn't need next/image. */
function Art({ track, className }: { track: SpotifyTrack; className: string }) {
  if (!track.image) return <span aria-hidden className={`shrink-0 border border-line-strong bg-surface ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={track.image} alt="" loading="lazy" className={`shrink-0 object-cover ${className}`} />;
}

/**
 * The About page's Spotify module, under the console: when a song is on, a
 * "Now Playing" deck with large art and a level meter; then the last five
 * tracks played, as a log with how long ago each one ran. Every track links to
 * Spotify. Polls /api/now-playing every 45 seconds while the tab is visible,
 * and renders nothing until there's data (or at all, if Spotify isn't set up).
 */
export function SpotifyModule() {
  const [feed, setFeed] = useState<SpotifyFeed | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (document.hidden) return;
      try {
        const response = await fetch("/api/now-playing");
        if (response.ok && !cancelled) setFeed(await response.json());
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

  if (!feed || (!feed.now && feed.recent.length === 0)) return null;
  const { now, recent } = feed;

  return (
    <section aria-label="Spotify" data-spotify={now ? "playing" : "idle"}>
      <ConsoleModule title={<SpotifyLogo className="h-7 w-auto" />} status={now ? "Live" : "Idle"} live={Boolean(now)}>
        {now && (
          <a href={now.url} {...newTab} className="group mb-8 flex items-center gap-4 sm:gap-6" data-now-playing>
            <span className="relative shrink-0 p-1.5 hud-corners">
              <Art track={now} className="size-20 rounded-sm sm:size-28 sm:rounded-md" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 hud-label text-sm text-accent">
                <Equalizer />
                Now Playing
              </span>
              <span className="mt-2 block font-display text-2xl leading-tight font-bold wrap-break-word group-hover:text-accent sm:text-3xl">
                {now.title}
              </span>
              <span className="mt-1 block text-ink-muted">{now.artist}</span>
            </span>
            <span className="sr-only">{NEW_TAB_NOTE}</span>
          </a>
        )}

        {recent.length > 0 && (
          <>
            <h3 className="mb-3 flex items-center gap-3 hud-label text-sm text-ink-muted">
              Recently Played
              <span aria-hidden className="h-px flex-1 bg-line" />
            </h3>
            {/* min-w-0 on the items, so a long title truncates instead of widening the page. */}
            <ol className="grid gap-2">
              {recent.map((track) => (
                <li key={track.playedAt} className="min-w-0">
                  <a href={track.url} {...newTab} className="group hud-row hud-row-link flex min-h-11 items-center gap-3 px-3 py-2">
                    <Art track={track} className="size-12 rounded-sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-lg leading-snug font-semibold">{track.title}</span>
                      <span className="block truncate text-sm text-ink-muted">{track.artist}</span>
                      {/* Phones: the time goes under the artist, so the title gets the full width. */}
                      <time dateTime={track.playedAt} className="mt-0.5 block hud-label text-xs text-ink-muted tabular-nums sm:hidden">
                        {playedAgo(track.playedAt)}
                      </time>
                    </span>
                    <time
                      aria-hidden
                      dateTime={track.playedAt}
                      className="hidden hud-label shrink-0 text-xs text-ink-muted tabular-nums sm:block"
                    >
                      {playedAgo(track.playedAt)}
                    </time>
                    <span className="sr-only">{NEW_TAB_NOTE}</span>
                  </a>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Spotify's guidelines: content links back to Spotify, with "Open Spotify" as the link text. */}
        <p className="mt-6 text-right">
          <a
            href="https://open.spotify.com"
            {...newTab}
            className="inline-flex min-h-11 items-center gap-2 hud-label text-sm text-accent underline underline-offset-4 hover:no-underline"
          >
            Open Spotify
            <span className="sr-only">{NEW_TAB_NOTE}</span>
          </a>
        </p>
      </ConsoleModule>
    </section>
  );
}
