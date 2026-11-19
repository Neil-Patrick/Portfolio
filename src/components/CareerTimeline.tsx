"use client";

import { BadgeCheck, FolderGit2, Table2 } from "lucide-react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { formatMonth } from "@/content/credentials";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import type { TimelinePoint } from "@/lib/timeline";
import { Icon } from "./icons";

/**
 * Cumulative timeline of certifications and projects.
 *
 * Built in two layers so nothing distorts at any width:
 * - SVG (stretched with preserveAspectRatio="none") for gridlines and the step line,
 *   using non-scaling strokes so lines stay 1px / 2px.
 * - HTML for markers and axis labels, positioned in percentages, so circles stay
 *   round and text stays real size.
 *
 * One selection drives everything: mouse (nearest point), tap, or arrow keys
 * update the readout below the plot. A table view lists every point.
 */

const DAY = 24 * 60 * 60 * 1000;
const MARKER = 10; // px; dataviz minimum is 8

type Props = { points: TimelinePoint[] };

export function CareerTimeline({ points }: Props) {
  const [selected, setSelected] = useState(points.length - 1);
  const plotRef = useRef<HTMLDivElement>(null);
  const plotInView = useInView(plotRef, { once: true, amount: 0.4 });
  const captionId = useId();

  // ---- Scales (percent of the plot area) ----
  const times = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = startOfMonth(times[0]);
  const t1 = startOfMonth(times[times.length - 1]) + 45 * DAY; // a little air after the last point
  const x = (t: number) => ((t - t0) / (t1 - t0)) * 100;

  const step = points.length > 20 ? 10 : 5;
  const yMax = Math.ceil(points.length / step) * step;
  const y = (count: number) => 100 - (count / yMax) * 100;
  const yTicks = Array.from({ length: yMax / step + 1 }, (_, i) => i * step);

  const firstYear = new Date(t0).getUTCFullYear() + 1;
  const lastYear = new Date(t1).getUTCFullYear();
  const yearTicks = Array.from(
    { length: lastYear - firstYear + 1 },
    (_, i) => firstYear + i,
  );

  const positions = points.map((p, i) => ({
    left: x(times[i]),
    top: y(p.count),
  }));

  // Step line: flat until each new item, then up by one.
  let path = `M 0 100 H ${positions[0].left}`;
  for (const pos of positions) path += ` H ${pos.left} V ${pos.top}`;
  path += ` H 100`;

  // ---- Interaction ----
  const nearestTo = (clientX: number, clientY: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect) return selected;
    let best = 0;
    let bestDist = Infinity;
    positions.forEach((pos, i) => {
      const dx = (pos.left / 100) * rect.width - (clientX - rect.left);
      const dy = (pos.top / 100) * rect.height - (clientY - rect.top);
      const dist = dx * dx + dy * dy * 0.25; // favor horizontal distance: time is the main axis
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse")
      setSelected(nearestTo(event.clientX, event.clientY));
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setSelected(nearestTo(event.clientX, event.clientY));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = points.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? Math.min(selected + 1, last)
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? Math.max(selected - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
  };

  const certCount = points.filter((p) => p.kind === "certification").length;
  const projectCount = points.length - certCount;
  const current = points[selected];
  const currentPos = positions[selected];

  return (
    <figure
      aria-labelledby={captionId}
      className="rounded-md border border-line-strong bg-surface p-4 sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <figcaption id={captionId}>
          <span className="block font-semibold">Career Timeline</span>
          <span className="block text-ink-muted tabular-nums">
            {certCount} certifications and {projectCount} projects since{" "}
            {formatMonth(points[0].date)}
          </span>
        </figcaption>
        <ul className="flex gap-4 text-sm text-ink-muted" aria-label="Legend">
          <li className="flex items-center gap-2">
            <Marker kind="certification" />
            Certifications
          </li>
          <li className="flex items-center gap-2">
            <Marker kind="project" />
            Projects
          </li>
        </ul>
      </div>

      {/* Plot with axis gutters: y labels on the left, year labels underneath. */}
      <div className="relative h-56 pb-7 pl-8 sm:h-72 sm:pl-9 xl:h-96">
        {/* Y axis labels */}
        <div aria-hidden className="absolute top-0 bottom-7 left-0 w-6 sm:w-7">
          {yTicks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2 text-xs text-ink-muted tabular-nums"
              style={{ top: `${y(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>

        <div
          ref={plotRef}
          role="group"
          tabIndex={0}
          aria-label="Timeline plot. Use the left and right arrow keys to move between items."
          aria-describedby={`${captionId}-readout`}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          className="relative h-full touch-pan-y outline-offset-4"
        >
          <svg
            aria-hidden
            className="absolute inset-0 size-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {yTicks.map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={100}
                y1={y(tick)}
                y2={y(tick)}
                className={tick === 0 ? "stroke-line-strong" : "stroke-line"}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* Crosshair at the selected point */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-line-strong"
            style={{ left: `${currentPos.left}%` }}
          />

          {/* Line and markers share one wrapper so they're revealed together, left to right,
              the first time the chart scrolls into view (instantly with reduced motion). */}
          <motion.div
            aria-hidden
            data-reveal
            className="absolute inset-0"
            initial={{ clipPath: "inset(-12px 100% -12px -12px)" }}
            // Triggered by the plot entering view, not this element: a fully clipped
            // element never counts as "in view" to IntersectionObserver.
            animate={
              plotInView
                ? { clipPath: "inset(-12px -12px -12px -12px)" }
                : undefined
            }
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              className="absolute inset-0 size-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={path}
                fill="none"
                className="stroke-ink-muted"
                strokeWidth={2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {points.map((point, i) => (
              <Marker
                key={point.id}
                kind={point.kind}
                selected={i === selected}
                style={{
                  left: `${positions[i].left}%`,
                  top: `${positions[i].top}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              />
            ))}
          </motion.div>

          {/* X axis: year boundaries */}
          <div aria-hidden className="absolute inset-x-0 -bottom-7 h-6">
            {yearTicks.map((year) => {
              const left = x(Date.UTC(year, 0, 1));
              if (left < 0 || left > 100) return null;
              return (
                <span
                  key={year}
                  className="absolute top-1 -translate-x-1/2 text-xs text-ink-muted tabular-nums"
                  style={{ left: `${left}%` }}
                >
                  {year}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Readout: what's selected, for mouse, touch, and keyboard alike. */}
      <p
        id={`${captionId}-readout`}
        aria-live="polite"
        data-testid="chart-readout"
        className="mt-4 flex min-h-11 flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-3"
      >
        <span className="text-ink-muted tabular-nums">
          {current.kind === "project" ? "Started " : ""}
          {formatMonth(current.date)}
        </span>
        <span className="font-semibold">{current.label}</span>
        <span className="text-ink-muted">{current.detail}</span>
        {current.href &&
          (current.kind === "project" ? (
            <Link
              href={current.href}
              className="inline-flex items-center gap-1.5 self-center text-accent underline underline-offset-2"
            >
              <Icon icon={FolderGit2} />
              See Project
            </Link>
          ) : (
            <a
              href={current.href}
              {...newTab}
              className="inline-flex items-center gap-1.5 self-center text-accent underline underline-offset-2"
            >
              <Icon icon={BadgeCheck} />
              Verify on Credly
              <span className="sr-only">{NEW_TAB_NOTE}</span>
            </a>
          ))}
      </p>

      <details className="mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-accent">
          <Icon icon={Table2} />
          Show as Table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Every certification and project, oldest first
            </caption>
            <thead className="text-ink-muted">
              <tr className="border-b border-line-strong">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Date
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Item
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Type
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.id} className="border-b border-line">
                  <td className="py-2 pr-4 whitespace-nowrap tabular-nums">
                    {formatMonth(point.date)}
                  </td>
                  <td className="py-2 pr-4">{point.label}</td>
                  <td className="py-2 pr-4">
                    {point.kind === "project" ? "Project" : "Certification"}
                  </td>
                  <td className="py-2 text-ink-muted">{point.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

/** Circle for certifications, square for projects: identity never relies on color alone. */
function Marker({
  kind,
  selected = false,
  className = "",
  style,
}: {
  kind: TimelinePoint["kind"];
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const shape =
    kind === "project"
      ? "rounded-xs bg-series-project"
      : "rounded-full bg-series-cert";
  // A 2px canvas ring separates overlapping markers; the selected one gets an ink ring too.
  const ring = selected
    ? "outline-2 outline-ink outline-offset-1 ring-2 ring-surface z-10"
    : "ring-2 ring-surface";
  return (
    <span
      aria-hidden
      data-kind={kind}
      data-selected={selected || undefined}
      className={`block shrink-0 ${shape} ${ring} ${className}`}
      style={{ width: MARKER, height: MARKER, ...style }}
    />
  );
}

function startOfMonth(t: number) {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}
