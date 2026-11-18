import type { Metadata } from "next";
import { ContactIcon } from "@/components/icons";
import { SectionPage } from "@/components/SectionPage";
import { getSection, site } from "@/content/site";
import { NEW_TAB_NOTE, isExternal, linkTarget } from "@/lib/links";

const section = getSection("contact");

export const metadata: Metadata = { title: section.label };

export default function ContactPage() {
  return (
    <SectionPage section={section}>
      <ul className="grid gap-5 md:grid-cols-2">
        {site.contactLinks.map((link) => (
          <li key={link.label} className="rounded-md border border-line-strong bg-surface">
            <a
              href={link.href}
              {...linkTarget(link.href)}
              className="flex min-h-11 flex-col gap-1 px-5 py-4 hover:text-accent sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="inline-flex items-center gap-2 text-lg font-semibold">
                <ContactIcon label={link.label} />
                {link.label}
              </span>
              <span className="break-all text-ink-muted">{link.text}</span>
              {isExternal(link.href) && <span className="sr-only">{NEW_TAB_NOTE}</span>}
            </a>
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
