import { certifications, featuredCertification } from "@/content/credentials";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { cssVars } from "@/lib/css-vars";
import { IntroController } from "./IntroController";
import { IntroLogo } from "./IntroLogo";

/** The system check reports real counts from the content files. */
const checks = [
  { label: "Projects", value: `${projects.length}`, status: "Found" },
  {
    label: "Certifications",
    // "Verified" holds because only badges with a Credly verification link are counted.
    value: `${[featuredCertification, ...certifications].filter((cert) => cert.url).length}`,
    status: "Verified",
  },
  { label: "Technologies", value: `${skillGroups.flatMap((group) => group.skills).length}`, status: "Loaded" },
];

/** Dotted leader between a label and its value. */
const leader = <span className="min-w-4 flex-1 border-b border-dotted border-line-strong" />;

/**
 * The home page's cyberpunk loading screen. An inline script in the root
 * layout's <head> decides before first paint whether it plays (every full load
 * of Home, motion allowed; src/lib/intro.ts), so the page never
 * flashes first. Rendered by the root layout, first in <body> and outside the
 * page transition (whose fade would hide it until JavaScript loads). The look and timeline
 * are CSS (globals.css, "Loading screen"), in two acts after a CRT power-on:
 * first the data (the progress bar, a system check with real numbers, "Access
 * Granted"), which then glitches and wipes off the screen; then the NP logo
 * alone, centred and enlarged, tracing in letter by letter, igniting and
 * glitching, its sparkle spinning in, until a CRT power-off squashes it into a
 * bright line and a dot, like a TV switching off, and reveals the landing. IntroController handles skipping and preloading and the
 * handoff. It lasts about 6 seconds, or until a click or key.
 * Decorative for assistive tech: everything here is also on the page.
 */
export function IntroLoader() {
  return (
    <>
      <div aria-hidden className="intro" data-intro-overlay>
        <div className="intro-roll" />
        {/* Act 1, three rows: the status line at the top, the data block centered, an empty row below for balance. */}
        <div className="intro-screen relative z-1 grid h-full grid-rows-[1fr_auto_1fr] px-6 py-8 sm:px-12 sm:py-10">
          <p className="intro-data flex items-center gap-2 self-start hud-label text-xs text-ink-muted sm:text-sm">
            Establishing Connection
            <span className="boot-cursor inline-block h-3.5 w-2 bg-accent" />
          </p>

          <div className="intro-data mx-auto w-full max-w-3xl">
            <div className="flex items-center gap-3 hud-label text-xs text-ink-muted sm:text-sm">
              <span className="shrink-0">Loading Portfolio</span>
              <span className="relative h-1.5 flex-1 bg-line">
                <span
                  className="boot-fill absolute inset-0 bg-accent"
                  style={cssVars({ "--fill-delay": "400ms", "--fill-duration": "1900ms" })}
                />
              </span>
              <span className="shrink-0 text-accent tabular-nums">
                <span
                  className="boot-count"
                  style={cssVars({ "--to": 100, "--count-delay": "400ms", "--count-duration": "1900ms" })}
                />
                %
              </span>
            </div>

            <dl className="mt-5 grid max-w-md gap-2" style={cssVars({ "--row-start": "550ms", "--row-step": "320ms" })}>
              {checks.map((check, i) => (
                <div key={check.label} className="boot-row flex items-baseline gap-3" style={cssVars({ "--i": i })}>
                  <dt className="flex flex-1 items-baseline gap-3 hud-label text-xs text-ink-muted sm:text-sm">
                    {check.label}
                    {leader}
                  </dt>
                  <dd className="hud-label text-xs text-accent tabular-nums sm:text-sm">
                    <span className="boot-count" style={cssVars({ "--to": check.value })} /> {check.status}
                  </dd>
                </div>
              ))}
              <div className="boot-row flex items-baseline gap-3" style={cssVars({ "--i": checks.length })}>
                <dt className="flex flex-1 items-baseline gap-3 hud-label text-xs text-ink-muted sm:text-sm">
                  Status
                  {leader}
                </dt>
                <dd className="hud-label text-xs text-accent sm:text-sm">{site.availability}</dd>
              </div>
              {/* Real: IntroController preloads the heavy parts meanwhile and flips this to "Ready". */}
              <div className="boot-row flex items-baseline gap-3" style={cssVars({ "--i": checks.length + 1 })}>
                <dt className="flex flex-1 items-baseline gap-3 hud-label text-xs text-ink-muted sm:text-sm">
                  Assets
                  {leader}
                </dt>
                <dd data-intro-assets className="hud-label text-xs text-accent sm:text-sm">
                  Loading
                </dd>
              </div>
            </dl>

            <p className="intro-granted mt-6 font-display text-2xl font-bold tracking-widest text-accent uppercase sm:text-3xl">
              Access Granted
            </p>
          </div>

          {/* Act 2: the logo alone, centred and enlarged to fit the screen, once the data has gone. */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <IntroLogo />
          </div>
        </div>
      </div>
      <IntroController />
    </>
  );
}
