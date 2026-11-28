import type { Metadata } from "next";
import { CredentialPath } from "@/components/CredentialPath";
import { SectionHeader } from "@/components/SectionPage";
import { getSection } from "@/content/site";

const section = getSection("credentials");

export const metadata: Metadata = { title: section.label };

/**
 * Certifications as a chronological talent path, filterable by category (Education is on the About page).
 * Two screens from one component (they share the selection): the title, carousel and selected credential,
 * then Browse by Field. So the title is passed in rather than wrapped by SectionPage.
 */
export default function CredentialsPage() {
  return (
    <article className="container-page">
      <CredentialPath header={<SectionHeader section={section} />} />
    </article>
  );
}
