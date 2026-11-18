import type { ReactNode } from "react";
import type { SiteSection } from "@/content/site";

type SectionPageProps = {
  section: SiteSection;
  children?: ReactNode;
};

/** Shared shell for a section's own page: h1, lead sentence, then the page body. */
export function SectionPage({ section, children }: SectionPageProps) {
  return (
    <article className="container-page py-12 sm:py-16">
      <h1 className="mb-3 text-display">{section.label}</h1>
      <p className="max-w-prose text-lg text-ink-muted">{section.detail}</p>
      {children && <div className="mt-10 sm:mt-12">{children}</div>}
    </article>
  );
}
