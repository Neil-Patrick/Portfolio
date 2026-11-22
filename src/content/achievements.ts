import saved from "./achievements.json";

/**
 * GitHub profile achievements, saved by scripts/fetch-github-achievements.mjs
 * (GitHub has no API for them). Re-run the script after unlocking one.
 */
export type Achievement = {
  slug: string;
  name: string;
  tier: number;
  /** ISO date (YYYY-MM-DD) it was unlocked. */
  unlocked: string | null;
  description: string | null;
  /** Badge art saved under public/. */
  image: string;
  /** Short code shown big on its tile. */
  code: string;
};

/** Tile codes per achievement; an unknown new one falls back to its initials. */
const CODES: Record<string, string> = { "pull-shark": "PR" };

export const achievements: Achievement[] = saved.map((achievement) => ({
  ...achievement,
  code:
    CODES[achievement.slug] ??
    achievement.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase(),
}));

export const ACHIEVEMENTS_URL = "https://github.com/Neil-Patrick?tab=achievements";
