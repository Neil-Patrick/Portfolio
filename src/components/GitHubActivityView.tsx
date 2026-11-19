"use client";

import {
  BookPlus,
  CalendarRange,
  Code2,
  Flame,
  FolderGit2,
  GitCommitHorizontal,
  GitFork,
  Trophy,
  Users,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import type { GitHubActivity, GitHubStats, Streak } from "@/lib/github";
import { GitHubCalendar } from "./GitHubCalendar";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { GitHubLogo, Icon } from "./icons";
import { CountUp } from "./motion/CountUp";

const shortDate = (date: string, withYear = false) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear && { year: "numeric" }),
    timeZone: "UTC",
  });

const plural = (count: number, word: string, many = `${word}s`) =>
  `${count.toLocaleString("en-US")} ${count === 1 ? word : many}`;

export function GitHubActivityView({ stats }: { stats: GitHubStats }) {
  const { activity } = stats;
  return (
    // minmax(0, 1fr) + min-w-0: the heatmap scrolls inside its own box instead of widening the page.
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-16">
      {activity ? (
        <>
          <Streaks activity={activity} />
          <GitHubCalendar calendars={activity.calendars} />
        </>
      ) : (
        <>
          {/* No token: the public numbers are all there is, so show them. */}
          <dl className="grid grid-cols-2 gap-8">
            {[
              { label: "Public repositories", value: stats.publicRepos, icon: FolderGit2 },
              { label: "Followers", value: stats.followers, icon: Users },
            ].map((counter) => (
              <div key={counter.label}>
                <dd className="text-4xl font-semibold sm:text-5xl">
                  <CountUp value={counter.value} />
                </dd>
                <dt className="mt-1 flex items-start gap-2 text-ink-muted">
                  <Icon icon={counter.icon} className="mt-0.5" />
                  {counter.label}
                </dt>
              </div>
            ))}
          </dl>
          <p className="max-w-prose text-ink-muted">
            The contribution calendar appears once a GitHub token is configured.
          </p>
        </>
      )}

      <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
        {activity && <ThisMonth month={activity.month} />}
        {stats.languages.length > 0 && <Languages stats={stats} />}
      </div>

      <a href={stats.url} {...newTab} className="group inline-flex min-h-11 w-fit items-center gap-2 font-semibold text-accent">
        <GitHubLogo />
        <span className="underline underline-offset-4 group-hover:no-underline">View my GitHub profile</span>
        <span className="sr-only">{NEW_TAB_NOTE}</span>
      </a>
    </div>
  );
}

/* ---------- Streaks: total, current (ring), longest ---------- */

function range(streak: Streak) {
  if (!streak.start || !streak.end) return "No streak yet";
  if (streak.start === streak.end) return shortDate(streak.start, true);
  const sameYear = streak.start.slice(0, 4) === streak.end.slice(0, 4);
  return `${shortDate(streak.start, !sameYear)} – ${shortDate(streak.end, true)}`;
}

function Streaks({ activity }: { activity: GitHubActivity }) {
  const { current, longest } = activity.streaks;
  return (
    <div className="grid items-center gap-12 text-center sm:grid-cols-3 sm:gap-8">
      <div>
        <p className="text-4xl font-semibold sm:text-5xl">
          <CountUp value={activity.allTime.total} />
        </p>
        <p className="mt-1 flex items-center justify-center gap-2 font-semibold">
          <Icon icon={CalendarRange} className="text-accent" />
          Total contributions
        </p>
        <p className="text-sm text-ink-muted">{shortDate(activity.allTime.since, true)} – present</p>
      </div>
      <StreakRing current={current} longest={longest} />
      <div>
        <p className="text-4xl font-semibold sm:text-5xl">
          <CountUp value={longest.length} />
        </p>
        <p className="mt-1 flex items-center justify-center gap-2 font-semibold">
          <Icon icon={Trophy} className="text-accent" />
          Longest streak
        </p>
        <p className="text-sm text-ink-muted">{range(longest)}</p>
      </div>
    </div>
  );
}

/** The ring fills toward the longest streak, so it shows how close the current one is to a record. */
function StreakRing({ current, longest }: { current: Streak; longest: Streak }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const percent = longest.length > 0 ? Math.min(current.length / longest.length, 1) * 100 : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative size-36 sm:size-40">
        <svg ref={ref} aria-hidden viewBox="0 0 120 120" className="size-full -rotate-90" data-shown={inView || undefined}>
          <circle cx="60" cy="60" r="52" fill="none" strokeWidth="9" className="stroke-heat-0" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            pathLength={100}
            className="streak-ring stroke-accent"
            style={{ "--offset": 100 - percent } as React.CSSProperties}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center text-4xl font-semibold sm:text-5xl">
          <Icon icon={Flame} className="mb-1 text-accent" />
          <CountUp value={current.length} />
        </span>
      </div>
      <p className="mt-3 font-semibold">Current streak</p>
      <p className="text-sm text-ink-muted">{range(current)}</p>
      {longest.length > 0 && (
        <p className="mt-1 text-sm text-ink-muted">
          {current.length >= longest.length
            ? "Ring full: this is my longest streak"
            : `Ring fills toward my longest streak (${plural(longest.length, "day")})`}
        </p>
      )}
    </div>
  );
}

/* ---------- This month ---------- */

function ThisMonth({ month }: { month: GitHubActivity["month"] }) {
  const max = Math.max(...month.commitsByRepo.map((repo) => repo.count), 1);
  const empty = month.commitsByRepo.length === 0 && month.reposCreated.length === 0;

  return (
    <div>
      <h3 className="mb-1 text-lg">{month.label}</h3>
      {empty ? (
        <p className="text-ink-muted">No public activity yet this month.</p>
      ) : (
        <div className="grid gap-8">
          {month.commitsByRepo.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-2 text-ink-muted">
                <Icon icon={GitCommitHorizontal} />
                Created {plural(month.commits, "commit")} in {plural(month.commitsByRepo.length, "repository", "repositories")}
              </p>
              <ul className="grid gap-3">
                {month.commitsByRepo.map((repo) => (
                  <li key={repo.name}>
                    <div className="mb-1 flex flex-wrap justify-between gap-x-4 text-sm">
                      <a href={repo.url} {...newTab} className="text-accent underline underline-offset-2 hover:no-underline">
                        {repo.name}
                        <span className="sr-only">{NEW_TAB_NOTE}</span>
                      </a>
                      <span className="text-ink-muted tabular-nums">{plural(repo.count, "commit")}</span>
                    </div>
                    <Bar share={repo.count / max} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {month.reposCreated.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-ink-muted">
                <Icon icon={BookPlus} />
                Created {plural(month.reposCreated.length, "repository", "repositories")}
              </p>
              <ul>
                {month.reposCreated.map((repo) => (
                  <li key={repo.name} className="grid min-h-11 content-center gap-0.5 py-1 text-sm">
                    <span>
                      <a href={repo.url} {...newTab} className="text-accent underline underline-offset-2 hover:no-underline">
                        {repo.name}
                        <span className="sr-only">{NEW_TAB_NOTE}</span>
                      </a>
                      {repo.isFork && (
                        <span className="ml-2 inline-flex items-center gap-1 align-middle text-ink-muted">
                          <Icon icon={GitFork} />
                          fork
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-4 text-ink-muted">
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          {/* GitHub's own language color, as on the profile. */}
                          <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: repo.language.color }} />
                          {repo.language.name}
                        </span>
                      )}
                      <span className="tabular-nums">{shortDate(repo.date)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Languages ---------- */

function Languages({ stats }: { stats: GitHubStats }) {
  return (
    <div>
      <h3 className="mb-1 flex items-center gap-2 text-lg">
        <Icon icon={Code2} className="text-accent" />
        Most used languages
      </h3>
      <p className="mb-4 text-sm text-ink-muted">
        {stats.languagesBasis === "bytes"
          ? "Share of code across the repositories I've contributed to."
          : "Primary language of my public repositories."}
      </p>
      <ul className="grid gap-3">
        {stats.languages.map((language) => (
          <li key={language.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{language.name}</span>
              <span className="text-ink-muted tabular-nums">{language.share < 0.005 ? "<1" : Math.round(language.share * 100)}%</span>
            </div>
            <Bar share={language.share} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bar that grows in from the left the first time it's seen. */
function Bar({ share }: { share: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-xs bg-heat-0">
      <motion.div
        data-reveal
        className="h-full origin-left rounded-xs bg-accent"
        style={{ width: `${Math.max(share * 100, 2)}%` }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
