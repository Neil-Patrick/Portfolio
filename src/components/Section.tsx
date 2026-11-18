import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal, RevealItem } from "./motion/Reveal";
import { Magnetic } from "./motion/Tilt";

type SectionProps = {
  id: string;
  title: string;
  /** When set, ends the section with a link to the section's own page. */
  href?: string;
  /** Link text, e.g. "See all projects". */
  cta?: string;
  /** Full-bleed surface band instead of the page canvas. */
  band?: boolean;
  children: ReactNode;
};

/**
 * A home page section: anchor id, labelled h2, content, and a link to its page.
 * No divider lines: sections are separated by space and by alternating bands.
 * Heading and content reveal in sequence the first time they scroll into view.
 */
export function Section({ id, title, href, cta, band = false, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={`py-16 sm:py-24 ${band ? "bg-surface" : ""}`}>
      <Reveal className="container-page grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16">
        <RevealItem>
          <h2 id={headingId} className="text-3xl sm:text-4xl">
            {title}
          </h2>
        </RevealItem>
        <RevealItem>
          {children}
          {href && cta && (
            <Magnetic className="mt-6">
              <Link
                href={href}
                className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 hover:no-underline"
              >
                {cta}
              </Link>
            </Magnetic>
          )}
        </RevealItem>
      </Reveal>
    </section>
  );
}
