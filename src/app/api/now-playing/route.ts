import { getSpotifyFeed } from "@/lib/spotify";

/** Polled by the About page's Spotify module. Cached about 30s in lib/spotify.ts. */
export async function GET() {
  return Response.json(await getSpotifyFeed());
}
