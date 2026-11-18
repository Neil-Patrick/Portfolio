import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { getSection, site } from "@/content/site";

const section = getSection("contact");

export const metadata: Metadata = { title: section.label };

export default function ContactPage() {
  return (
    <SectionPage section={section}>
      <ul className="grid max-w-xl gap-5">
        {site.contactLinks.map((link) => (
          <li key={link.label} className="pixel-panel">
            <a
              href={link.href}
              className="flex min-h-11 flex-col gap-1 px-5 py-4 hover:text-accent sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="font-display text-lg">{link.label}</span>
              <span className="break-all text-ink-muted">{link.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
