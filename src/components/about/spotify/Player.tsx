"use client";

import { Play, Square } from "lucide-react";
import { useState } from "react";
import type { SpotifyFeed } from "@/lib/spotify";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { Icon } from "@/components/icons";
import {
  Art,
  OnAirStatus,
  OpenSpotifyLink,
  SpotifyEmbed,
  SpotifyHeader,
  buttonClass,
  playedAgo,
  trackId,
  useStations,
} from "./shared";

/** Spotify's standard embed player height; the preview panel is always this tall. */
const PREVIEW_HEIGHT = 152;

/**
 * The About page's Spotify block. Left: the loaded song (static album art,
 * title linking to Spotify, artist). Right, filling the rest of the row: a
 * fixed-size preview panel, a button until clicked, then Spotify's own player
 * in the same box, so opening it moves nothing (and nothing from Spotify loads
 * before the click). Below: the track index; a row loads that song,
 * and the song text glitches once. The album art never moves (Spotify's rules).
 */
export function Player({ feed }: { feed: SpotifyFeed }) {
  const { stations, current, select, onAir } = useStations(feed);
  /** Bumped on every cue, so the text glitch replays. */
  const [cueCount, setCueCount] = useState(0);
  const [previewFor, setPreviewFor] = useState<string | null>(null);

  const canPreview = Boolean(trackId(current.track.url));
  const previewOpen = canPreview && previewFor === current.key;

  const cue = (key: string) => {
    if (key === current.key) return;
    select(key);
    setPreviewFor(null);
    setCueCount((n) => n + 1);
  };

  const live = stations.find((s) => !s.playedAt);
  const recent = stations.filter((s) => s.playedAt);

  return (
    <section aria-label="Spotify" data-spotify={onAir ? "playing" : "idle"}>
      <div className="border-t border-line pt-10">
        <SpotifyHeader>
          <p>
            <OnAirStatus onAir={onAir} />
          </p>
        </SpotifyHeader>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          {/* Left: the loaded song. */}
          {/* relative + overflow-x-clip: a long wrapped title would otherwise push its screen-reader text past the page edge. */}
          <div className="relative min-w-0 overflow-x-clip lg:max-w-md lg:shrink-0" data-info>
            <div className="flex items-center gap-4 sm:gap-6">
              <Art track={current.track} className="size-24 rounded-sm sm:size-32 sm:rounded-md" />
              <div key={cueCount} className={`min-w-0 ${cueCount > 0 ? "glitch-press" : ""}`}>
                <p className="hud-label text-xs text-ink-muted">
                  {current.playedAt ? (
                    <>
                      Played <time dateTime={current.playedAt}>{playedAgo(current.playedAt)}</time>
                    </>
                  ) : (
                    <span className="text-accent">On Air Now</span>
                  )}
                </p>
                <a
                  href={current.track.url}
                  {...newTab}
                  className="mt-1 block font-display text-2xl leading-tight font-bold wrap-break-word hover:text-accent sm:text-3xl"
                  data-loaded
                >
                  {current.track.title}
                  <span className="sr-only">
                    {" "}
                    by {current.track.artist}
                    {NEW_TAB_NOTE}
                  </span>
                </a>
                <p className="mt-1 text-ink-muted">{current.track.artist}</p>
                <div className="mt-2 flex h-11 items-center">
                  <OpenSpotifyLink />
                </div>
              </div>
            </div>

            {/* Its own row, always reserved (hidden while closed), so opening the preview moves nothing. */}
            <div className={`mt-4 ${canPreview ? "" : "hidden"}`}>
              <button
                type="button"
                onClick={() => setPreviewFor(null)}
                tabIndex={previewOpen ? undefined : -1}
                aria-hidden={previewOpen ? undefined : true}
                className={`${buttonClass} ${previewOpen ? "" : "invisible"}`}
              >
                <Icon icon={Square} />
                Close Preview
              </button>
            </div>
          </div>

          {/* Right: the preview panel, always the same size. */}
          {canPreview && (
            <div className="min-w-0 lg:flex-1" style={{ height: PREVIEW_HEIGHT }} data-preview-slot>
              {previewOpen ? (
                <SpotifyEmbed track={current.track} height={PREVIEW_HEIGHT} />
              ) : (
                <button
                  type="button"
                  onClick={() => setPreviewFor(current.key)}
                  className="group hud-notch hud-notch-edge flex size-full flex-col items-start justify-center gap-2 border border-line-strong bg-canvas px-6 text-left transition-colors hover:border-accent hover:[--edge:var(--color-accent)] focus-visible:-outline-offset-4"
                >
                  <span className="flex items-center gap-3 hud-label text-base group-hover:text-accent">
                    <span className="grid size-10 place-items-center border border-current transition-colors group-hover:bg-accent group-hover:text-on-accent">
                      <Icon icon={Play} />
                    </span>
                    Preview on Spotify
                    <span className="sr-only">: {current.track.title}</span>
                  </span>
                  <span className="text-sm text-ink-muted">
                    30-second preview, or the full song if you&apos;re signed in to Spotify.
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Track index: each row cues its song. */}
        <div className="mt-8">
          <h3 className="mb-3 flex items-center gap-3 hud-label text-sm text-ink-muted">
            Track Index
            <span aria-hidden className="h-px flex-1 bg-line" />
          </h3>
          <ol className="grid gap-1">
            {live && (
              <li className="min-w-0">
                <IndexRow label="▶" title={live.track.title} artist={live.track.artist} meta="Now" active={current.key === live.key} onClick={() => cue(live.key)} />
              </li>
            )}
            {recent.map((s, i) => (
              <li key={s.key} className="min-w-0">
                <IndexRow
                  label={`S${i + 1}`}
                  title={s.track.title}
                  artist={s.track.artist}
                  meta={playedAgo(s.playedAt!)}
                  active={current.key === s.key}
                  onClick={() => cue(s.key)}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function IndexRow({
  label,
  title,
  artist,
  meta,
  active,
  onClick,
}: {
  label: string;
  title: string;
  artist: string;
  meta: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group flex min-h-11 w-full items-center gap-3 px-2 text-left transition-colors focus-visible:-outline-offset-2 ${
        active ? "bg-accent text-on-accent focus-visible:outline-on-accent" : "hover:text-accent"
      }`}
    >
      <span aria-hidden={label === "▶"} className="w-6 shrink-0 hud-label text-xs tabular-nums">
        {label}
      </span>
      {/* A play mark slides in on hover and focus. */}
      <span
        aria-hidden
        className={`w-2 shrink-0 text-[0.6rem] transition-[opacity,translate] duration-200 ${
          active ? "opacity-0" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        }`}
      >
        ▶
      </span>
      <span className="relative min-w-0 truncate font-semibold">
        {title}
        <span className="sr-only"> by {artist}</span>
      </span>
      <span
        aria-hidden
        className={`min-w-4 flex-1 border-b border-dotted transition-colors ${
          active ? "border-on-accent" : "border-line-strong group-hover:border-accent group-focus-visible:border-accent"
        }`}
      />
      <span className={`shrink-0 hud-label text-xs tabular-nums ${active ? "" : "text-ink-muted"}`}>{meta}</span>
    </button>
  );
}
