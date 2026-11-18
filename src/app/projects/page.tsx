import type { Metadata } from "next";
import Link from "next/link";
import { SectionPage } from "@/components/SectionPage";
import { TechIcon } from "@/components/TechIcon";
import { formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { getSection } from "@/content/site";
import { techIcons } from "@/content/tech";
import { isSkill, skillAnchor } from "@/lib/skill-usage";

const section = getSection("projects");

export const metadata: Metadata = { title: section.label };

const chip = "inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 py-1 text-sm";

export default function ProjectsPage() {
  return (
    <SectionPage section={section}>
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
              <p className="mt-1 text-sm text-ink-muted tabular-nums">
                Started {formatMonth(`${project.started}-01`)}
              </p>
              <p className="mt-3 max-w-prose text-lg">{project.description}</p>

              <ul className="mt-6 flex flex-wrap gap-4">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex min-h-11 items-center rounded-sm border border-line-strong bg-canvas px-4 font-semibold hover:border-accent hover:text-accent"
                    >
                      {link.label}
                      <span className="sr-only"> for {project.name}</span>
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
                    {/* Skills link to the Skills page with that skill selected. */}
                    {isSkill(tool) ? (
                      <Link
                        href={`/skills#${skillAnchor(tool)}`}
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
              {/* Legend for the neutral glyph, only on cards that use it. */}
              {project.stack.some((tool) => !isSkill(tool) && !techIcons[tool]) && (
                <p className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
                  <TechIcon name="Service" />
                  Service only, not a skill
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}
