import Link from "next/link";
import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  /** When set, adds a "View all" link to the section's own page. */
  href?: string;
  children: ReactNode;
};

/** A home page section with an anchor id, a labelled h2, and an optional link to its page. */
export function Section({ id, title, href, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-line py-16 sm:py-24">
      <div className="container-page">
        <h2 id={headingId} className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {children}
        {href && (
          <Link
            href={href}
            className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-accent hover:underline"
          >
            View all {title} <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </section>
  );
}
