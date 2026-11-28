import { site } from "@/content/site";
import { DecodeText } from "../motion/DecodeText";
import { ScrollCue } from "./ScrollCue";

/**
 * Home's first screen: the name on its own, the page's h1, full screen and
 * centred, decoding in as the loading screen clears (still with reduced
 * motion). It runs up behind the transparent header. Neil plans more for this
 * section later; for now it holds only the name and the cue to the landing.
 */
export function NameHero() {
  return (
    <section
      id="home"
      aria-labelledby="home-name"
      className="relative -mt-header flex min-h-svh flex-col items-center justify-center overflow-hidden pt-header"
    >
      <div className="container-page @container text-center">
        <h1 id="home-name" className="font-display text-name font-bold text-balance text-ink">
          <DecodeText text={site.name} />
        </h1>
      </div>
      <ScrollCue href="#intro" to="the introduction" delay="1200ms" />
    </section>
  );
}
