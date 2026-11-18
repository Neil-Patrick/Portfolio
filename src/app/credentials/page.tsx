import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { getSection } from "@/content/site";

const section = getSection("credentials");

export const metadata: Metadata = { title: section.label };

export default function CredentialsPage() {
  return <SectionPage section={section} />;
}
