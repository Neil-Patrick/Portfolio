import type { ReactNode } from "react";
import type { SiteSection } from "@/content/site";
import { DecodeText } from "./motion/DecodeText";

type SectionPageProps = {
  section: SiteSection;
  children?: ReactNode;
};

/**
 * Shared shell for a section's own page, in the open "Signal" layout: no
 * frame around the page. A short teal rule marks the start, the title decodes
 * into place, the lead sits under it, and the body follows directly on the
 * background. Navigation is the compass menu.
 */
export function SectionPage({ section, children }: SectionPageProps) {
  return (
    <article className="container-page py-12 sm:py-16 lg:py-20">
      <header className="max-w-3xl">
        <span aria-hidden className="mb-6 block h-0.5 w-12 bg-accent" />
        <h1 className="mb-4 font-display text-display font-bold">
          <DecodeText text={section.label} />
        </h1>
        <p className="max-w-prose text-lg text-ink-muted">{section.detail}</p>
      </header>
      {children && <div className="mt-12 sm:mt-16">{children}</div>}
    </article>
  );
}
