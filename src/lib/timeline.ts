import {
  certificationGroups,
  certifications,
  featuredCertification,
} from "@/content/credentials";
import { projects } from "@/content/projects";

/**
 * Everything earned or built, as dated points for the home page chart.
 * Derived from the content files, so adding a credential or project there
 * updates the chart automatically.
 */

export type TimelineKind = "certification" | "project";

export type TimelinePoint = {
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  label: string;
  /** Issuer, program, or project note. */
  detail: string;
  kind: TimelineKind;
  href?: string;
  /** Running total including this point (1-based). */
  count: number;
};

export function buildTimeline(): TimelinePoint[] {
  const items: Omit<TimelinePoint, "count">[] = [
    ...[featuredCertification, ...certifications].map((cert) => ({
      id: `cert-${cert.name}`,
      date: cert.date,
      label: cert.name,
      detail: cert.issuer,
      kind: "certification" as const,
      href: cert.url,
    })),
    ...certificationGroups.flatMap((group) =>
      group.modules.map((module) => ({
        id: `module-${module.name}`,
        date: module.date,
        label: module.name,
        detail: `${group.issuer}, ${group.name}`,
        kind: "certification" as const,
      })),
    ),
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      date: `${project.started}-01`,
      label: project.name,
      detail: "Team project",
      kind: "project" as const,
      href: "/projects",
    })),
  ];

  return items
    .sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label))
    .map((item, i) => ({ ...item, count: i + 1 }));
}
