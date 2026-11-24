import { cacheLife } from "next/cache";

/**
 * What the About page's Spotify module shows. Only public track details leave
 * the server; the Spotify keys stay in env vars (SPOTIFY_CLIENT_ID,
 * SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN; get the token with
 * scripts/spotify-auth.mjs).
 */
export type SpotifyTrack = { title: string; artist: string; image?: string; url: string };
export type SpotifyFeed = {
  /** The track playing right now, or null. */
  now: SpotifyTrack | null;
  /** The last tracks played, newest first, with when each one was played (ISO). */
  recent: (SpotifyTrack & { playedAt: string })[];
};

/** How many recently played tracks the module lists. */
export const RECENT_COUNT = 5;

type ApiTrack = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number | null }[] };
  external_urls: { spotify: string };
};

const EMPTY: SpotifyFeed = { now: null, recent: [] };

async function accessToken() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return null;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
  });
  if (!response.ok) return null;
  const data: { access_token?: string } = await response.json();
  return data.access_token ?? null;
}

function toTrack(track: ApiTrack): SpotifyTrack {
  // Images come largest first: the smallest one that's still at least 160px covers the big deck art.
  const images = track.album.images;
  const image = [...images].reverse().find((img) => (img.width ?? 0) >= 160) ?? images[0];
  return {
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    image: image?.url,
    url: track.external_urls.spotify,
  };
}

/**
 * The track playing now (if any) and the last few played. Cached for about
 * 30 seconds, so however many visitors poll, Spotify sees roughly two rounds
 * of calls a minute. Any failure (missing keys, revoked token, Spotify down)
 * gives an empty feed, and the module hides itself.
 */
export async function getSpotifyFeed(): Promise<SpotifyFeed> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 300 });

  try {
    const token = await accessToken();
    if (!token) return EMPTY;
    const headers = { Authorization: `Bearer ${token}` };

    const [current, recent] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/player/currently-playing", { headers }),
      fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${RECENT_COUNT}`, { headers }),
    ]);

    let now: SpotifyTrack | null = null;
    // 204: nothing playing. A podcast or ad has no track item, so it counts as nothing.
    if (current.status === 200) {
      const data: { is_playing: boolean; item: ApiTrack | null; currently_playing_type: string } = await current.json();
      if (data.is_playing && data.item && data.currently_playing_type === "track") now = toTrack(data.item);
    }

    const history: { items: { track: ApiTrack; played_at: string }[] } = recent.ok ? await recent.json() : { items: [] };
    return {
      now,
      recent: history.items.slice(0, RECENT_COUNT).map((item) => ({ ...toTrack(item.track), playedAt: item.played_at })),
    };
  } catch {
    return EMPTY;
  }
}
