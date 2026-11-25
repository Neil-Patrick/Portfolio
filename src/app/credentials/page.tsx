import type { Metadata } from "next";
import { CredentialPath } from "@/components/CredentialPath";
import { SectionPage } from "@/components/SectionPage";
import { getSection } from "@/content/site";

const section = getSection("credentials");

export const metadata: Metadata = { title: section.label };

/** Certifications as a chronological talent path, filterable by category (Education is on the About page). */
export default function CredentialsPage() {
  return (
    <SectionPage section={section}>
      <CredentialPath />
    </SectionPage>
  );
}
