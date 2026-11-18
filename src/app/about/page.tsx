import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { education, featuredCertification, formatMonth } from "@/content/credentials";
import { getSection, site } from "@/content/site";

const section = getSection("about");

export const metadata: Metadata = { title: section.label };

const degree = education[0];

/** Quick facts, all taken from the content files. */
const facts = [
  { label: "Based in", value: degree.location },
  { label: "Studying", value: `${degree.program}, ${degree.school}` },
  { label: "Graduating", value: "2027 (expected)" },
  { label: "Heading toward", value: "Data and AI" },
  {
    label: "Latest certification",
    value: `${featuredCertification.name} (${formatMonth(featuredCertification.date)})`,
  },
];

export default function AboutPage() {
  return (
    <SectionPage section={section}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-20">
        <div className="max-w-prose space-y-5 text-lg">
          {site.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <aside aria-labelledby="at-a-glance" className="self-start rounded-md border border-line-strong bg-surface p-6">
          <h2 id="at-a-glance" className="mb-4 text-lg">
            At a glance
          </h2>
          <dl className="grid gap-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm text-ink-muted">{fact.label}</dt>
                <dd className="font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </SectionPage>
  );
}
