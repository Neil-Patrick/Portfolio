import { ACHIEVEMENTS_URL, achievements } from "@/content/achievements";
import { formatMonth } from "@/content/credentials";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { RingNode } from "./RingNode";

/**
 * GitHub profile achievements (saved by scripts/fetch-github-achievements.mjs)
 * as circle nodes strung on one wire, like the credential emblems: GitHub's
 * own badge art in each circle, which lights up on hover and focus. Each
 * links to the achievements tab on GitHub.
 */
export function GitHubAchievements() {
  if (achievements.length === 0) return null;
  return (
    <section aria-labelledby="github-achievements" className="mt-10">
      <h3 id="github-achievements" className="mb-6 hud-label text-lg text-ink">
        Achievements
      </h3>
      <ul className="relative flex flex-wrap gap-x-10 gap-y-8">
        {/* The wire, through the centers of the nodes. */}
        <span aria-hidden className="absolute top-10 right-0 left-0 h-px bg-line-strong" />
        {achievements.map((achievement) => {
          const unlocked = achievement.unlocked ? formatMonth(achievement.unlocked) : null;
          return (
            <li key={achievement.slug} className="relative">
              <a href={ACHIEVEMENTS_URL} {...newTab} className="group grid w-44 justify-items-center gap-3 text-center">
                <RingNode image={achievement.image} alt={`${achievement.name} achievement badge`} code={achievement.code} className="size-20" />
                <span>
                  <span className="block font-display text-xl font-semibold tracking-wide uppercase transition-colors group-hover:text-accent">
                    {achievement.name}
                    {achievement.tier > 1 && <span className="text-ink-muted"> x{achievement.tier}</span>}
                  </span>
                  {achievement.description && <span className="mt-1 block text-sm text-ink-muted">{achievement.description}</span>}
                  {unlocked && <span className="mt-1 block hud-label text-xs text-ink-muted tabular-nums">Unlocked {unlocked}</span>}
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
