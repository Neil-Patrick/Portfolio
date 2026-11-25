import { ACHIEVEMENTS_URL, achievements } from "@/content/achievements";
import { formatMonth } from "@/content/credentials";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { RingNode } from "./RingNode";

/**
 * GitHub profile achievements (saved by scripts/fetch-github-achievements.mjs),
 * each GitHub's own badge art in a circle that lights up on hover and
 * focus. Each links to the achievements tab on GitHub.
 */
export function GitHubAchievements() {
  if (achievements.length === 0) return null;
  return (
    <section aria-labelledby="github-achievements" className="mt-10">
      <h3 id="github-achievements" className="mb-4 hud-label text-sm text-ink-muted">
        Achievements
      </h3>
      <ul className="flex flex-wrap gap-4">
        {achievements.map((achievement) => {
          const unlocked = achievement.unlocked ? formatMonth(achievement.unlocked) : null;
          return (
            <li key={achievement.slug}>
              <a
                href={ACHIEVEMENTS_URL}
                {...newTab}
                className="group hud-row hud-row-link flex min-h-11 items-center gap-4 py-3 pr-5 pl-3"
              >
                <RingNode image={achievement.image} alt={`${achievement.name} achievement badge`} code={achievement.code} />
                <span>
                  <span className="block font-display text-xl font-semibold tracking-wide uppercase">
                    {achievement.name}
                    {achievement.tier > 1 && <span className="text-ink-muted"> x{achievement.tier}</span>}
                  </span>
                  {achievement.description && (
                    <span className="block max-w-xs text-sm text-ink-muted">{achievement.description}</span>
                  )}
                  {unlocked && (
                    <span className="mt-1 block hud-label text-xs text-ink-muted tabular-nums">Unlocked {unlocked}</span>
                  )}
                </span>
                <span className="sr-only">{NEW_TAB_NOTE}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
