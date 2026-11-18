import Link from "next/link";
import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  /** When set, ends the section with a link to the section's own page. */
  href?: string;
  /** Link text, e.g. "See all projects". */
  cta?: string;
  children: ReactNode;
};

/** A home page preview section: anchor id, labelled h2, content, and a link to its page. */
export function Section({ id, title, href, cta, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-line py-12 sm:py-16">
      <div className="container-page grid gap-4 md:grid-cols-[12rem_1fr] md:gap-10">
        <h2 id={headingId} className="text-2xl">
          {title}
        </h2>
        <div>
          {children}
          {href && cta && (
            <Link
              href={href}
              className="mt-5 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 hover:no-underline"
            >
              {cta}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
