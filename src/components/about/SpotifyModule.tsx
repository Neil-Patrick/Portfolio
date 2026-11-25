"use client";

import { useEffect, useState } from "react";
import { SpotifyLogo } from "./SpotifyLogo";
import type { SpotifyFeed, SpotifyTrack } from "@/lib/spotify";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";

/** How often to ask again while the tab is visible. */
const POLL_MS = 45_000;

/** The dial's band. Station frequencies are decoration, spread evenly across it. */
const BAND = { from: 88, to: 108 };
const WIDE_LABELS = new Set([88, 92, 96, 100, 104, 108]);
/** Phones show fewer labels so they don't collide. */
const DIAL_LABELS_PHONE = new Set([88, 98, 108]);
const DIAL_LABELS = [...new Set([...WIDE_LABELS, ...DIAL_LABELS_PHONE])].sort((a, b) => a - b);

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });

/** "3 min. ago", "2 hr. ago", "yesterday": when a track was played. */
function playedAgo(iso: string) {
  const minutes = Math.round((Date.parse(iso) - Date.now()) / 60_000);
  if (minutes > -60) return relative.format(Math.min(minutes, -1), "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

type Station = {
  key: string;
  /** "LIVE" for the song playing now, otherwise 1–5. */
  preset: string;
  track: SpotifyTrack;
  playedAt?: string;
  frequency: number;
};

function toStations(feed: SpotifyFeed): Station[] {
  const items = [
    ...(feed.now ? [{ key: "live", preset: "LIVE", track: feed.now }] : []),
    ...feed.recent.map((track, i) => ({ key: track.playedAt, preset: String(i + 1), track, playedAt: track.playedAt })),
  ];
  const step = (BAND.to - BAND.from - 0.2) / Math.max(items.length - 1, 1);
  return items.map((item, i) => ({ ...item, frequency: BAND.from + 0.1 + i * step }));
}

const percent = (frequency: number) => ((frequency - BAND.from) / (BAND.to - BAND.from)) * 100;

/** Four signal bars, bouncing while something is on air (still under reduced motion: globals.css, eq-bar). */
function SignalBars() {
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-0.5">
      {[0.4, 0.6, 0.8, 1].map((height, i) => (
        <span
          key={i}
          className="eq-bar w-1 bg-accent"
          style={{ height: `${height * 100}%`, animationDelay: `${i * -0.25}s` }}
        />
      ))}
    </span>
  );
}

/**
 * Album art, unaltered as Spotify requires: no border, overlay, crop or
 * animation; 4px corners, 8px when large. A plain <img>: a small thumbnail
 * from Spotify's CDN doesn't need next/image.
 */
function Art({ track }: { track: SpotifyTrack }) {
  const size = "size-24 shrink-0 rounded-sm sm:size-32 sm:rounded-md";
  if (!track.image) return <span aria-hidden className={`border border-line-strong bg-canvas ${size}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={track.image} alt="" className={`object-cover ${size}`} data-spotify-art />;
}

/**
 * The About page's Spotify block, below the About panel: a pirate-radio tuner.
 * The song playing now (if any) and the last five played are stations on an
 * FM dial; presets tune between them, the needle sweeps and the readout
 * flickers with static. Album art never moves (Spotify's rules); only the
 * device around it does. Every track links to Spotify. Polls
 * /api/now-playing every 45 seconds while the tab is visible, and renders
 * nothing until there's data (or at all, if Spotify isn't set up).
 */
export function SpotifyModule() {
  const [feed, setFeed] = useState<SpotifyFeed | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  /** False for the first frame, so the needle sweeps in from the band's start. */
  const [tuned, setTuned] = useState(false);

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

  const stations = feed ? toStations(feed) : [];
  const hasStations = stations.length > 0;

  useEffect(() => {
    if (!hasStations || tuned) return;
    const frame = requestAnimationFrame(() => setTuned(true));
    return () => cancelAnimationFrame(frame);
  }, [hasStations, tuned]);

  if (!feed || !hasStations) return null;

  // The chosen station, or the first one (live if playing) when nothing is chosen or it dropped off.
  const station = stations.find((s) => s.key === selected) ?? stations[0];
  const onAir = Boolean(feed.now);
  const needle = tuned ? percent(station.frequency) : 0;

  return (
    <section aria-label="Spotify" data-spotify={onAir ? "playing" : "idle"}>
      <div className="hud-corners border border-line-strong bg-surface px-4 py-6 sm:p-8">
        {/* Header: the official logo, then the broadcast state. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="flex items-center">
            <SpotifyLogo className="h-7 w-auto" />
          </h2>
          <span aria-hidden className="h-px min-w-8 flex-1 bg-line" />
          <p className={`flex items-center gap-2 hud-label text-sm ${onAir ? "text-accent" : "text-ink-muted"}`} data-on-air={onAir}>
            <span aria-hidden className={`size-2 ${onAir ? "live-pulse bg-accent" : "bg-line-strong"}`} />
            {onAir ? "On Air" : "Off Air"}
            {onAir && <SignalBars />}
          </p>
        </div>

        {/* Dial: ticks, station marks and the needle. Purely visual; the presets are the controls. */}
        <div aria-hidden className="mt-8">
          <div className="dial-ticks relative h-10 border-b border-line-strong">
            {stations.map((s) => (
              <span
                key={s.key}
                className={`absolute bottom-0 h-3 w-1 -translate-x-1/2 ${s.key === station.key ? "bg-accent" : "bg-line-strong"}`}
                style={{ left: `${percent(s.frequency)}%` }}
              />
            ))}
            <span
              data-needle
              className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 bg-accent motion-safe:transition-[left] motion-safe:duration-600 motion-safe:ease-(--ease-out-soft)"
              style={{ left: `${needle}%` }}
            >
              <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-accent" />
            </span>
          </div>
          <div className="relative mt-2 h-4 hud-label text-xs text-ink-muted tabular-nums">
            {DIAL_LABELS.map((mhz) => {
              const edge = mhz === BAND.from ? "translate-x-0" : mhz === BAND.to ? "-translate-x-full" : "-translate-x-1/2";
              // Phones: only the ends and the middle; wider screens: every label but the middle one.
              const visibility = DIAL_LABELS_PHONE.has(mhz) ? (WIDE_LABELS.has(mhz) ? "" : "sm:hidden") : "hidden sm:inline";
              return (
                <span key={mhz} className={`absolute ${edge} ${visibility}`} style={{ left: `${percent(mhz)}%` }}>
                  {mhz}
                </span>
              );
            })}
          </div>
        </div>

        {/* Readout: art stays still; the text flickers with static on each tune. */}
        <div className="mt-8 flex items-center gap-4 sm:gap-6" aria-live="polite">
          <Art track={station.track} />
          <div key={station.key} className="tune-static min-w-0" data-readout>
            <p aria-hidden className="font-display text-xl text-accent tabular-nums sm:text-2xl">
              {station.frequency.toFixed(1)} FM
            </p>
            <a
              href={station.track.url}
              {...newTab}
              className="mt-1 block font-display text-2xl leading-tight font-bold wrap-break-word hover:text-accent sm:text-3xl"
            >
              {station.track.title}
              <span className="sr-only">
                {" "}
                by {station.track.artist}
                {NEW_TAB_NOTE}
              </span>
            </a>
            <p className="mt-1 text-ink-muted">{station.track.artist}</p>
            <p className="mt-2 hud-label text-xs text-ink-muted tabular-nums">
              {station.playedAt ? (
                <>
                  Played <time dateTime={station.playedAt}>{playedAgo(station.playedAt)}</time>
                </>
              ) : (
                <span className="text-accent">On Air Now</span>
              )}
            </p>
          </div>
        </div>

        {/* Presets: the controls. LIVE for the song on now, 1–5 for the last five. */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Stations" className="flex flex-wrap gap-2">
            {stations.map((s) => {
              const active = s.key === station.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${s.preset}: Tune to ${s.track.title} by ${s.track.artist}`}
                  onClick={() => setSelected(s.key)}
                  className={`hud-notch hud-notch-edge inline-flex min-h-11 min-w-11 items-center justify-center border px-3 hud-label text-sm tabular-nums transition-colors focus-visible:-outline-offset-4 ${
                    active
                      ? "border-accent bg-accent text-on-accent focus-visible:outline-on-accent"
                      : "border-line-strong bg-canvas hover:border-accent hover:text-accent hover:[--edge:var(--color-accent)]"
                  }`}
                >
                  {s.preset}
                </button>
              );
            })}
          </div>
          {/* Spotify's guidelines: content links back to Spotify, with "Open Spotify" as the link text. */}
          <a
            href="https://open.spotify.com"
            {...newTab}
            className="inline-flex min-h-11 items-center hud-label text-sm text-accent underline underline-offset-4 hover:no-underline"
          >
            Open Spotify
            <span className="sr-only">{NEW_TAB_NOTE}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
