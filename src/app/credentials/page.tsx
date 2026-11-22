import { Award } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { SectionPage } from "@/components/SectionPage";
import {
  certifications,
  education,
  featuredCertification as featured,
  formatMonth,
} from "@/content/credentials";
import { getSection } from "@/content/site";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";

const section = getSection("credentials");

export const metadata: Metadata = { title: section.label };

/** One HUD log entry: caps title with its date on the right, details underneath. */
function LogEntry({ title, date, children }: { title: string; date: string; children: ReactNode }) {
  return (
    <>
      <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <span className="font-display text-xl font-semibold tracking-wide uppercase">{title}</span>
        <span className="hud-label shrink-0 text-sm text-ink-muted tabular-nums sm:max-w-xs sm:text-right">{date}</span>
      </span>
      <span className="mt-1 block text-ink-muted">{children}</span>
    </>
  );
}


export default function CredentialsPage() {
  return (
    <SectionPage section={section}>
      <section aria-labelledby="education" className="mb-14">
        <h2 id="education" className="mb-5 hud-label text-xl text-ink">
          Education
        </h2>
        <Reveal as="ul" className="grid gap-3">
          {education.map((entry) => (
            <RevealItem as="li" from="left" key={entry.school} className="hud-row px-4 py-3">
              <LogEntry title={entry.program} date={entry.period}>
                {entry.school}, {entry.location}
                {entry.note && <span className="block text-accent">{entry.note}</span>}
              </LogEntry>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      <section aria-labelledby="certifications">
        <h2 id="certifications" className="mb-5 hud-label text-xl text-ink">
          Certifications
        </h2>

        {/* The credential that matters most for data and AI roles: the highlighted entry,
            with one light sweep across it on load. */}
        <a
          href={featured.url}
          {...newTab}
          className="hud-notch hud-scan relative mb-6 flex items-center gap-4 bg-accent px-4 py-4 text-on-accent focus-visible:-outline-offset-4 focus-visible:outline-on-accent sm:gap-5 sm:px-6"
        >
          <Icon icon={Award} size={28} className="shrink-0" />
          <span className="flex-1">
            <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <span className="font-display text-2xl font-bold tracking-wide uppercase">{featured.name}</span>
              <span className="hud-label shrink-0 text-sm tabular-nums">{formatMonth(featured.date)}</span>
            </span>
            <span className="mt-1 block tabular-nums">
              {featured.issuer}
              {featured.expires && `, valid until ${formatMonth(featured.expires)}`}
            </span>
          </span>
          <span className="sr-only">{NEW_TAB_NOTE}</span>
        </a>

        <Reveal as="ul" className="grid gap-3">
          {certifications.map((cert) => (
            <RevealItem as="li" from="left" key={cert.name}>
              <a href={cert.url} {...newTab} className="hud-row hud-row-link block min-h-11 px-4 py-3">
                <LogEntry title={cert.name} date={formatMonth(cert.date)}>
                  {cert.issuer}
                </LogEntry>
                <span className="sr-only">{NEW_TAB_NOTE}</span>
              </a>
            </RevealItem>
          ))}
        </Reveal>
      </section>
    </SectionPage>
  );
}
