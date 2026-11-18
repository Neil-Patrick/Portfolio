import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteSection } from "@/content/site";

type SectionPageProps = {
  section: SiteSection;
  children?: ReactNode;
};

/** Shared shell for a section's own page. Each page can replace its body as it grows. */
export function SectionPage({ section, children }: SectionPageProps) {
  return (
    <article className="container-page py-16 sm:py-24">
      <Link
        href="/"
        className="mb-8 inline-flex min-h-11 items-center gap-2 text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden>←</span> Back to home
      </Link>
      <h1 className="mb-6 text-display font-bold tracking-tight">{section.label}</h1>
      {children ?? <p className="max-w-prose text-lg text-ink-muted">{section.detail}</p>}
    </article>
  );
}
