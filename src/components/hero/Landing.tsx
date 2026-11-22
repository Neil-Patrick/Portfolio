import { ArrowDown, ChevronDown } from "lucide-react";
import { site } from "@/content/site";
import { cssVars } from "@/lib/css-vars";
import { Icon } from "../icons";
import { DecodeText } from "../motion/DecodeText";
import { Magnetic } from "../motion/Tilt";
import { HologramCard } from "./HologramCard";

/**
 * Home landing: a huge headline that decodes in and the two main actions, with
 * the hologram card beside them (photo, name as the page's h1, role, status).
 * On the first visit in a tab the cyberpunk loading screen plays first
 * (src/components/intro/), and the headline and the card's 3D pop start as it
 * clears. With reduced motion everything is shown at rest.
 */
export function Landing() {
  const { headline, primaryCta, secondaryCta } = site.landing;

  return (
    <section
      id="home"
      aria-label="Welcome"
      className="relative -mt-header flex min-h-svh flex-col justify-center overflow-hidden pt-header"
    >
      <div className="container-page grid items-center gap-12 pt-12 pb-24 lg:grid-cols-2 lg:gap-16">
        {/* The column is a size container, so the headline scales to fit it. */}
        <div className="@container" data-landing-column>
          <p className="font-display text-landing font-bold">
            {headline.map((line) => (
              <span key={line} className="block whitespace-nowrap" data-landing-line>
                <DecodeText text={line} />
              </span>
            ))}
          </p>

          <div className="load-fade mt-8 flex flex-wrap gap-4" style={cssVars({ "--fade-delay": "600ms" })}>
            <Magnetic className="inline-block">
              <a
                href="#contact"
                className="hud-notch hud-scan relative inline-flex min-h-11 items-center gap-2 bg-accent px-6 py-2 hud-label text-base text-on-accent focus-visible:-outline-offset-4 focus-visible:outline-on-accent"
                style={cssVars({ "--scan-delay": "1000ms" })}
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

        <HologramCard />
      </div>

      <a
        href="#projects"
        className="load-fade absolute inset-x-0 bottom-4 mx-auto flex min-h-11 w-fit flex-col items-center justify-center px-3 hud-label text-xs text-ink-muted transition-colors hover:text-accent"
        style={cssVars({ "--fade-delay": "1800ms" })}
      >
        <span>
          Scroll<span className="sr-only"> to the Projects</span>
        </span>
        <Icon icon={ChevronDown} className="cue-bob" />
      </a>
    </section>
  );
}
