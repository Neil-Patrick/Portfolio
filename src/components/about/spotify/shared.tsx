"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { SpotifyFeed, SpotifyTrack } from "@/lib/spotify";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { SpotifyLogo } from "../SpotifyLogo";

/** How often to ask again while the tab is visible. */
const POLL_MS = 45_000;

/** The feed from /api/now-playing, polled every 45 seconds while the tab is visible. Null until the first answer. */
export function useSpotifyFeed() {
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

  return feed;
}

/** True when the feed has anything to show. */
export const hasTracks = (feed: SpotifyFeed | null): feed is SpotifyFeed =>
  Boolean(feed && (feed.now || feed.recent.length > 0));

export type Station = {
  key: string;
  /** "LIVE" for the song playing now, otherwise 1–5. */
  preset: string;
  track: SpotifyTrack;
  playedAt?: string;
};

/**
 * The songs a variant can "load": the one playing now (if any), then the last
 * five. Holds which one is loaded; it falls back to the first when the chosen
 * one drops off the list after a refresh.
 */
export function useStations(feed: SpotifyFeed) {
  const [selected, setSelected] = useState<string | null>(null);
  const stations: Station[] = [
    ...(feed.now ? [{ key: "live", preset: "LIVE", track: feed.now }] : []),
    ...feed.recent.map((track, i) => ({ key: track.playedAt, preset: String(i + 1), track, playedAt: track.playedAt })),
  ];
  const current = stations.find((s) => s.key === selected) ?? stations[0];
  return { stations, current, select: setSelected, onAir: Boolean(feed.now) };
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });

/** "3 min. ago", "2 hr. ago", "yesterday": when a track was played. */
export function playedAgo(iso: string) {
  const minutes = Math.round((Date.parse(iso) - Date.now()) / 60_000);
  if (minutes > -60) return relative.format(Math.min(minutes, -1), "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

/**
 * Album art, unaltered as Spotify requires: no border, overlay, crop or
 * animation; 4px corners, 8px when large. A plain <img>: a small thumbnail
 * from Spotify's CDN doesn't need next/image.
 */
export function Art({ track, className = "size-24 rounded-sm sm:size-32 sm:rounded-md" }: { track: SpotifyTrack; className?: string }) {
  if (!track.image) return <span aria-hidden className={`shrink-0 border border-line-strong bg-canvas ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={track.image} alt="" className={`shrink-0 object-cover ${className}`} data-spotify-art />;
}

/** The block's header: the official logo as the heading, a hairline, then a status readout. */
export function SpotifyHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h2 className="flex items-center">
        <SpotifyLogo className="h-7 w-auto" />
      </h2>
      <span aria-hidden className="h-px min-w-8 flex-1 bg-line" />
      {children}
    </div>
  );
}

/** Spotify's guidelines: content links back to Spotify, with "Open Spotify" as the link text. */
export function OpenSpotifyLink() {
  return (
    <a
      href="https://open.spotify.com"
      {...newTab}
      className="inline-flex min-h-11 items-center hud-label text-sm text-accent underline underline-offset-4 hover:no-underline"
    >
      Open Spotify
      <span className="sr-only">{NEW_TAB_NOTE}</span>
    </a>
  );
}

/** The track id from an open.spotify.com/track/<id> link. */
export function trackId(url: string) {
  return url.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/)?.[1] ?? null;
}

export const buttonClass =
  "hud-notch hud-notch-edge inline-flex min-h-11 items-center justify-center gap-2 border border-line-strong bg-canvas px-4 hud-label text-sm transition-colors hover:border-accent hover:text-accent hover:[--edge:var(--color-accent)] focus-visible:-outline-offset-4 disabled:pointer-events-none disabled:opacity-40";

/**
 * A song preview through Spotify's official embed player (Spotify no longer
 * gives new apps preview clips). Rendered only after the visitor asks, so
 * nothing from Spotify loads before that. It plays a 30-second preview, or
 * the full song for visitors signed in to Spotify, and always stays visible.
 */
export function SpotifyEmbed({ track, height = 152 }: { track: SpotifyTrack; height?: number }) {
  const id = trackId(track.url);
  if (!id) return null;
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${id}?theme=0`}
      title={`Spotify preview: ${track.title} by ${track.artist}`}
      width="100%"
      height={height}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      className="block h-full w-full rounded-md border-0"
      data-spotify-preview
    />
  );
}

/** Four signal bars, bouncing while something is on air (still under reduced motion: globals.css, eq-bar). */
export function SignalBars() {
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-0.5">
      {[0.4, 0.6, 0.8, 1].map((height, i) => (
        <span key={i} className="eq-bar w-1 bg-accent" style={{ height: `${height * 100}%`, animationDelay: `${i * -0.25}s` }} />
      ))}
    </span>
  );
}

/** "On Air" with a pulsing lamp and signal bars while a song plays; "Off Air" with a still lamp otherwise. */
export function OnAirStatus({ onAir }: { onAir: boolean }) {
  return (
    <span className={`flex items-center gap-2 hud-label text-sm ${onAir ? "text-accent" : "text-ink-muted"}`} data-on-air={onAir}>
      <span aria-hidden className={`size-2 ${onAir ? "live-pulse bg-accent" : "bg-line-strong"}`} />
      {onAir ? "On Air" : "Off Air"}
      {onAir && <SignalBars />}
    </span>
  );
}
