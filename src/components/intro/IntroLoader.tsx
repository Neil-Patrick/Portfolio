import { certifications, featuredCertification } from "@/content/credentials";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { cssVars } from "@/lib/css-vars";
import { introInitScript } from "@/lib/intro";
import { InlineScript } from "../InlineScript";
import { IntroController } from "./IntroController";

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
 * The home page's cyberpunk loading screen. An inline script decides before
 * first paint whether it plays (first home visit in this tab, motion allowed;
 * src/lib/intro.ts), so the page never flashes first. The look and timeline
 * are CSS (globals.css, "Loading screen"): a CRT power-on, flicker, the name
 * glitching in, a system check with real numbers, "Access Granted", and a CRT
 * power-off that reveals the landing. IntroController handles skipping and
 * preloading and the handoff. It lasts about 5 seconds, or until a click or key.
 * Decorative for assistive tech: everything here is also on the page.
 */
export function IntroLoader() {
  return (
    <>
      <InlineScript html={introInitScript} />
      <div aria-hidden className="intro" data-intro-overlay>
        <div className="intro-roll" />
        <div className="intro-screen relative z-1 flex h-full flex-col justify-between px-6 py-8 sm:px-12 sm:py-10">
          <p className="flex items-center gap-2 hud-label text-xs text-ink-muted sm:text-sm">
            Establishing Connection
            <span className="boot-cursor inline-block h-3.5 w-2 bg-accent" />
          </p>

          <div className="mx-auto w-full max-w-3xl">
            <p
              className="intro-name font-display text-intro font-bold tracking-wide uppercase"
              data-text={site.name}
            >
              {site.name}
            </p>

            <div className="mt-8 flex items-center gap-3 hud-label text-xs text-ink-muted sm:text-sm">
              <span className="shrink-0">Loading Portfolio</span>
              <span className="relative h-1.5 flex-1 bg-line">
                <span
                  className="boot-fill absolute inset-0 bg-accent"
                  style={cssVars({ "--fill-delay": "500ms", "--fill-duration": "3600ms" })}
                />
              </span>
              <span className="shrink-0 text-accent tabular-nums">
                <span
                  className="boot-count"
                  style={cssVars({ "--to": 100, "--count-delay": "500ms", "--count-duration": "3600ms" })}
                />
                %
              </span>
            </div>

            <dl className="mt-5 grid max-w-md gap-2" style={cssVars({ "--row-start": "900ms", "--row-step": "550ms" })}>
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

          <p className="load-fade text-center hud-label text-xs text-ink-muted" style={cssVars({ "--fade-delay": "600ms" })}>
            Click Anywhere to Continue
          </p>
        </div>
      </div>
      <IntroController />
    </>
  );
}
