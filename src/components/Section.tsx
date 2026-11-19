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
 * A home page section: anchor id, labelled h2 with an arrow to its page, content.
 * One background for the whole page: sections are separated by space only.
 * Heading and content reveal in sequence the first time they scroll into view.
 */
export function Section({ id, title, href, cta, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="py-12 sm:py-16">
      <Reveal className="container-page grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16">
        <RevealItem className="flex items-start justify-between gap-4 lg:justify-start">
          <h2 id={headingId} className="text-3xl sm:text-4xl">
            {title}
          </h2>
          {href && cta && (
            <Magnetic className="shrink-0">
              <Link
                href={href}
                aria-label={cta}
                title={cta}
                className="group grid size-11 place-items-center rounded-full border border-line-strong text-accent transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
              >
                <Icon icon={ArrowRight} className="transition-transform motion-safe:group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
          )}
        </RevealItem>
        <RevealItem>{children}</RevealItem>
      </Reveal>
    </section>
  );
}
