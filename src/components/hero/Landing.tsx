import { ArrowDown } from "lucide-react";
import { site } from "@/content/site";
import { cssVars } from "@/lib/css-vars";
import { Icon } from "../icons";
import { DecodeText } from "../motion/DecodeText";
import { Magnetic } from "../motion/Tilt";
import { AvailabilityChip } from "./AvailabilityChip";
import { HoloProjector } from "./HoloProjector";
import { ScrollCue } from "./ScrollCue";

/**
 * Home's second screen, under the name (NameHero): a huge headline that decodes
 * in, the two main actions and the Open to Work chip, with the hologram
 * projector beside them (the illustrated avatar in a beam of light). The
 * headline's decode and the projection wait until the section is scrolled into
 * view. With reduced motion everything is shown at rest.
 */
export function Landing() {
  const { headline, primaryCta, secondaryCta } = site.landing;

  return (
    <section id="intro" aria-label="Introduction" className="relative flex min-h-svh flex-col justify-center overflow-hidden">
      <div className="container-page grid items-center gap-12 pt-12 pb-24 lg:grid-cols-2 lg:gap-16">
        {/* The column is a size container, so the headline scales to fit it. */}
        <div className="@container" data-landing-column>
          <p className="font-display text-landing font-bold">
            {headline.map((line) => (
              <span key={line} className="block whitespace-nowrap" data-landing-line>
                <DecodeText text={line} inView />
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

          {/* Open to Work, by the buttons: its own line, so the detail sliding out never reflows the row. */}
          <div className="load-fade mt-5" style={cssVars({ "--fade-delay": "900ms" })}>
            <AvailabilityChip />
          </div>
        </div>

        <HoloProjector />
      </div>

      <ScrollCue href="#projects" to="the Projects" delay="1800ms" />
    </section>
  );
}
