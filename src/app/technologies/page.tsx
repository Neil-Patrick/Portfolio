import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { SkillExplorer } from "@/components/SkillExplorer";
import { getSection } from "@/content/site";
import { skillGroups, techDescriptions } from "@/content/skills";
import { projectsUsing, skillAnchor } from "@/lib/skill-usage";

const section = getSection("technologies");

export const metadata: Metadata = { title: section.label };

/** Skill groups with which projects use each skill, computed at build time. */
const groups = skillGroups.map((group) => ({
  name: group.name,
  skills: group.skills.map((name) => ({
    name,
    anchor: skillAnchor(name),
    description: techDescriptions[name] ?? "",
    projects: projectsUsing(name).map(({ id, name, summary }) => ({ id, name, summary })),
  })),
}));

export default function TechnologiesPage() {
  return (
    <SectionPage section={section}>
      <SkillExplorer groups={groups} />
    </SectionPage>
  );
}
