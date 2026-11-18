import Link from "next/link";
import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  /** When set, adds an "Open" button to the section's own page. */
  href?: string;
  children: ReactNode;
};

/** A home page section with an anchor id, a labelled h2, and an optional link to its page. */
export function Section({ id, title, href, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="py-12 sm:py-16">
      <div className="container-page">
        <h2 id={headingId} className="mb-4 text-3xl sm:text-4xl">
          {title}
        </h2>
        {children}
        {href && (
          <Link
            href={href}
            className="pixel-button mt-6 inline-flex min-h-11 items-center px-4 font-display hover:text-accent"
          >
            Open {title}
          </Link>
        )}
      </div>
    </section>
  );
}
