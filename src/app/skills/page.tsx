import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { getSection } from "@/content/site";
import { skillGroups } from "@/content/skills";

const section = getSection("skills");

export const metadata: Metadata = { title: section.label };

export default function SkillsPage() {
  return (
    <SectionPage section={section}>
      <div className="grid gap-10 sm:grid-cols-2">
        {skillGroups.map((group, i) => (
          <section key={group.name} aria-labelledby={`skill-group-${i}`}>
            <h2 id={`skill-group-${i}`} className="mb-4 text-xl">
              {group.name}
            </h2>
            <ul className="flex flex-wrap gap-3">
              {group.skills.map((skill) => (
                <li key={skill} className="pixel-slot px-3 py-2 text-ink">
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SectionPage>
  );
}
