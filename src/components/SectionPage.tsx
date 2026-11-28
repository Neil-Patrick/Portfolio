import type { HTMLAttributes, ReactNode } from "react";
import type { SiteSection } from "@/content/site";
import { DecodeText } from "./motion/DecodeText";

type SectionPageProps = {
  section: SiteSection;
  /** The opening screen's content, under the title. */
  children?: ReactNode;
  /** Further screens, each wrapped in <Screen>, following the opening one. */
  after?: ReactNode;
};

/**
 * Shared shell for a section's own page, in the open "Signal" layout: no
 * frame around the page. A short teal rule marks the start, the title decodes
 * into place, the lead sits under it, and the body follows directly on the
 * background. Navigation is the compass menu.
 *
 * The page reads one section per screen: the title and the first content share
 * the opening screen (centred when they fit), and each part in `after` gets a
 * screen of its own below it.
 */
export function SectionPage({ section, children, after }: SectionPageProps) {
  return (
    <article className="container-page">
      <div className="screen-section">
        <SectionHeader section={section} />
        {children && <div className="mt-12 sm:mt-16">{children}</div>}
      </div>
      {after}
    </article>
  );
}

/**
 * The section page's title block: the teal rule, the decoding title (the page's
 * h1) and the lead. SectionPage uses it; a page whose screens come from one
 * component (Credentials) passes it in so it can sit in that component's first screen.
 */
export function SectionHeader({ section }: { section: SiteSection }) {
  return (
    <header className="max-w-3xl">
      <span aria-hidden className="mb-6 block h-0.5 w-12 bg-accent" />
      <h1 className="mb-4 font-display text-display font-bold">
        <DecodeText text={section.label} />
      </h1>
      <p className="max-w-prose text-lg text-ink-muted">{section.detail}</p>
    </header>
  );
}

/**
 * One more screen on a section page (or anywhere): at least the window's
 * height, content centred vertically (`screen-section` in globals.css). If
 * what it holds renders nothing, it takes no space.
 */
export function Screen({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`screen-section ${className}`} {...props}>
      {children}
    </div>
  );
}
