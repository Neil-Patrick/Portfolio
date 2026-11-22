// Downloads the badge images from Neil's public Credly profile into public/badges/,
// named by Credly badge ID (the same IDs as in src/content/credentials.ts).
// The site serves these local copies, so it never calls Credly at runtime.
// Run again after earning a badge:  node scripts/fetch-credly-badges.mjs
import { mkdir, writeFile } from "node:fs/promises";

const PROFILE = "https://www.credly.com/users/neil-patrick-pajadan/badges.json";
const OUT_DIR = new URL("../public/badges/", import.meta.url);
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

const response = await fetch(PROFILE, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`Credly profile: HTTP ${response.status}`);
const { data } = await response.json();

await mkdir(OUT_DIR, { recursive: true });
for (const badge of data) {
  const name = badge.badge_template?.name ?? badge.id;
  const image = await fetch(badge.image_url ?? badge.badge_template?.image_url);
  if (!image.ok) throw new Error(`${name}: HTTP ${image.status}`);
  const bytes = Buffer.from(await image.arrayBuffer());
  // Credly sometimes labels images "application/octet-stream", so check the file itself.
  if (!PNG_SIGNATURE.every((byte, i) => bytes[i] === byte)) throw new Error(`${name}: not a PNG`);
  await writeFile(new URL(`${badge.id}.png`, OUT_DIR), bytes);
  console.log(`saved ${badge.id}.png  ${name}`);
}
