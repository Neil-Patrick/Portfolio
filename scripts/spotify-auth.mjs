// One-time setup: gets a Spotify refresh token for the "Now Playing" widget and
// saves it to .env.local as SPOTIFY_REFRESH_TOKEN. Run it yourself, in your own
// terminal, so the token never leaves your machine:
//
//   node scripts/spotify-auth.mjs
//
// It needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local, and the
// app's redirect URI set to http://127.0.0.1:3000/callback in the Spotify
// dashboard. After you approve, the browser lands on that address; the page
// itself may show a 404 (that's fine). Copy the whole address and paste it here.

import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";

const ENV_FILE = new URL("../.env.local", import.meta.url);
const REDIRECT_URI = "http://127.0.0.1:3000/callback";
const SCOPES = "user-read-currently-playing user-read-recently-played";

process.loadEnvFile(ENV_FILE);
const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env.local first.");
  process.exit(1);
}

// Built by hand with encodeURIComponent: URLSearchParams writes the space between
// scopes as "+", which Spotify can reject as invalid_scope. "%20" is what its docs use.
const query = Object.entries({
  client_id: id,
  response_type: "code",
  redirect_uri: REDIRECT_URI,
  scope: SCOPES,
  show_dialog: "true",
})
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join("&");
const authorize = `https://accounts.spotify.com/authorize?${query}`;

console.log("\n1. Open this link and approve the access:\n");
console.log(`   ${authorize}\n`);
console.log("2. You'll land on http://127.0.0.1:3000/callback?code=... (a 404 there is fine).");

const rl = createInterface({ input: process.stdin, output: process.stdout });
const pasted = (await rl.question("3. Paste that whole address here and press Enter:\n   ")).trim();
rl.close();

// Accept the whole address or just the code.
let code = pasted;
try {
  const url = new URL(pasted);
  if (url.searchParams.get("error")) {
    console.error(`Spotify returned an error: ${url.searchParams.get("error")}`);
    process.exit(1);
  }
  code = url.searchParams.get("code") ?? "";
} catch {
  // Not a URL: treat it as the code itself.
}
if (!code) {
  console.error("No code found in what you pasted.");
  process.exit(1);
}

const response = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
});
const data = await response.json();
if (!response.ok || !data.refresh_token) {
  // Spotify's error text, never the secrets.
  console.error(`Token exchange failed (${response.status}): ${data.error_description ?? data.error ?? "unknown error"}`);
  console.error("Codes are single-use and expire quickly: run the script again and paste the new address right away.");
  process.exit(1);
}

// Save it, replacing an older token if there is one.
const env = await readFile(ENV_FILE, "utf8");
const line = `SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`;
const updated = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(env)
  ? env.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
  : `${env.replace(/\n?$/, "\n")}${line}\n`;
await writeFile(ENV_FILE, updated);

console.log("\nDone: SPOTIFY_REFRESH_TOKEN saved to .env.local (not printed here). Restart the dev server to use it.");
