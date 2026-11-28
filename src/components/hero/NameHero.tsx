import { ArrowDown } from "lucide-react";
import { site } from "@/content/site";
import { cssVars } from "@/lib/css-vars";
import { Icon } from "../icons";
import { DecodeText } from "../motion/DecodeText";

/**
 * Home's first screen: the name on its own, the page's h1, full screen and
 * centred, decoding in as the loading screen clears (still with reduced
 * motion). It runs up behind the transparent header. Neil plans more for this
 * section later; for now it holds only the name and the Explore button down to the landing.
 */
export function NameHero() {
  return (
    <section
      id="home"
      aria-labelledby="home-name"
      className="relative -mt-header flex min-h-svh flex-col items-center justify-center overflow-hidden pt-header"
    >
      <div className="container-page @container flex flex-col items-center text-center">
        <h1 id="home-name" className="font-display text-name font-bold text-balance text-ink">
          <DecodeText text={site.name} />
        </h1>
        {/* Explore: on to the landing below. */}
        <a
          href="#intro"
          className="load-fade group mt-10 inline-flex min-h-11 items-center gap-2 border border-line-strong px-7 py-2 hud-label text-base transition-colors hover:border-accent hover:text-accent"
          style={cssVars({ "--fade-delay": "1000ms" })}
        >
          Explore
          <Icon icon={ArrowDown} className="transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
