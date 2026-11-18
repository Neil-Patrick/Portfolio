"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ContributionDay, GitHubStats } from "@/lib/github";
import { CountUp } from "./motion/CountUp";

const HEAT = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"];

function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function GitHubActivityView({ stats }: { stats: GitHubStats }) {
  const counters = stats.activity
    ? [
        { label: "Contributions in the last year", value: stats.activity.total },
        { label: "Commits", value: stats.activity.commits },
        { label: "Pull requests", value: stats.activity.pullRequests },
        { label: "Repositories contributed to", value: stats.activity.reposContributedTo },
      ]
    : [
        { label: "Public repositories", value: stats.publicRepos },
        { label: "Followers", value: stats.followers },
      ];

  return (
    <div className="grid gap-12">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
        {counters.map((counter) => (
          <div key={counter.label}>
            <dd className="text-4xl font-semibold sm:text-5xl">
              <CountUp value={counter.value} />
            </dd>
            <dt className="mt-1 text-ink-muted">{counter.label}</dt>
          </div>
        ))}
      </dl>

      {stats.activity ? (
        <Heatmap weeks={stats.activity.weeks} total={stats.activity.total} />
      ) : (
        <p className="max-w-prose text-ink-muted">
          The contribution calendar appears once a GitHub token is configured.
        </p>
      )}

      {stats.languages.length > 0 && <Languages stats={stats} />}

      <a
        href={stats.url}
        className="w-fit font-semibold text-accent underline underline-offset-4 hover:no-underline"
      >
        View my GitHub profile
      </a>
    </div>
  );
}

function Heatmap({ weeks, total }: { weeks: ContributionDay[][]; total: number }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.3 });
  const [selected, setSelected] = useState<ContributionDay | null>(null);

  // On narrow screens the grid scrolls sideways; start at the most recent weeks.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  // Month labels at the first week of each month.
  const months = weeks.map((week, i) => {
    const first = week[0];
    const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
    const prev = i > 0 ? new Date(`${weeks[i - 1][0].date}T00:00:00Z`).getUTCMonth() : -1;
    return month !== prev
      ? new Date(`${first.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
      : "";
  });

  // Monthly totals for the accessible table.
  const monthly = new Map<string, number>();
  for (const day of weeks.flat()) {
    const key = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    monthly.set(key, (monthly.get(key) ?? 0) + day.count);
  }

  const columns = `repeat(${weeks.length}, minmax(0.7rem, 1fr))`;

  return (
    <figure aria-labelledby="heatmap-caption">
      <figcaption id="heatmap-caption" className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-semibold">
          <span className="tabular-nums">{total.toLocaleString("en-US")}</span> contributions in the last year
        </span>
        <span aria-hidden className="flex items-center gap-1.5 text-sm text-ink-muted">
          Less
          {HEAT.map((heat) => (
            <span key={heat} className={`size-3 rounded-xs ${heat}`} />
          ))}
          More
        </span>
      </figcaption>

      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="min-w-2xl">
          <div aria-hidden className="mb-1 grid gap-0.75 text-xs text-ink-muted" style={{ gridTemplateColumns: columns }}>
            {months.map((label, i) => (
              <span key={i} className="whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>
          <div
            ref={gridRef}
            aria-hidden
            data-testid="heatmap"
            data-shown={inView || undefined}
            className="grid grid-flow-col grid-rows-7 gap-0.75"
            style={{ gridTemplateColumns: columns }}
            onPointerLeave={() => setSelected(null)}
          >
            {weeks.flatMap((week, col) =>
              week.map((day, row) => (
                <span
                  key={day.date}
                  data-day={day.date}
                  className={`heat-cell aspect-square rounded-xs ${HEAT[day.level]}`}
                  style={{ "--d": col + row, gridColumn: col + 1, gridRow: row + 1 } as React.CSSProperties}
                  onPointerEnter={() => setSelected(day)}
                  onPointerDown={() => setSelected(day)}
                />
              )),
            )}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 min-h-6 text-sm text-ink-muted">
        {selected
          ? `${formatDay(selected.date)}: ${selected.count} ${selected.count === 1 ? "contribution" : "contributions"}`
          : "Hover or tap a day to see its count."}
      </p>

      <details className="mt-2">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-accent">
          Show monthly totals
        </summary>
        <table className="mt-2 text-sm">
          <caption className="sr-only">Contributions per month, last year</caption>
          <thead className="text-ink-muted">
            <tr>
              <th scope="col" className="py-1 pr-6 text-left font-semibold">Month</th>
              <th scope="col" className="py-1 text-right font-semibold">Contributions</th>
            </tr>
          </thead>
          <tbody>
            {[...monthly.entries()].map(([month, count]) => (
              <tr key={month} className="border-t border-line">
                <td className="py-1 pr-6">{month}</td>
                <td className="py-1 text-right tabular-nums">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function Languages({ stats }: { stats: GitHubStats }) {
  return (
    <div>
      <h3 className="mb-1 text-lg">Top languages</h3>
      <p className="mb-4 text-sm text-ink-muted">
        {stats.languagesBasis === "bytes"
          ? "Share of code across the repositories I've contributed to."
          : "Primary language of my public repositories."}
      </p>
      <ul className="grid gap-3 md:grid-cols-2 md:gap-x-12">
        {stats.languages.map((language) => (
          <li key={language.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{language.name}</span>
              <span className="text-ink-muted tabular-nums">{Math.round(language.share * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-xs bg-heat-0">
              <motion.div
                data-reveal
                className="h-full origin-left rounded-xs bg-accent"
                style={{ width: `${Math.max(language.share * 100, 2)}%` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
