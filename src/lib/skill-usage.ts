import { projects, type Project } from "@/content/projects";
import { skillGroups } from "@/content/skills";

/**
 * Links skills and projects by exact name: a project's `stack` entry is the
 * same string as a skill in skills.ts. Everything is derived, nothing duplicated.
 */

const skillNames = new Set(skillGroups.flatMap((group) => group.skills));

/** Stable id fragment for a skill: "C#" -> "c-sharp", "Next.js" -> "next-js". */
export function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/#/g, "-sharp")
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Anchor id of a skill chip on the Skills page, and the hash that selects it. */
export const skillAnchor = (name: string) => `skill-${slug(name)}`;

export function isSkill(name: string) {
  return skillNames.has(name);
}

export function projectsUsing(skill: string): Project[] {
  return projects.filter((project) => project.stack.includes(skill));
}
