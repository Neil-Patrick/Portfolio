"use client";

import { BadgeCheck, FolderGit2, Table2 } from "lucide-react";
import { useInView } from "motion/react";
import Link from "next/link";
import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatMonth } from "@/content/credentials";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import type { TimelinePoint } from "@/lib/timeline";
import { Icon } from "./icons";
import { CountUp } from "./motion/CountUp";
import { useElementWidth } from "./motion/useElementWidth";

/**
 * Certifications and projects as a circuit bus: one wire is time, each
 * certification branches up and each project branches down to a circle node,
 * and a pulse runs along the bus, blipping each node as it passes. The count
 * at the end of the wire is the running total.
 *
 * Drawn in real pixels (the plot's measured width), so traces stay crisp and
 * nodes stay round. Close items fan out over three heights and, if still
 * crowded, step sideways on a 45° bend. Phones get a vertical bus instead,
 * with each item's name beside its node.
 *
 * One selection drives the readout below: mouse (nearest node), tap, or arrow
 * keys. A table view lists every point.
 */

const DAY = 24 * 60 * 60 * 1000;
const HEIGHT = 300;
const BUS_Y = 196;
const PAD_LEFT = 10;
const END = 84; // room at the right for the total
const UP_LEVELS = [142, 98, 54]; // certification node heights, nearest the bus first
const DOWN_LEVELS = [246, 280]; // project node heights
const GAP = 26; // px between nodes on one level
const NODE = 14; // px

type Props = { points: TimelinePoint[] };

type Placed = { jx: number; nx: number; ny: number; t: number; path: string };

function layout(points: TimelinePoint[], width: number): Placed[] {
  const times = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = startOfMonth(times[0]);
  const t1 = times[times.length - 1] + 30 * DAY;
  const span = width - PAD_LEFT - END;
  const last = { up: UP_LEVELS.map(() => -Infinity), down: DOWN_LEVELS.map(() => -Infinity) };

  return points.map((point, i) => {
    const t = (times[i] - t0) / (t1 - t0);
    const jx = PAD_LEFT + t * span;
    const side = point.kind === "certification" ? "up" : "down";
    const levels = side === "up" ? UP_LEVELS : DOWN_LEVELS;
    const taken = last[side];
    // The first height with room; otherwise the emptiest, stepping sideways.
    let level = taken.findIndex((x) => jx - x >= GAP);
    let nx = jx;
    if (level === -1) {
      level = taken.indexOf(Math.min(...taken));
      nx = taken[level] + GAP;
    }
    taken[level] = nx;
    const ny = levels[level];
    const shift = Math.min(nx - jx, Math.abs(BUS_Y - ny) - 8);
    nx = jx + shift;
    const dir = ny < BUS_Y ? 1 : -1; // up: the bend sits below the node
    const path = `M${jx.toFixed(1)} ${BUS_Y}V${(ny + dir * shift).toFixed(1)}L${nx.toFixed(1)} ${ny}`;
    return { jx, nx, ny, t, path };
  });
}

export function CareerTimeline({ points }: Props) {
  const [selected, setSelected] = useState(points.length - 1);
  const [plotRef, width] = useElementWidth<HTMLDivElement>(1000);
  const plotInView = useInView(plotRef, { once: true, amount: 0.4 });
  const captionId = useId();

  const placed = layout(points, width);
  const busEnd = width - END + 8;

  const times = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = startOfMonth(times[0]);
  const t1 = times[times.length - 1] + 30 * DAY;
  const years = [];
  for (let year = new Date(t0).getUTCFullYear() + 1; year <= new Date(t1).getUTCFullYear(); year++) {
    years.push({ year, x: PAD_LEFT + ((Date.UTC(year, 0, 1) - t0) / (t1 - t0)) * (width - PAD_LEFT - END) });
  }

  // ---- Interaction ----
  const nearestTo = (clientX: number, clientY: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect) return selected;
    let best = 0;
    let bestDist = Infinity;
    placed.forEach((pos, i) => {
      const dx = pos.nx - (clientX - rect.left);
      const dy = pos.ny - (clientY - rect.top);
      const dist = dx * dx + dy * dy * 0.25; // favor horizontal distance: time is the main axis
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setSelected(nearestTo(event.clientX, event.clientY));
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => setSelected(nearestTo(event.clientX, event.clientY));
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = points.length - 1;
    const next = (
      { ArrowRight: Math.min(selected + 1, last), ArrowUp: Math.min(selected + 1, last), ArrowLeft: Math.max(selected - 1, 0), ArrowDown: Math.max(selected - 1, 0), Home: 0, End: last } as Record<string, number>
    )[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setSelected(next);
  };

  const certCount = points.filter((p) => p.kind === "certification").length;
  const projectCount = points.length - certCount;
  const current = points[selected];

  return (
    <figure aria-labelledby={captionId} className="m-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <figcaption id={captionId}>
          <span className="block hud-label text-lg text-ink">Career Timeline</span>
          <span className="block text-ink-muted tabular-nums">
            {certCount} certifications and {projectCount} projects since {formatMonth(points[0].date)}
          </span>
        </figcaption>
        <ul className="flex gap-5 text-sm text-ink-muted" aria-label="Legend">
          <li className="flex items-center gap-2">
            <Node kind="certification" />
            Certifications
          </li>
          <li className="flex items-center gap-2">
            <Node kind="project" />
            Projects
          </li>
        </ul>
      </div>

      {/* Wide screens: the horizontal bus. */}
      <div
        ref={plotRef}
        role="group"
        tabIndex={0}
        aria-label="Timeline plot. Use the left and right arrow keys to move between items."
        aria-describedby={`${captionId}-readout`}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className="relative hidden touch-pan-y outline-offset-4 sm:block"
        style={{ height: HEIGHT }}
      >
        <svg aria-hidden width={width} height={HEIGHT} className="absolute inset-0 overflow-visible" data-shown={plotInView || undefined}>
          {/* Year marks on the bus. */}
          {years.map(({ year, x }) => (
            <g key={year}>
              <line x1={x} x2={x} y1={BUS_Y - 6} y2={BUS_Y + 6} className="stroke-ink-muted" strokeWidth={1} />
              <text x={x + 5} y={BUS_Y + 17} className="fill-ink-muted hud-label text-xs">
                {year}
              </text>
            </g>
          ))}
          {placed.map((pos, i) => (
            <path
              key={points[i].id}
              d={pos.path}
              fill="none"
              pathLength={1}
              strokeWidth={i === selected ? 2 : 1.25}
              strokeLinejoin="miter"
              className={`bus-trace ${i === selected ? "stroke-accent" : "stroke-line-strong"}`}
              style={{ "--t": pos.t } as React.CSSProperties}
            />
          ))}
          <line x1={0} x2={busEnd} y1={BUS_Y} y2={BUS_Y} className="stroke-line-strong" strokeWidth={2} />
          <path d={`M0 ${BUS_Y}H${busEnd}`} pathLength={100} className="bus-pulse stroke-accent" strokeWidth={3} strokeLinecap="round" />
          {placed.map((pos, i) => (
            <circle key={points[i].id} cx={pos.jx} cy={BUS_Y} r={2.5} className="fill-ink-muted" />
          ))}
          <circle cx={busEnd} cy={BUS_Y} r={4} className="fill-canvas stroke-accent" strokeWidth={2} />
        </svg>

        {/* Nodes as HTML so they stay round and can glow. */}
        {placed.map((pos, i) => (
          <Node
            key={points[i].id}
            kind={points[i].kind}
            selected={i === selected}
            className="bus-node absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: pos.nx, top: pos.ny, "--t": pos.t } as React.CSSProperties}
          />
        ))}

        {/* The running total at the end of the wire. */}
        <div className="absolute grid -translate-y-1/2 justify-items-start" style={{ left: busEnd + 12, top: BUS_Y }}>
          <span className="font-display text-4xl leading-none font-bold">
            <CountUp value={points.length} />
          </span>
          <span className="hud-label text-xs text-ink-muted">Total</span>
        </div>
      </div>

      {/* Phones: a vertical bus, newest first, names beside the nodes. */}
      <ol className="relative grid gap-1 sm:hidden" aria-label="Timeline">
        <span aria-hidden className="absolute top-5 bottom-5 left-2.75 w-0.5 bg-line-strong" />
        {points
          .map((point, i) => ({ point, i }))
          .reverse()
          .map(({ point, i }) => (
            <li key={point.id}>
              <button
                type="button"
                aria-pressed={i === selected}
                onClick={() => setSelected(i)}
                className="group relative grid min-h-11 w-full grid-cols-[1.5rem_1.25rem_minmax(0,1fr)] items-center text-left"
              >
                <span aria-hidden className="justify-self-center">
                  <span className="block size-1.5 rounded-full bg-ink-muted" />
                </span>
                <span aria-hidden className={`h-px ${i === selected ? "bg-accent" : "bg-line-strong"}`} />
                <span className="flex min-w-0 items-center gap-3">
                  <Node kind={point.kind} selected={i === selected} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm group-aria-pressed:text-accent">{point.label}</span>
                    <span className="block hud-label text-xs text-ink-muted tabular-nums">{formatMonth(point.date)}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
      </ol>

      {/* Readout: what's selected, for mouse, touch, and keyboard alike. */}
      <p
        id={`${captionId}-readout`}
        aria-live="polite"
        data-testid="chart-readout"
        className="mt-6 flex min-h-11 flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-3"
      >
        <span className="hud-label text-sm text-ink-muted tabular-nums">
          {current.kind === "project" ? "Started " : ""}
          {formatMonth(current.date)}
        </span>
        <span className="font-semibold">{current.label}</span>
        <span className="text-ink-muted">{current.detail}</span>
        {current.href &&
          (current.kind === "project" ? (
            <Link href={current.href} className="inline-flex items-center gap-1.5 self-center text-accent underline underline-offset-2">
              <Icon icon={FolderGit2} />
              See Project
            </Link>
          ) : (
            <a href={current.href} {...newTab} className="inline-flex items-center gap-1.5 self-center text-accent underline underline-offset-2">
              <Icon icon={BadgeCheck} />
              Verify on Credly
              <span className="sr-only">{NEW_TAB_NOTE}</span>
            </a>
          ))}
      </p>

      <details className="mt-3">
        <summary className="inline-flex min-h-11 items-center gap-2 text-accent">
          <Icon icon={Table2} />
          Show as Table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Every certification and project, oldest first</caption>
            <thead className="text-ink-muted">
              <tr className="border-b border-line-strong">
                <th scope="col" className="py-2 pr-4 font-semibold">Date</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Item</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Type</th>
                <th scope="col" className="py-2 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.id} className="border-b border-line">
                  <td className="py-2 pr-4 whitespace-nowrap tabular-nums">{formatMonth(point.date)}</td>
                  <td className="py-2 pr-4">{point.label}</td>
                  <td className="py-2 pr-4">{point.kind === "project" ? "Project" : "Certification"}</td>
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

/**
 * A node: certifications are solid teal circles, projects amber rings with a
 * core, so identity never relies on color alone. The selected one gets an
 * ink ring and a glow.
 */
function Node({
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
  const look =
    kind === "project"
      ? "border-2 border-series-project bg-canvas after:absolute after:inset-[3px] after:rounded-full after:bg-series-project"
      : "bg-series-cert";
  const ring = selected
    ? "outline-2 outline-offset-2 outline-ink z-10 shadow-[0_0_14px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]"
    : "ring-2 ring-canvas";
  return (
    <span
      aria-hidden
      data-kind={kind}
      data-selected={selected || undefined}
      className={`block shrink-0 rounded-full ${look} ${ring} ${className || "relative"}`}
      style={{ width: NODE, height: NODE, ...style }}
    />
  );
}

function startOfMonth(t: number) {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}
