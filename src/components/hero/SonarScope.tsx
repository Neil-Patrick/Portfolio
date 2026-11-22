import Link from "next/link";
import { formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { cssVars } from "@/lib/css-vars";
import { RING, sonarContacts } from "@/lib/sonar";

const contacts = sonarContacts(projects);

/** Range rings inside the outer ring, as shares of its radius. */
const RANGES = [0.25, 0.5, 0.75];
/** Bezel ticks every 10°, longer at the cardinal points (like the compass menu's dial). */
const TICKS = Array.from({ length: 36 }, (_, i) => i * 10);
const CARDINALS = [
  { label: "N", deg: 0 },
  { label: "E", deg: 90 },
  { label: "S", deg: 180 },
  { label: "W", deg: 270 },
];

const point = (deg: number, radius: number) => {
  const radians = (deg * Math.PI) / 180;
  return { x: 50 + Math.sin(radians) * radius, y: 50 - Math.cos(radians) * radius };
};

/**
 * Landing visual "sonar": a scope where a teal sweep turns and each project
 * shows up as a contact that pings when the sweep passes it. Distance from the
 * center is real data (closer = started more recently; src/lib/sonar.ts);
 * bearing only spreads them out. Every contact is a link to its project, with
 * a lock-on bracket on hover and focus. The sweep and pings are CSS only
 * (globals.css, "sonar"), kept in step by sharing one period; with reduced
 * motion the scope is still and every contact is lit.
 */
export function SonarScope() {
  return (
    <figure className="sonar mx-auto w-full max-w-lg">
      <div className="relative aspect-square">
        {/* The instrument: range rings, crosshair, bezel ticks, and N/E/S/W. */}
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
          {RANGES.map((share) => (
            <circle
              key={share}
              cx={50}
              cy={50}
              r={RING * share}
              fill="none"
              className="stroke-line"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <circle
            cx={50}
            cy={50}
            r={RING}
            fill="none"
            className="stroke-line-strong"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <g className="stroke-line" strokeWidth={1}>
            <line x1={50} y1={50 - RING} x2={50} y2={50 + RING} vectorEffect="non-scaling-stroke" />
            <line x1={50 - RING} y1={50} x2={50 + RING} y2={50} vectorEffect="non-scaling-stroke" />
          </g>
          {TICKS.map((deg) => {
            const long = deg % 90 === 0;
            const inner = point(deg, RING + 1);
            const outer = point(deg, RING + (long ? 4 : 2.5));
            return (
              <line
                key={deg}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                strokeWidth={long ? 1.5 : 1}
                vectorEffect="non-scaling-stroke"
                className={long ? "stroke-line-strong" : "stroke-line"}
              />
            );
          })}
          {CARDINALS.map(({ label, deg }) => {
            const at = point(deg, RING + 6.5);
            return (
              <text
                key={label}
                x={at.x}
                y={at.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-ink-muted font-display font-semibold"
                fontSize={3.2}
              >
                {label}
              </text>
            );
          })}
        </svg>

        {/* The sweep: a fading teal wedge with a bright leading edge. */}
        <div
          aria-hidden
          className="sonar-sweep pointer-events-none absolute rounded-full"
          style={{ inset: `${50 - RING}%` }}
        />

        {/* Own position. */}
        <span aria-hidden className="absolute top-1/2 left-1/2 size-2 -translate-1/2 rotate-45 bg-accent shadow-glow" />

        <ul aria-label="Projects on the scope">
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className="absolute"
              style={cssVars({ left: `${contact.x}%`, top: `${contact.y}%`, "--bearing": contact.bearing })}
            >
              <Link
                href={`/projects#${contact.id}`}
                className="group absolute grid size-11 -translate-1/2 place-items-center outline-none hover:z-10 focus-visible:z-10"
              >
                {/* Lock-on brackets around the contact on hover and keyboard focus. */}
                <span
                  aria-hidden
                  className="hud-corners pointer-events-none absolute inset-0 scale-50 opacity-0 transition-[scale,opacity] duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                />
                <span aria-hidden className="sonar-blip relative size-2.5 rounded-full bg-accent shadow-glow" />
                {/* Label, facing away from the center; it flashes as the sweep passes and fills teal on hover. */}
                <span
                  className={`sonar-tag absolute top-1/2 max-w-24 -translate-y-1/2 border-line-strong bg-surface/90 px-2 py-1 leading-tight before:absolute before:inset-0 before:scale-x-0 before:bg-accent before:transition-transform before:duration-200 group-hover:before:scale-x-100 group-focus-visible:before:scale-x-100 sm:max-w-none sm:whitespace-nowrap ${
                    contact.side === "left"
                      ? "right-1/2 mr-4 border-r-2 text-right before:origin-right"
                      : "left-1/2 ml-4 border-l-2 before:origin-left"
                  }`}
                >
                  <span className="relative block hud-label text-xs text-ink group-hover:text-on-accent group-focus-visible:text-on-accent sm:text-sm">
                    {contact.name}
                  </span>
                  <span className="relative hidden text-xs text-ink-muted group-hover:text-on-accent group-focus-visible:text-on-accent sm:block">
                    Started {formatMonth(`${contact.started}-01`)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-4 text-center hud-label text-xs text-ink-muted">
        Closer to the Center Means More Recent
      </figcaption>
    </figure>
  );
}
