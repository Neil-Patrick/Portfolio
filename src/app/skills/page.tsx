import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { getSection } from "@/content/site";

const section = getSection("skills");

export const metadata: Metadata = { title: section.label };

export default function SkillsPage() {
  return <SectionPage section={section} />;
}
