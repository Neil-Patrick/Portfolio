import { cacheLife } from "next/cache";

/**
 * What the "Now Playing" widget shows. Only public track details leave the
 * server; the Spotify keys stay in env vars (SPOTIFY_CLIENT_ID,
 * SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN; get the token with
 * scripts/spotify-auth.mjs).
 */
export type NowPlaying =
  | { status: "playing" | "recent"; title: string; artist: string; image?: string; url: string }
  | { status: "off" };

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number | null }[] };
  external_urls: { spotify: string };
};

const OFF: NowPlaying = { status: "off" };

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

function toTrack(status: "playing" | "recent", track: SpotifyTrack): NowPlaying {
  // Images come largest first; the smallest one that's still at least 64px is plenty for a thumbnail.
  const images = track.album.images;
  const image = [...images].reverse().find((img) => (img.width ?? 0) >= 64) ?? images[0];
  return {
    status,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    image: image?.url,
    url: track.external_urls.spotify,
  };
}

/**
 * The track playing now, else the last one played, else "off". Cached for
 * about 30 seconds, so however many visitors poll, Spotify sees roughly two
 * calls a minute. Any failure (missing keys, revoked token, Spotify down)
 * returns "off" so the widget just hides.
 */
export async function getNowPlaying(): Promise<NowPlaying> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 300 });

  try {
    const token = await accessToken();
    if (!token) return OFF;
    const headers = { Authorization: `Bearer ${token}` };

    const current = await fetch("https://api.spotify.com/v1/me/player/currently-playing", { headers });
    // 204: nothing playing. A podcast or ad has no track item, so it falls through too.
    if (current.status === 200) {
      const data: { is_playing: boolean; item: SpotifyTrack | null; currently_playing_type: string } = await current.json();
      if (data.is_playing && data.item && data.currently_playing_type === "track") return toTrack("playing", data.item);
    }

    const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", { headers });
    if (!recent.ok) return OFF;
    const data: { items: { track: SpotifyTrack }[] } = await recent.json();
    return data.items[0] ? toTrack("recent", data.items[0].track) : OFF;
  } catch {
    return OFF;
  }
}
