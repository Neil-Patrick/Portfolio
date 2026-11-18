import Link from "next/link";
import type { ReactNode } from "react";
import { GitHubActivity } from "@/components/GitHubActivity";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroIntro } from "@/components/hero/HeroIntro";
import { LearningChart } from "@/components/LearningChart";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { Tilt } from "@/components/motion/Tilt";
import { Section } from "@/components/Section";
import { TechIcon } from "@/components/TechIcon";
import { featuredCertification, formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { getSection, site, type SectionId } from "@/content/site";
import { isSkill, skillAnchor } from "@/lib/skill-usage";
import { buildTimeline } from "@/lib/timeline";

const timeline = buildTimeline();

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
        {featuredCertification.issuer}, {formatMonth(featuredCertification.date)}
      </p>
      <p className="mt-3 max-w-prose text-ink-muted">{getSection("credentials").summary}</p>
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
    <ul className="grid gap-6 md:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <Tilt className="h-full">
            <Link
              href={`/projects#${project.id}`}
              className="flex h-full flex-col rounded-md border border-line-strong bg-canvas p-6 transition-colors hover:border-accent"
            >
              <span className="text-xl font-semibold">{project.name}</span>
              <span className="mt-2 flex-1 text-ink-muted">{project.summary}</span>
              {/* Logos of the technologies it uses (names are in the project page). */}
              <span aria-hidden className="mt-5 flex flex-wrap gap-2">
                {project.stack.filter(isSkill).slice(0, 6).map((tool) => (
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
      <a href={email.href} className="text-accent underline underline-offset-4 hover:no-underline">
        {email.text}
      </a>
    </p>
  ),
};

/** Alternate full-bleed surface bands so sections separate without divider lines. */
const banded = new Set<keyof typeof previews>(["credentials", "projects"]);

export default function HomePage() {
  return (
    <>
      {/* Full-bleed hero, running up behind the transparent header. */}
      <section
        id="home"
        aria-labelledby="home-heading"
        className="relative -mt-header flex min-h-svh items-center overflow-hidden pt-header"
      >
        <HeroBackground />
        {/* Keeps the text readable (AA) over the moving network. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-canvas via-canvas/75 to-canvas/10"
        />
        <div className="container-page relative py-16">
          <HeroIntro name={site.name} role={site.role} intro={site.intro} links={heroLinks} />
        </div>
      </section>

      <section aria-label="Career timeline" className="py-16 sm:py-24">
        <div className="container-page">
          <LearningChart points={timeline} />
        </div>
      </section>

      <Section id="github" title="GitHub activity" band>
        <GitHubActivity />
      </Section>

      {(Object.keys(previews) as (keyof typeof previews)[]).map((id) => {
        const section = getSection(id);
        return (
          <Section
            key={id}
            id={id}
            title={section.label}
            href={section.href}
            cta={section.cta}
            band={banded.has(id)}
          >
            {previews[id]}
          </Section>
        );
      })}
    </>
  );
}
