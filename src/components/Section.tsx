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
 * A home page section: anchor id, content, then an arrow to its page.
 * The h2 is visually hidden (the content speaks for itself) but still names the
 * section for screen readers and the on-page index.
 * One background for the whole page: sections are separated by space only.
 * Content and arrow reveal in sequence the first time they scroll into view.
 */
export function Section({ id, title, href, cta, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="py-12 sm:py-16">
      <h2 id={headingId} className="sr-only">
        {title}
      </h2>
      <Reveal className="container-page grid gap-6">
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
 * Round arrow button to a section's own page (home page). Icon only, so the
 * label is its accessible name and tooltip, e.g. "See All Projects".
 */
export function ArrowLink({ href, label }: { href: string; label: string }) {
  return (
    <Magnetic className="inline-block">
      <Link
        href={href}
        aria-label={label}
        title={label}
        className="group grid size-11 place-items-center rounded-full border border-line-strong text-accent transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
      >
        <Icon icon={ArrowRight} className="transition-transform motion-safe:group-hover:translate-x-0.5" />
      </Link>
    </Magnetic>
  );
}
