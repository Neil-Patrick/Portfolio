import Link from "next/link";
import { ArrowLeft } from "pixelarticons/react/ArrowLeft.js";
import type { ReactNode } from "react";
import type { SiteSection } from "@/content/site";

type SectionPageProps = {
  section: SiteSection;
  children?: ReactNode;
};

/** Shared shell for a section's own page. Each page can replace its body as it grows. */
export function SectionPage({ section, children }: SectionPageProps) {
  return (
    <article className="container-page py-12 sm:py-20">
      <Link
        href="/"
        className="pixel-button mb-8 inline-flex min-h-11 items-center gap-2 px-3 font-display hover:text-accent"
      >
        <ArrowLeft width={20} height={20} aria-hidden focusable={false} />
        Back to home
      </Link>
      <h1 className="mb-6 text-display">{section.label}</h1>
      {children ?? <p className="max-w-prose text-lg text-ink-muted">{section.detail}</p>}
    </article>
  );
}
