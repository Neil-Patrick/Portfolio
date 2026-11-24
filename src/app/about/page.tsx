import type { Metadata } from "next";
import { CareerTimeline } from "@/components/CareerTimeline";
import { GitHubAchievements } from "@/components/GitHubAchievements";
import { GitHubActivity } from "@/components/GitHubActivity";
import { LogEntry } from "@/components/LogEntry";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { SectionPage } from "@/components/SectionPage";
import { education, featuredCertification, formatMonth } from "@/content/credentials";
import { getSection, site } from "@/content/site";
import { buildTimeline } from "@/lib/timeline";

const section = getSection("about");
const timeline = buildTimeline();

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
          <div className="mb-6">
            <ProfilePhoto sizes="(min-width: 1024px) 19rem, 90vw" />
          </div>
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

      <section aria-labelledby="education" className="mt-16 sm:mt-20">
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

      {/* The chart names itself (its caption reads "Career Timeline"). */}
      <section id="career-timeline" aria-label="Career Timeline" className="mt-16 sm:mt-20">
        <CareerTimeline points={timeline} />
      </section>

      <section id="github" aria-labelledby="github-heading" className="mt-16 grid gap-6 sm:mt-20">
        <h2 id="github-heading" className="hud-label text-xl text-ink">
          GitHub Activity
        </h2>
        <GitHubActivity />
        <GitHubAchievements />
      </section>
    </SectionPage>
  );
}
