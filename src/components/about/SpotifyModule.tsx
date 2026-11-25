"use client";

import { Player } from "./spotify/Player";
import { hasTracks, useSpotifyFeed } from "./spotify/shared";

/**
 * The About page's Spotify block, below the About panel. Polls
 * /api/now-playing and renders nothing until there's data (or at all, if
 * Spotify isn't set up). The design is ./spotify/Player.tsx.
 */
export function SpotifyModule() {
  const feed = useSpotifyFeed();
  if (!hasTracks(feed)) return null;
  return <Player feed={feed} />;
}
