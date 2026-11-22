import { certifications, featuredCertification } from "@/content/credentials";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { cssVars } from "@/lib/css-vars";

/** The system check reports real counts from the content files. */
const checks = [
  { label: "Projects", count: projects.length, status: "Found" },
  {
    label: "Certifications",
    // "Verified" holds because only badges with a Credly verification link are counted.
    count: [featuredCertification, ...certifications].filter((cert) => cert.url).length,
    status: "Verified",
  },
  { label: "Technologies", count: skillGroups.flatMap((group) => group.skills).length, status: "Loaded" },
];

/** Dotted leader between a label and its value (drawn, not typed, so screen readers skip it). */
const leader = <span aria-hidden className="min-w-4 flex-1 border-b border-dotted border-line-strong" />;

/**
 * Landing visual "boot": a bracketed System Check panel that boots on load.
 * The progress bar fills, each row prints in with its number counting up,
 * then "Ready" and a blinking cursor. All CSS (globals.css, "boot sequence"),
 * so it starts at first paint; with reduced motion it simply shows the result.
 */
export function BootPanel() {
  return (
    <div className="hud-corners hud-lock border border-line bg-surface/80 p-5 backdrop-blur-sm sm:p-6">
      <p className="hud-label text-sm text-ink">System Check</p>

      {/* Decorative: a progress bar that fills to 100% while the rows print. */}
      <div aria-hidden className="mt-4 flex items-center gap-3 hud-label text-sm text-ink-muted">
        <span className="shrink-0">Loading Portfolio</span>
        <span className="relative h-1.5 flex-1 bg-line">
          <span className="boot-fill absolute inset-0 bg-accent" />
        </span>
        <span className="shrink-0 text-accent tabular-nums">
          <span
            className="boot-count"
            style={cssVars({ "--to": 100, "--count-delay": "150ms", "--count-duration": "1200ms" })}
          />
          %
        </span>
      </div>

      <dl className="mt-4 grid gap-2.5">
        {checks.map((check, i) => (
          <div key={check.label} className="boot-row flex items-baseline gap-3" style={cssVars({ "--i": i + 1 })}>
            <dt className="flex flex-1 items-baseline gap-3 hud-label text-sm text-ink-muted">
              {check.label}
              {leader}
            </dt>
            <dd className="hud-label text-sm text-accent tabular-nums">
              {/* The digits count up in CSS; screen readers get the real number. */}
              <span aria-hidden className="boot-count" style={cssVars({ "--to": check.count })} />
              <span className="sr-only">{check.count}</span> {check.status}
            </dd>
          </div>
        ))}
        <div className="boot-row flex items-baseline gap-3" style={cssVars({ "--i": checks.length + 1 })}>
          <dt className="flex flex-1 items-baseline gap-3 hud-label text-sm text-ink-muted">
            Status
            {leader}
          </dt>
          <dd className="flex items-center gap-2 hud-label text-sm text-accent">
            <span aria-hidden className="live-pulse size-2 shrink-0 rounded-full bg-accent" />
            {site.availability}
          </dd>
        </div>
      </dl>

      {/* Decorative: the boot finishes with a blinking cursor. */}
      <p
        aria-hidden
        className="boot-row mt-4 flex items-center gap-2 hud-label text-sm text-accent"
        style={cssVars({ "--i": checks.length + 2 })}
      >
        Ready
        <span className="boot-cursor inline-block h-4 w-2.5 bg-accent" />
      </p>
    </div>
  );
}
