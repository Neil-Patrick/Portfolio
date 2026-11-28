import type { Metadata } from "next";
import { CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import { GitHubLogo, Icon } from "@/components/icons";
import { ProjectMedia } from "@/components/ProjectMedia";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { Screen, SectionPage } from "@/components/SectionPage";
import { TechIcon } from "@/components/TechIcon";
import { formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { getSection } from "@/content/site";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { skillAnchor } from "@/lib/skill-usage";

const section = getSection("projects");

export const metadata: Metadata = { title: section.label };

export default function ProjectsPage() {
  // One project per screen: the first shares the opening screen with the title, each one after gets its own.
  const entries = projects.map((project, index) => {
    const entry = (
      // Each project rises in on its own as it scrolls into view.
      <Reveal key={project.id}>
        <RevealItem>
          <article
            id={project.id}
            aria-labelledby={`project-${project.id}`}
            className="grid scroll-mt-8 gap-8 border-t border-line pt-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-12 lg:pt-14"
          >
            {/* Text: the left column on desktop, spanning both right-hand rows (screenshots, stack). */}
            <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <h2
                id={`project-${project.id}`}
                className="font-display text-3xl font-bold sm:text-4xl"
              >
                {project.name}
              </h2>
              <p className="mt-1 flex items-center gap-2 hud-label text-sm text-ink-muted tabular-nums">
                <Icon icon={CalendarDays} />
                Started {formatMonth(`${project.started}-01`)}
              </p>
              <p className="mt-3 max-w-prose text-lg">
                {project.description}
              </p>

              <ul className="mt-6 flex flex-wrap gap-4">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      {...newTab}
                      className="hud-notch hud-notch-edge inline-flex min-h-11 items-center gap-2 border border-line-strong py-2 pr-6 pl-4 font-semibold transition-colors hover:border-accent hover:text-accent hover:[--edge:var(--color-accent)] focus-visible:-outline-offset-4"
                    >
                      {/* Repository links get the GitHub mark; everything else is an outside site. */}
                      {link.href.startsWith("https://github.com/") ? (
                        <GitHubLogo />
                      ) : (
                        <Icon icon={ExternalLink} />
                      )}
                      {link.label}
                      <span className="sr-only">
                        {" "}
                        for {project.name}
                        {NEW_TAB_NOTE}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Screenshots: first in the card on phones; top of the right column on desktop. */}
            <div className="order-first lg:order-none lg:col-start-2 lg:row-start-1">
              <ProjectMedia project={project} />
            </div>

            <div className="lg:col-start-2">
              <h3 className="mb-3 hud-label text-sm text-ink-muted">
                Tech Stack
              </h3>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((tool) => (
                  <li key={tool}>
                    {/* Each opens the Technologies page with that one selected. */}
                    <Link
                      href={`/technologies#${skillAnchor(tool)}`}
                      className="hud-notch hud-notch-edge inline-flex min-h-11 items-center gap-2 border border-line-strong py-1 pr-4 pl-3 text-sm transition-colors hover:border-accent hover:text-accent hover:[--edge:var(--color-accent)] focus-visible:-outline-offset-4"
                    >
                      <TechIcon name={tool} />
                      {tool}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </RevealItem>
      </Reveal>
    );
    return index === 0 ? entry : <Screen key={project.id}>{entry}</Screen>;
  });

  return (
    <SectionPage section={section} after={entries.slice(1)}>
      {entries[0]}
    </SectionPage>
  );
}
