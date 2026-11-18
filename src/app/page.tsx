import type { ReactNode } from "react";
import { LearningChart } from "@/components/LearningChart";
import { Section } from "@/components/Section";
import { featuredCertification, formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { getSection, site, type SectionId } from "@/content/site";
import { buildTimeline } from "@/lib/timeline";

const timeline = buildTimeline();

/** Hero links: the three a recruiter needs first. */
const heroLinks = site.contactLinks.filter((link) =>
  ["Email", "GitHub", "LinkedIn"].includes(link.label),
);
const email = site.contactLinks.find((link) => link.label === "Email")!;

/** What each home preview shows, built from the real content files. */
const previews: Record<Exclude<SectionId, "home">, ReactNode> = {
  about: <p className="max-w-prose text-lg">{getSection("about").summary}</p>,
  credentials: (
    <div>
      <p className="font-semibold">{featuredCertification.name}</p>
      <p className="text-ink-muted tabular-nums">
        {featuredCertification.issuer}, {formatMonth(featuredCertification.date)}
      </p>
      <p className="mt-3 max-w-prose text-ink-muted">{getSection("credentials").summary}</p>
    </div>
  ),
  skills: (
    <ul className="flex flex-wrap gap-2">
      {site.featuredSkills.map((skill) => (
        <li key={skill} className="rounded-sm border border-line-strong px-3 py-1">
          {skill}
        </li>
      ))}
    </ul>
  ),
  projects: (
    <ul className="grid gap-4">
      {projects.map((project) => (
        <li key={project.id}>
          <p className="font-semibold">{project.name}</p>
          <p className="text-ink-muted">{project.summary}</p>
        </li>
      ))}
    </ul>
  ),
  contact: (
    <p className="text-lg">
      <a href={email.href} className="text-accent underline underline-offset-4 hover:no-underline">
        {email.text}
      </a>
    </p>
  ),
};

export default function HomePage() {
  return (
    <>
      <section id="home" aria-labelledby="home-heading" className="container-page py-12 sm:py-16">
        <h1 id="home-heading" className="text-display">
          {site.name}
        </h1>
        <p className="mt-3 text-xl text-ink-muted">{site.role}</p>
        <p className="mt-5 max-w-prose text-lg">{site.intro}</p>
        <ul className="mt-5 flex flex-wrap gap-x-6">
          {heroLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 hover:no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <LearningChart points={timeline} />
        </div>
      </section>

      {(Object.keys(previews) as (keyof typeof previews)[]).map((id) => {
        const section = getSection(id);
        return (
          <Section key={id} id={id} title={section.label} href={section.href} cta={section.cta}>
            {previews[id]}
          </Section>
        );
      })}
    </>
  );
}
