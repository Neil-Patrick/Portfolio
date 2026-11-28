import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icons";
import { Reveal, RevealItem } from "./motion/Reveal";
import { Magnetic } from "./motion/Tilt";

type SectionProps = {
  id: string;
  title: string;
  /** When set, the heading gets an arrow link to the section's own page. */
  href?: string;
  /** Accessible name and tooltip of that arrow, e.g. "See all projects". */
  cta?: string;
  children: ReactNode;
};

/**
 * A home page section in the open "Signal" layout: a short teal rule, the
 * title (visible now, so the page reads as chapters instead of floating
 * cards), the content directly on the background, then an arrow to the
 * section's own page. Content and arrow reveal in sequence the first time
 * they scroll into view. Like every section, it takes at least a full screen,
 * its content centred (`screen-section`).
 */
export function Section({ id, title, href, cta, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="screen-section">
      <Reveal className="container-page grid gap-8">
        <RevealItem>
          <span aria-hidden className="mb-5 block h-0.5 w-12 bg-accent" />
          <h2 id={headingId} className="font-display text-display font-bold">
            {title}
          </h2>
        </RevealItem>
        <RevealItem>{children}</RevealItem>
        {href && cta && (
          <RevealItem>
            <ArrowLink href={href} label={cta} />
          </RevealItem>
        )}
      </Reveal>
    </section>
  );
}

/**
 * Notched arrow button to a section's own page (the site's one button shape).
 * Icon only, so the label is its accessible name and tooltip, e.g. "See All
 * Projects".
 */
export function ArrowLink({ href, label }: { href: string; label: string }) {
  return (
    <Magnetic className="inline-block">
      <Link
        href={href}
        aria-label={label}
        title={label}
        className="group hud-notch hud-notch-edge grid size-11 place-items-center border border-line-strong text-accent transition-colors hover:border-accent hover:bg-accent hover:text-on-accent hover:[--edge:var(--color-accent)] focus-visible:-outline-offset-4"
      >
        <Icon icon={ArrowRight} className="transition-transform motion-safe:group-hover:translate-x-0.5" />
      </Link>
    </Magnetic>
  );
}
