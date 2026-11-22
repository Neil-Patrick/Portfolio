// Saves Neil's GitHub profile achievements (name, tier, unlock date, badge art)
// into src/content/achievements.json and public/achievements/. GitHub has no API
// for achievements, so this reads the public profile page and each achievement's
// detail card. Run again after unlocking one:  node scripts/fetch-github-achievements.mjs
import { mkdir, writeFile } from "node:fs/promises";

const USER = "Neil-Patrick";
const HEADERS = { "User-Agent": "portfolio-achievements-script", "X-Requested-With": "XMLHttpRequest" };
const JSON_OUT = new URL("../src/content/achievements.json", import.meta.url);
const IMAGE_DIR = new URL("../public/achievements/", import.meta.url);

const page = async (url) => {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
};
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const profile = await page(`https://github.com/${USER}?tab=achievements`);
// Each achievement links to ?achievement=<slug>, with its art and an "Achievement: <name>" alt.
const found = new Map();
for (const match of profile.matchAll(/achievement=([a-z0-9-]+)[^"]*"[^>]*>\s*<img[^>]*src="([^"]+)"[^>]*alt="Achievement: ([^"]+)"/g)) {
  const [, slug, src, name] = match;
  if (!found.has(slug)) found.set(slug, { slug, name, src });
}

await mkdir(IMAGE_DIR, { recursive: true });
const achievements = [];
for (const { slug, name, src } of found.values()) {
  const detail = text(await page(`https://github.com/users/${USER}/achievements/${slug}/detail?hovercard=1`));
  // Detail text reads like: "Pull Shark @user opened pull requests ... History Unlocked 2026-03-14 ... · 2nd pull request merged"
  const unlocked = detail.match(/Unlocked (\d{4}-\d{2}-\d{2})/)?.[1];
  const tier = detail.match(/\bx(\d+)\b/i)?.[1];
  const description = detail.match(new RegExp(`@${USER} (.+?) History`))?.[1];
  const image = await fetch(src);
  if (!image.ok) throw new Error(`${name} art: HTTP ${image.status}`);
  await writeFile(new URL(`${slug}.png`, IMAGE_DIR), Buffer.from(await image.arrayBuffer()));
  achievements.push({
    slug,
    name,
    tier: tier ? Number(tier) : 1,
    unlocked: unlocked ?? null,
    description: description ? `${description[0].toUpperCase()}${description.slice(1).replace(/\.*$/, "")}.` : null,
    image: `/achievements/${slug}.png`,
  });
  console.log(`saved ${name} (unlocked ${unlocked ?? "?"})`);
}

await writeFile(JSON_OUT, `${JSON.stringify(achievements, null, 2)}\n`);
console.log(`wrote ${achievements.length} achievement(s) to src/content/achievements.json`);
