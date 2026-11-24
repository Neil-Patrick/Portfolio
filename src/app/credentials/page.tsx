import type { Metadata } from "next";
import { CredentialExplorer } from "@/components/CredentialExplorer";
import { SectionPage } from "@/components/SectionPage";
import { getSection } from "@/content/site";

const section = getSection("credentials");

export const metadata: Metadata = { title: section.label };

/** Certifications by category, with a filter (Education is on the About page). */
export default function CredentialsPage() {
  return (
    <SectionPage section={section}>
      <CredentialExplorer />
    </SectionPage>
  );
}
