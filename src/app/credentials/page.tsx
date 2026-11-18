import type { Metadata } from "next";
import { Trophy } from "pixelarticons/react/Trophy.js";
import { SectionPage } from "@/components/SectionPage";
import {
  certificationGroups,
  certifications,
  education,
  featuredCertification as featured,
  formatMonth,
} from "@/content/credentials";
import { getSection } from "@/content/site";

const section = getSection("credentials");

export const metadata: Metadata = { title: section.label };

export default function CredentialsPage() {
  return (
    <SectionPage section={section}>
      <section aria-labelledby="education" className="mb-14">
        <h2 id="education" className="mb-5 text-2xl sm:text-3xl">
          Education
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {education.map((entry) => (
            <li key={entry.school} className="pixel-panel p-5">
              <p className="font-display text-lg">{entry.program}</p>
              <p className="mt-1">{entry.school}</p>
              {entry.note && <p className="mt-1 text-accent">{entry.note}</p>}
              <p className="mt-2 text-sm text-ink-muted">
                {entry.location}, {entry.period}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="certifications">
        <h2 id="certifications" className="mb-5 text-2xl sm:text-3xl">
          Certifications
        </h2>

        {/* The credential that matters most for data and AI roles, framed like a rare item. */}
        <a
          href={featured.url}
          className="pixel-panel mb-8 flex items-center gap-5 p-5 hover:text-accent sm:p-6"
        >
          <span className="pixel-slot grid size-16 shrink-0 place-items-center text-gold">
            <Trophy width={36} height={36} aria-hidden focusable={false} />
          </span>
          <span>
            <span className="block font-display text-xl">{featured.name}</span>
            <span className="mt-1 block text-ink-muted">
              {featured.issuer}, {formatMonth(featured.date)}
              {featured.expires && `, valid until ${formatMonth(featured.expires)}`}
            </span>
          </span>
        </a>

        <ul className="grid gap-x-8 sm:grid-cols-2">
          {certifications.map((cert) => (
            <li key={cert.name} className="py-2">
              <a
                href={cert.url}
                className="inline-flex min-h-11 flex-col justify-center hover:text-accent"
              >
                <span className="font-medium">{cert.name}</span>
                <span className="text-sm text-ink-muted">
                  {cert.issuer}, {formatMonth(cert.date)}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {certificationGroups.map((group, i) => (
          <section key={group.name} aria-labelledby={`cert-group-${i}`} className="mt-10">
            <h3 id={`cert-group-${i}`} className="text-xl">
              {group.name}
            </h3>
            <p className="mb-3 text-ink-muted">
              {group.issuer}, {group.modules.length} modules,{" "}
              {formatMonth(group.modules[0].date)} to{" "}
              {formatMonth(group.modules[group.modules.length - 1].date)}
            </p>
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {group.modules.map((module) => (
                <li key={module.name}>{module.name}</li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </SectionPage>
  );
}
