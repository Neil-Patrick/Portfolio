import type { Metadata } from "next";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { SectionPage } from "@/components/SectionPage";
import { education, featuredCertification, formatMonth } from "@/content/credentials";
import { getSection, site } from "@/content/site";

const section = getSection("about");

export const metadata: Metadata = { title: section.label };

const degree = education[0];

/** Quick facts, all taken from the content files. */
const facts = [
  { label: "Based In", value: degree.location },
  { label: "Studying", value: `${degree.program}, ${degree.school}` },
  { label: "Graduating", value: "2027 (expected)" },
  { label: "Heading Toward", value: "Data and AI" },
  {
    label: "Latest Certification",
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

        {/* HUD profile panel: caps field labels over teal values, printing in one by one. */}
        <aside
          aria-labelledby="at-a-glance"
          className="hud-corners self-start border border-line-strong bg-surface p-6"
        >
          <h2 id="at-a-glance" className="mb-5 hud-label text-lg text-ink">
            At a Glance
          </h2>
          <Reveal as="dl" className="grid gap-5">
            {facts.map((fact) => (
              <RevealItem key={fact.label} from="left">
                <dt className="hud-label text-sm text-ink-muted">{fact.label}</dt>
                <dd className="mt-0.5 font-display text-xl leading-snug font-semibold text-accent">
                  {fact.value}
                </dd>
              </RevealItem>
            ))}
          </Reveal>
        </aside>
      </div>
    </SectionPage>
  );
}
