import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { formatMonth } from "@/content/credentials";
import { projects } from "@/content/projects";
import { getSection } from "@/content/site";

const section = getSection("projects");

export const metadata: Metadata = { title: section.label };

export default function ProjectsPage() {
  return (
    <SectionPage section={section}>
      <div className="space-y-12">
        {projects.map((project) => (
          <article
            key={project.id}
            aria-labelledby={`project-${project.id}`}
            className="rounded-md border border-line-strong bg-surface p-5 sm:p-8"
          >
            <h2 id={`project-${project.id}`} className="text-2xl sm:text-3xl">
              {project.name}
            </h2>
            <p className="mt-1 text-sm text-ink-muted tabular-nums">Started {formatMonth(`${project.started}-01`)}</p>
            <p className="mt-3 max-w-prose text-lg">{project.description}</p>

            <h3 className="mt-6 mb-3 text-base text-ink-muted">Built with</h3>
            <ul className="flex flex-wrap gap-3">
              {project.stack.map((tool) => (
                <li key={tool} className="rounded-sm border border-line-strong bg-canvas px-3 py-1 text-sm">
                  {tool}
                </li>
              ))}
            </ul>

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
          </article>
        ))}
      </div>
    </SectionPage>
  );
}
