import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { getSection } from "@/content/site";

const section = getSection("contact");

export const metadata: Metadata = { title: section.label };

export default function ContactPage() {
  return <SectionPage section={section} />;
}
