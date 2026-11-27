import type { Metadata } from "next";
import { AboutConsole } from "@/components/about/AboutConsole";
import { ConsoleModule } from "@/components/about/ConsoleModule";
import { EducationTrace } from "@/components/about/EducationTrace";
import { SpotifyModule } from "@/components/about/SpotifyModule";
import { CareerTimeline } from "@/components/CareerTimeline";
import { GitHubAchievements } from "@/components/GitHubAchievements";
import { GitHubActivity } from "@/components/GitHubActivity";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { SectionPage } from "@/components/SectionPage";
import { certifications, education, featuredCertification, formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { getSection, site } from "@/content/site";
import { buildTimeline } from "@/lib/timeline";

const section = getSection("about");
const timeline = buildTimeline();
/** The timeline module's readout, counted from the content files. */
const timelineStatus = `${certifications.length + 1} Certifications, ${projects.length} Projects`;

export const metadata: Metadata = { title: section.label };

const degree = education[0];

/** Quick facts, all taken from the content files. */
const facts = [
  { label: "Based In", value: degree.location },
  // A short form of the degree and school (the full names are in Education below).
  { label: "Studying", value: "BS Computer Science, Intelligent Systems, LSPU – San Pablo City Campus" },
  { label: "Graduating", value: "2027 (expected)" },
  { label: "Heading Toward", value: "Data and AI" },
  {
    label: "Latest Certification",
    value: `${featuredCertification.name} (${formatMonth(featuredCertification.date)})`,
  },
];

export default function AboutPage() {
  return (
    <>
      <SectionPage section={section}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-20">
          <div className="max-w-prose space-y-5 text-lg">
            {site.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* Profile column, open (no panel): a hairline rail on its left, caps field labels over values, printing in one by one. */}
          <aside aria-labelledby="at-a-glance" className="self-start border-l border-line pl-6">
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
                  <dd className="mt-0.5 font-display text-xl leading-snug font-semibold text-ink">
                    {fact.value}
                  </dd>
                </RevealItem>
              ))}
            </Reveal>
          </aside>
        </div>

        {/* The console: one HUD module at a time, picked by tab (or the URL hash). */}
        <div className="mt-16 sm:mt-20">
          <AboutConsole
            panels={[
              {
                id: "education",
                label: "Education",
                content: (
                  <ConsoleModule title="Education" status={`${education.length} Records`}>
                    <EducationTrace />
                  </ConsoleModule>
                ),
              },
              {
                id: "career-timeline",
                label: "Career Timeline",
                content: (
                  <ConsoleModule title="Career Timeline" status={timelineStatus}>
                    <CareerTimeline points={timeline} />
                  </ConsoleModule>
                ),
              },
              {
                id: "github",
                label: "GitHub Activity",
                content: (
                  <ConsoleModule title="GitHub Activity" status="Synced Hourly" live>
                    <div className="grid gap-6">
                      <GitHubActivity />
                      <GitHubAchievements />
                    </div>
                  </ConsoleModule>
                ),
              },
            ]}
          />
        </div>
      </SectionPage>

      {/* Spotify on its own, below the About panel and above the footer:
          the radio tuner (hidden if Spotify isn't set up). */}
      <div className="container-page pb-12 sm:pb-16">
        <SpotifyModule />
      </div>
    </>
  );
}
