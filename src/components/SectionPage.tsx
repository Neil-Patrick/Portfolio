import type { ReactNode } from "react";
import type { SiteSection } from "@/content/site";
import { DecodeText } from "./motion/DecodeText";

type SectionPageProps = {
  section: SiteSection;
  children?: ReactNode;
};

/**
 * Shared shell for a section's own page, in the HUD style: one bracketed panel
 * holding the h1, lead sentence, and page body. On load the brackets "lock on"
 * and the title decodes into place. Navigation is the compass menu.
 */
export function SectionPage({ section, children }: SectionPageProps) {
  return (
    <article className="container-page py-12 sm:py-16">
      <div className="hud-corners hud-lock border border-line px-4 py-8 sm:p-8 lg:p-12">
        <h1 className="mb-3 font-display text-display font-bold">
          <DecodeText text={section.label} />
        </h1>
        <p className="max-w-prose text-lg text-ink-muted">{section.detail}</p>
        {children && <div className="mt-10 sm:mt-12">{children}</div>}
      </div>
    </article>
  );
}
