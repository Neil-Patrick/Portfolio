import type { Metadata } from "next";
import { CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import { GitHubLogo, Icon } from "@/components/icons";
import { SectionPage } from "@/components/SectionPage";
import { TechIcon } from "@/components/TechIcon";
import { formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { getSection } from "@/content/site";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { isSkill, skillAnchor } from "@/lib/skill-usage";

const section = getSection("projects");

export const metadata: Metadata = { title: section.label };

const chip = "inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 py-1 text-sm";

export default function ProjectsPage() {
  return (
    <SectionPage section={section}>
      {/* One legend for every project's tech stack. */}
      <ul
        aria-label="Tech stack legend"
        className="mb-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-muted"
      >
        <li className="flex items-center gap-2">
          <TechIcon name="Service" />
          Service only, not listed under Technologies
        </li>
      </ul>

      <div className="space-y-10">
        {projects.map((project) => (
          <article
            key={project.id}
            id={project.id}
            aria-labelledby={`project-${project.id}`}
            className="grid gap-8 rounded-md border border-line-strong bg-surface p-5 sm:p-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12"
          >
            <div>
              <h2 id={`project-${project.id}`} className="text-2xl sm:text-3xl">
                {project.name}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted tabular-nums">
                <Icon icon={CalendarDays} />
                Started {formatMonth(`${project.started}-01`)}
              </p>
              <p className="mt-3 max-w-prose text-lg">{project.description}</p>

              <ul className="mt-6 flex flex-wrap gap-4">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      {...newTab}
                      className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-line-strong bg-canvas px-4 font-semibold hover:border-accent hover:text-accent"
                    >
                      {/* Repository links get the GitHub mark; everything else is an outside site. */}
                      {link.href.startsWith("https://github.com/") ? <GitHubLogo /> : <Icon icon={ExternalLink} />}
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

            <div>
              <h3 className="mb-3 text-base text-ink-muted">Tech Stack</h3>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((tool) => (
                  <li key={tool}>
                    {/* Technologies link to the Technologies page with that one selected. */}
                    {isSkill(tool) ? (
                      <Link
                        href={`/technologies#${skillAnchor(tool)}`}
                        className={`${chip} border-line-strong bg-canvas hover:border-accent hover:text-accent`}
                      >
                        <TechIcon name={tool} />
                        {tool}
                      </Link>
                    ) : (
                      <span className={`${chip} border-line bg-canvas`}>
                        <TechIcon name={tool} />
                        {tool}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}
