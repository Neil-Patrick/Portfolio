import { ArrowDown, ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import { certifications, featuredCertification } from "@/content/credentials";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { Icon } from "../icons";
import { DecodeText } from "../motion/DecodeText";
import { Magnetic } from "../motion/Tilt";

/** CSS custom properties for inline styles (React's types only know standard properties). */
const vars = (values: Record<string, string | number>) => values as CSSProperties;

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
 * Home landing, the "boot sequence": a huge headline decodes in while a
 * bracketed System Check panel boots beside it. The progress bar fills, each
 * row prints in with its number counting up, then "Ready" and a blinking
 * cursor, and the main button gets one light sweep. All of that is CSS
 * (globals.css, "boot sequence"), so it starts at first paint; only the
 * headline decode needs JavaScript. With reduced motion everything is simply
 * shown in its final state. The h1 (the name) is in the intro below.
 */
export function Landing() {
  const { headline, primaryCta, secondaryCta } = site.landing;

  return (
    <section
      id="home"
      aria-label="Welcome"
      className="relative -mt-header flex min-h-svh flex-col justify-center overflow-hidden pt-header"
    >
      <div className="container-page grid items-center gap-12 pt-12 pb-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        {/* The column is a size container, so the headline scales to fit it. */}
        <div className="@container" data-landing-column>
          <p className="font-display text-landing font-bold">
            {headline.map((line) => (
              <span key={line} className="block whitespace-nowrap" data-landing-line>
                <DecodeText text={line} />
              </span>
            ))}
          </p>

          <div className="boot-fade mt-8 flex flex-wrap gap-4" style={vars({ "--fade-delay": "600ms" })}>
            <Magnetic className="inline-block">
              <a
                href="#contact"
                className="hud-notch hud-scan relative inline-flex min-h-11 items-center gap-2 bg-accent px-6 py-2 hud-label text-base text-on-accent focus-visible:-outline-offset-4 focus-visible:outline-on-accent"
                style={vars({ "--scan-delay": "1500ms" })}
              >
                {primaryCta}
                <Icon icon={ArrowDown} />
              </a>
            </Magnetic>
            <a
              href="#projects"
              className="inline-flex min-h-11 items-center border border-line-strong px-6 py-2 hud-label text-base transition-colors hover:border-accent hover:text-accent"
            >
              {secondaryCta}
            </a>
          </div>
        </div>

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
                style={vars({ "--to": 100, "--count-delay": "150ms", "--count-duration": "1200ms" })}
              />
              %
            </span>
          </div>

          <dl className="mt-4 grid gap-2.5">
            {checks.map((check, i) => (
              <div key={check.label} className="boot-row flex items-baseline gap-3" style={vars({ "--i": i + 1 })}>
                <dt className="flex flex-1 items-baseline gap-3 hud-label text-sm text-ink-muted">
                  {check.label}
                  {leader}
                </dt>
                <dd className="hud-label text-sm text-accent tabular-nums">
                  {/* The digits count up in CSS; screen readers get the real number. */}
                  <span aria-hidden className="boot-count" style={vars({ "--to": check.count })} />
                  <span className="sr-only">{check.count}</span> {check.status}
                </dd>
              </div>
            ))}
            <div className="boot-row flex items-baseline gap-3" style={vars({ "--i": checks.length + 1 })}>
              <dt className="flex flex-1 items-baseline gap-3 hud-label text-sm text-ink-muted">
                Status
                {leader}
              </dt>
              <dd className="flex items-center gap-2 hud-label text-sm text-accent">
                <span aria-hidden className="boot-pulse size-2 shrink-0 rounded-full bg-accent" />
                {site.availability}
              </dd>
            </div>
          </dl>

          {/* Decorative: the boot finishes with a blinking cursor. */}
          <p
            aria-hidden
            className="boot-row mt-4 flex items-center gap-2 hud-label text-sm text-accent"
            style={vars({ "--i": checks.length + 2 })}
          >
            Ready
            <span className="boot-cursor inline-block h-4 w-2.5 bg-accent" />
          </p>
        </div>
      </div>

      <a
        href="#about"
        className="boot-fade absolute inset-x-0 bottom-4 mx-auto flex min-h-11 w-fit flex-col items-center justify-center px-3 hud-label text-xs text-ink-muted transition-colors hover:text-accent"
        style={vars({ "--fade-delay": "1800ms" })}
      >
        <span>
          Scroll<span className="sr-only"> to the Intro</span>
        </span>
        <Icon icon={ChevronDown} className="boot-bob" />
      </a>
    </section>
  );
}
