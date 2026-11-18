import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { getSection } from "@/content/site";

const section = getSection("about");

export const metadata: Metadata = { title: section.label };

export default function AboutPage() {
  return <SectionPage section={section} />;
}
