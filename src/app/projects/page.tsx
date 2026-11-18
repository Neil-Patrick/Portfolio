import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { getSection } from "@/content/site";

const section = getSection("projects");

export const metadata: Metadata = { title: section.label };

export default function ProjectsPage() {
  return <SectionPage section={section} />;
}
