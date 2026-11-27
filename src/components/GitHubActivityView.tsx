"use client";

import { FolderGit2, GitFork, Users } from "lucide-react";
import { useInView } from "motion/react";
import { useRef } from "react";
import type { GitHubActivity, GitHubStats, Streak } from "@/lib/github";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { GitHubCalendar } from "./GitHubCalendar";
import { Icon } from "./icons";
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

/**
 * GitHub activity as a signal readout, in the site's own language rather than
 * GitHub's: a streak "reactor" (a flame in a segmented ring) between two
 * readouts, the year as a signal trace (GitHubCalendar), languages as arcs
 * around a core, and this month's repositories branching off a wire.
 */
export function GitHubActivityView({ stats }: { stats: GitHubStats }) {
  const { activity } = stats;
  return (
    // minmax(0, 1fr) + min-w-0: nothing here can widen the page.
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
              { label: "Public Repositories", value: stats.publicRepos, icon: FolderGit2 },
              { label: "Followers", value: stats.followers, icon: Users },
            ].map((counter) => (
              <Readout key={counter.label} label={counter.label} value={counter.value} />
            ))}
          </dl>
          <p className="max-w-prose text-ink-muted">The contribution signal appears once a GitHub token is configured.</p>
        </>
      )}

      <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
        {activity && <ThisMonth month={activity.month} />}
        {stats.languages.length > 0 && <Languages stats={stats} />}
      </div>
    </div>
  );
}

/* ---------- Readouts and the streak reactor ---------- */

function range(streak: Streak) {
  if (!streak.start || !streak.end) return "No streak yet";
  if (streak.start === streak.end) return shortDate(streak.start, true);
  const sameYear = streak.start.slice(0, 4) === streak.end.slice(0, 4);
  return `${shortDate(streak.start, !sameYear)} – ${shortDate(streak.end, true)}`;
}

/** A number on the wire: big value, a short teal rule, a caps label, an optional note. */
function Readout({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    // dt comes first in the markup (a valid list); CSS order puts the number on top.
    <div className="grid justify-items-center text-center">
      <dt className="order-3 hud-label text-sm text-ink">{label}</dt>
      <dd className="order-1 font-display text-5xl font-bold sm:text-6xl">
        <CountUp value={value} />
      </dd>
      <span aria-hidden className="order-2 my-3 block h-0.5 w-10 bg-accent" />
      {note && <dd className="order-4 mt-1 text-sm text-ink-muted">{note}</dd>}
    </div>
  );
}

function Streaks({ activity }: { activity: GitHubActivity }) {
  const { current, longest } = activity.streaks;
  return (
    <dl className="grid items-center gap-12 sm:grid-cols-3 sm:gap-8">
      <Readout
        label="Total Contributions"
        value={activity.allTime.total}
        note={`${shortDate(activity.allTime.since, true)} – present`}
      />
      <StreakReactor current={current} longest={longest} />
      <Readout label="Longest Streak" value={longest.length} note={range(longest)} />
    </dl>
  );
}

const SEGMENTS_MAX = 60;

/**
 * The current streak as a reactor: a flickering flame with rising embers in
 * the core, ringed by one segment per day of the longest streak. Segments
 * light up to the current streak, so the ring shows how close it is to a
 * record; at a record the flame runs hotter. Still with reduced motion.
 */
function StreakReactor({ current, longest }: { current: Streak; longest: Streak }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const segments = Math.min(Math.max(longest.length, 12), SEGMENTS_MAX);
  const lit = longest.length > 0 ? Math.round((Math.min(current.length, longest.length) / longest.length) * segments) : 0;
  const hot = current.length > 0 && current.length >= longest.length;
  const embers = hot ? 8 : 5;

  return (
    <div className="grid justify-items-center text-center">
      <dt className="order-2 mt-3 hud-label text-sm text-ink">Current Streak</dt>
      <dd className="relative order-1 size-44 sm:size-48" data-hot={hot || undefined} data-streak-reactor>
        <svg ref={ref} aria-hidden viewBox="0 0 120 120" className="size-full" data-shown={inView || undefined}>
          {Array.from({ length: segments }, (_, i) => {
            // One arc per segment, with a small gap between neighbours.
            const step = (Math.PI * 2) / segments;
            const gap = Math.min(step * 0.28, 0.07);
            const a0 = i * step + gap / 2 - Math.PI / 2;
            const a1 = (i + 1) * step - gap / 2 - Math.PI / 2;
            // Rounded: trig differs in the last digits between server and browser (hydration).
            const pt = (a: number) => `${(60 + Math.cos(a) * 52).toFixed(2)} ${(60 + Math.sin(a) * 52).toFixed(2)}`;
            return (
              <path
                key={i}
                d={`M${pt(a0)}A52 52 0 0 1 ${pt(a1)}`}
                fill="none"
                strokeWidth={7}
                strokeLinecap="butt"
                className={`reactor-segment ${i < lit ? "stroke-accent" : "stroke-line"}`}
                data-lit={i < lit || undefined}
                style={{ "--i": i } as React.CSSProperties}
              />
            );
          })}
          <circle cx="60" cy="60" r="44" fill="none" strokeWidth={1} className="stroke-line-strong" />
        </svg>
        {/* The core: halo, flame, embers, and the count. */}
        <span aria-hidden className="reactor-halo absolute inset-[30%] rounded-full" />
        <span aria-hidden className="absolute inset-x-0 top-[19%] flex justify-center">
          <svg viewBox="0 0 40 56" className="reactor-flame h-15 w-11 overflow-visible">
            <path className="fill-accent" fillOpacity={0.9} d="M20 2C24 12 34 18 34 32a14 14 0 0 1-28 0c0-7 4-11 6-15 1 5 3 7 5 8C16 17 17 9 20 2z" />
            <path className="reactor-flame-core fill-ink" d="M20 24c3 5 7 8 7 14a7 7 0 0 1-14 0c0-4 2-6 3-8 1 2 2 3 3 3-1-3 0-6 1-9z" />
          </svg>
          {Array.from({ length: embers }, (_, i) => (
            <span
              key={i}
              className="reactor-ember absolute top-6 size-1 rounded-full bg-accent"
              style={{ "--dx": `${((i * 37) % 24) - 12}px`, "--delay": `${(i * 0.37).toFixed(2)}s`, left: `calc(50% + ${((i * 13) % 14) - 7}px)` } as React.CSSProperties}
            />
          ))}
        </span>
        <span className="absolute inset-x-0 bottom-[20%] font-display text-4xl leading-none font-bold sm:text-5xl">
          <CountUp value={current.length} />
        </span>
      </dd>
      <dd className="order-3 mt-1 text-sm text-ink-muted">{range(current)}</dd>
      {longest.length > 0 && (
        <dd className="order-4 mt-1 text-sm text-ink-muted">
          {hot ? "At my record: this is my longest streak" : `Lit toward my longest streak (${plural(longest.length, "day")})`}
        </dd>
      )}
    </div>
  );
}

/* ---------- This month: a transmission log ---------- */

/**
 * This month's repositories branching off one vertical wire: each commit
 * branch's trace grows with its commit count (the busiest carries a pulse),
 * and new repositories hang off the same wire as hollow nodes.
 */
function ThisMonth({ month }: { month: GitHubActivity["month"] }) {
  const max = Math.max(...month.commitsByRepo.map((repo) => repo.count), 1);
  const empty = month.commitsByRepo.length === 0 && month.reposCreated.length === 0;

  return (
    <div>
      <h3 className="mb-1 hud-label text-lg text-ink">{month.label}</h3>
      {empty ? (
        <p className="text-ink-muted">No public activity yet this month.</p>
      ) : (
        <>
          <p className="mb-5 text-sm text-ink-muted">
            {plural(month.commits, "commit")} across {plural(month.commitsByRepo.length, "repository", "repositories")}
            {month.reposCreated.length > 0 && `, ${plural(month.reposCreated.length, "new repository", "new repositories")}`}
          </p>
          <ul className="relative grid gap-1" data-transmission-log>
            <span aria-hidden className="absolute top-3 bottom-3 left-1.25 w-px bg-line-strong" />
            {month.commitsByRepo.map((repo, i) => {
              const share = repo.count / max;
              return (
                <li key={repo.name} className="relative grid min-h-11 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
                  <Branch share={share} pulse={i === 0} />
                  <span className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3">
                    <a href={repo.url} {...newTab} className="truncate text-accent underline underline-offset-2 hover:no-underline">
                      {repo.name}
                      <span className="sr-only">{NEW_TAB_NOTE}</span>
                    </a>
                    <span className="hud-label text-xs text-ink-muted tabular-nums">{plural(repo.count, "commit")}</span>
                  </span>
                </li>
              );
            })}
            {month.reposCreated.map((repo) => (
              <li key={`new-${repo.name}`} className="relative grid min-h-11 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
                <Branch share={0} hollow />
                <span className="grid min-w-0 gap-0.5 text-sm">
                  <span className="flex min-w-0 flex-wrap items-center gap-x-2">
                    <a href={repo.url} {...newTab} className="truncate text-accent underline underline-offset-2 hover:no-underline">
                      {repo.name}
                      <span className="sr-only">{NEW_TAB_NOTE}</span>
                    </a>
                    <span className="hud-label text-xs text-ink-muted">{repo.isFork ? "Fork" : "New"}</span>
                    {repo.isFork && <Icon icon={GitFork} className="text-ink-muted" />}
                  </span>
                  <span className="flex items-center gap-3 text-ink-muted">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        {/* GitHub's own language color, as on the profile. */}
                        <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: repo.language.color }} />
                        {repo.language.name}
                      </span>
                    )}
                    <span className="tabular-nums">{shortDate(repo.date)}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** A junction on the wire, a trace out to a node; the trace grows with `share`. */
function Branch({ share, pulse = false, hollow = false }: { share: number; pulse?: boolean; hollow?: boolean }) {
  const width = 12 + Math.round(share * 88); // px
  return (
    <span aria-hidden className="relative flex items-center" style={{ width: width + 14 }}>
      <span className="size-2.75 shrink-0 rounded-full border border-accent bg-canvas" />
      <span className="relative h-px flex-1 bg-accent/70">
        {pulse && <span className="branch-pulse absolute -top-0.75 left-0 size-1.75 rounded-full bg-accent" />}
      </span>
      <span className={`size-2.5 shrink-0 rounded-full border-2 border-accent ${hollow ? "bg-canvas" : "bg-accent glow-node"}`} />
    </span>
  );
}

/* ---------- Languages: arcs around a core ---------- */

function Languages({ stats }: { stats: GitHubStats }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const languages = stats.languages.slice(0, 6);
  // Stepped teal: the biggest share is brightest; the legend names every arc.
  const tone = (i: number) => 1 - i * 0.14;

  return (
    <div>
      <h3 className="mb-1 hud-label text-lg text-ink">Most Used Languages</h3>
      <p className="mb-5 text-sm text-ink-muted">
        {stats.languagesBasis === "bytes"
          ? "Share of code across the repositories I've contributed to."
          : "Primary language of my public repositories."}
      </p>
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        <svg ref={ref} aria-hidden viewBox="0 0 160 160" className="size-44 shrink-0 -rotate-90" data-shown={inView || undefined}>
          {languages.map((language, i) => {
            const r = 72 - i * 11;
            return (
              <g key={language.name}>
                <circle cx="80" cy="80" r={r} fill="none" strokeWidth={6} className="stroke-line" pathLength={100} strokeDasharray="75 100" />
                <circle
                  cx="80"
                  cy="80"
                  r={r}
                  fill="none"
                  strokeWidth={6}
                  strokeLinecap="butt"
                  pathLength={100}
                  className="language-arc stroke-accent"
                  strokeOpacity={tone(i)}
                  style={{ "--arc": Math.max(language.share * 75, 0.8), "--i": i } as React.CSSProperties}
                />
              </g>
            );
          })}
          <circle cx="80" cy="80" r="8" className="fill-canvas stroke-accent" strokeWidth={1.5} />
          <circle cx="80" cy="80" r="3" className="fill-accent" />
        </svg>
        <ul className="grid w-full gap-2" aria-label="Languages">
          {languages.map((language, i) => (
            <li key={language.name} className="flex items-center gap-3 border-b border-line pb-2 text-sm">
              <span aria-hidden className="h-1.5 w-4 shrink-0 bg-accent" style={{ opacity: tone(i) }} />
              <span className="flex-1">{language.name}</span>
              <span className="text-ink-muted tabular-nums">{language.share < 0.005 ? "<1" : Math.round(language.share * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
