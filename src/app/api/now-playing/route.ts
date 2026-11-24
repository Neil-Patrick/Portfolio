import { getNowPlaying } from "@/lib/spotify";

/** Polled by the About page's "Now Playing" readout. Cached about 30s in lib/spotify.ts. */
export async function GET() {
  return Response.json(await getNowPlaying());
}
