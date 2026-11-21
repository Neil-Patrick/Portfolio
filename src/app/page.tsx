import Link from "next/link";
import type { ReactNode } from "react";
import { GitHubActivity } from "@/components/GitHubActivity";
import { ContactIcon } from "@/components/icons";
import { PageBackground } from "@/components/background/PageBackground";
import { DepthGauge } from "@/components/nav/DepthGauge";
import { HeroIntro } from "@/components/hero/HeroIntro";
import { CareerTimeline } from "@/components/CareerTimeline";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { Tilt } from "@/components/motion/Tilt";
import { Section } from "@/components/Section";
import { TechIcon } from "@/components/TechIcon";
import { featuredCertification, formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { getSection, sections, site, type SectionId } from "@/content/site";
import { techIcons } from "@/content/tech";
import { isSkill, skillAnchor } from "@/lib/skill-usage";
import { buildTimeline } from "@/lib/timeline";

const timeline = buildTimeline();

/**
 * Up to six logos for a project preview card: technologies that have a real logo,
 * each logo shown once (React and React Native share one). Glyph-only names are
 * skipped; they say nothing at this size and the full stack is on the Projects page.
 */
function previewLogos(stack: string[]) {
  const seen = new Set<string>();
  return stack
    .filter((tool) => {
      const icon = techIcons[tool];
      if (!isSkill(tool) || !icon) return false;
      // React Native ships as its own file but draws the same atom as React.
      const key = tool === "React" || tool === "React Native" ? "react" : typeof icon.src === "string" ? icon.src : icon.src.src;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

/** Hero links: the three a recruiter needs first. */
const heroLinks = site.contactLinks.filter((link) =>
  ["Email", "GitHub", "LinkedIn"].includes(link.label),
);
const email = site.contactLinks.find((link) => link.label === "Email")!;

/** What each home preview shows, built from the real content files. */
const previews: Record<Exclude<SectionId, "home">, ReactNode> = {
  about: <p className="max-w-prose text-xl">{getSection("about").summary}</p>,
  credentials: (
    <div>
      <p className="text-xl font-semibold">{featuredCertification.name}</p>
      <p className="text-ink-muted tabular-nums">
        {featuredCertification.issuer},{" "}
        {formatMonth(featuredCertification.date)}
      </p>
      <p className="mt-3 max-w-prose text-ink-muted">
        {getSection("credentials").summary}
      </p>
    </div>
  ),
  technologies: (
    <Reveal className="flex flex-wrap gap-3">
      {site.featuredSkills.map((skill) => (
        <RevealItem key={skill}>
          <Link
            href={`/technologies#${skillAnchor(skill)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-line-strong px-4 py-2 text-lg hover:border-accent hover:text-accent"
          >
            <TechIcon name={skill} />
            {skill}
          </Link>
        </RevealItem>
      ))}
    </Reveal>
  ),
  projects: (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {projects.map((project) => (
        <li key={project.id}>
          <Tilt className="h-full">
            <Link
              href={`/projects#${project.id}`}
              className="flex h-full flex-col rounded-md border border-line-strong bg-canvas p-6 transition-colors hover:border-accent"
            >
              <span className="text-xl font-semibold">{project.name}</span>
              <span className="mt-2 flex-1 text-ink-muted">
                {project.summary}
              </span>
              {/* Logos of the technologies it uses (names are in the project page). */}
              <span aria-hidden className="mt-5 flex flex-wrap gap-2">
                {previewLogos(project.stack).map((tool) => (
                  <TechIcon key={tool} name={tool} />
                ))}
              </span>
            </Link>
          </Tilt>
        </li>
      ))}
    </ul>
  ),
  contact: (
    <p className="text-2xl">
      <a
        href={email.href}
        className="group inline-flex items-center gap-3 text-accent"
      >
        <ContactIcon label={email.label} />
        <span className="break-all underline underline-offset-4 group-hover:no-underline">
          {email.text}
        </span>
      </a>
    </p>
  ),
};

/** On-page index (right edge, lg and up), in page order. */
const gaugeItems = [
  ...sections.map((section) => ({ id: section.id, label: section.label })),
  { id: "career-timeline", label: "Career Timeline" },
  { id: "github", label: "GitHub Activity" },
];

export default function HomePage() {
  return (
    <>
      {/* Subtle wave lines, fixed behind every home section. */}
      <PageBackground />
      <DepthGauge items={gaugeItems} />

      {/* Full-bleed hero, running up behind the transparent header. */}
      <section
        id="home"
        aria-labelledby="home-heading"
        className="relative -mt-header flex min-h-svh items-center overflow-hidden pt-header"
      >
        <div className="container-page relative py-16">
          <HeroIntro
            name={site.name}
            role={site.role}
            intro={site.intro}
            links={heroLinks}
          />
        </div>
      </section>

      {(Object.keys(previews) as (keyof typeof previews)[]).map((id) => {
        const section = getSection(id);
        return (
          <Section
            key={id}
            id={id}
            title={section.label}
            href={section.href}
            cta={section.cta}
          >
            {previews[id]}
          </Section>
        );
      })}

      {/* Data sections close the page, just before the footer. */}
      <section id="career-timeline" aria-label="Career Timeline" className="py-12 sm:py-16">
        <div className="container-page">
          <CareerTimeline points={timeline} />
        </div>
      </section>

      <Section id="github" title="GitHub Activity">
        <GitHubActivity />
      </Section>
    </>
  );
}
