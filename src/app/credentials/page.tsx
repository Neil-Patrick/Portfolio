import type { Metadata } from "next";
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
            <li key={entry.school} className="rounded-md border border-line-strong bg-surface p-5">
              <p className="text-lg font-semibold">{entry.program}</p>
              <p className="mt-1">{entry.school}</p>
              {entry.note && <p className="mt-1 text-accent">{entry.note}</p>}
              <p className="mt-2 text-sm text-ink-muted tabular-nums">
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

        {/* The credential that matters most for data and AI roles, shown first and larger. */}
        <a
          href={featured.url}
          className="rounded-md border border-line-strong bg-surface mb-8 flex items-center gap-5 p-5 hover:border-accent sm:p-6"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-md bg-canvas text-accent">
            <AwardIcon />
          </span>
          <span>
            <span className="block text-xl font-semibold">{featured.name}</span>
            <span className="mt-1 block text-ink-muted tabular-nums">
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
                <span className="text-sm text-ink-muted tabular-nums">
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
            <p className="mb-3 text-ink-muted tabular-nums">
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

function AwardIcon() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1" />
    </svg>
  );
}
