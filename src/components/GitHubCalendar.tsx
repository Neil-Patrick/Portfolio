"use client";

import { Table2 } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ContributionCalendar, ContributionDay } from "@/lib/github";
import { Icon } from "./icons";

const HEAT = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"];

function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Contribution calendar with one button per year, like the GitHub profile. */
export function GitHubCalendar({ calendars }: { calendars: ContributionCalendar[] }) {
  const [key, setKey] = useState(calendars[0].key);
  const calendar = calendars.find((c) => c.key === key) ?? calendars[0];

  return (
    <figure aria-labelledby="heatmap-caption" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <figcaption id="heatmap-caption" className="font-semibold">
          <span className="tabular-nums">{calendar.total.toLocaleString("en-US")}</span>{" "}
          {calendar.key === "past" ? "contributions in the last year" : `contributions in ${calendar.label}`}
        </figcaption>
        {calendars.length > 1 && (
          <div role="group" aria-label="Calendar year" className="flex flex-wrap gap-1">
            {calendars.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={c.key === key}
                onClick={() => setKey(c.key)}
                className="min-h-11 min-w-11 rounded-md px-3 text-sm text-ink-muted transition-colors hover:text-ink aria-pressed:bg-accent aria-pressed:font-semibold aria-pressed:text-on-accent"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Keyed so switching years replays the fill-in. */}
      <Grid key={calendar.key} weeks={calendar.weeks} />
    </figure>
  );
}

function Grid({ weeks }: { weeks: ContributionDay[][] }) {
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
    const month = new Date(`${week[0].date}T00:00:00Z`).getUTCMonth();
    const prev = i > 0 ? new Date(`${weeks[i - 1][0].date}T00:00:00Z`).getUTCMonth() : -1;
    return month !== prev
      ? new Date(`${week[0].date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
      : "";
  });

  // Monthly totals for the accessible table.
  const monthly = new Map<string, number>();
  for (const day of weeks.flat()) {
    const label = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    monthly.set(label, (monthly.get(label) ?? 0) + day.count);
  }

  const columns = `repeat(${weeks.length}, minmax(0.7rem, 1fr))`;
  // A week that starts mid-week (first column of a year) still places days on their weekday row.
  const rowOf = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay() + 1;

  return (
    <>
      {/* Focusable so keyboard users can scroll it sideways on narrow screens. */}
      <div
        ref={scrollRef}
        role="region"
        aria-label="Contribution calendar, scrollable"
        tabIndex={0}
        className="overflow-x-auto pb-2 outline-offset-4"
      >
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
            className="grid grid-rows-7 gap-0.75"
            style={{ gridTemplateColumns: columns }}
            onPointerLeave={() => setSelected(null)}
          >
            {weeks.flatMap((week, col) =>
              week.map((day) => {
                const row = rowOf(day.date);
                return (
                  <span
                    key={day.date}
                    data-day={day.date}
                    className={`heat-cell aspect-square rounded-xs ${HEAT[day.level]}`}
                    style={{ "--d": col + row, gridColumn: col + 1, gridRow: row } as React.CSSProperties}
                    onPointerEnter={() => setSelected(day)}
                    onPointerDown={() => setSelected(day)}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="min-h-6 text-sm text-ink-muted">
          {selected
            ? `${formatDay(selected.date)}: ${selected.count} ${selected.count === 1 ? "contribution" : "contributions"}`
            : "Hover or tap a day to see its count."}
        </p>
        <span aria-hidden className="flex items-center gap-1.5 text-sm text-ink-muted">
          Less
          {HEAT.map((heat) => (
            <span key={heat} className={`size-3 rounded-xs ${heat}`} />
          ))}
          More
        </span>
      </div>

      <details className="mt-2">
        <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-accent">
          <Icon icon={Table2} />
          Show monthly totals
        </summary>
        <table className="mt-2 text-sm">
          <caption className="sr-only">Contributions per month</caption>
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
    </>
  );
}
