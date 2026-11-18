import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";
import { getSection, site } from "@/content/site";

const section = getSection("about");

export const metadata: Metadata = { title: section.label };

export default function AboutPage() {
  return (
    <SectionPage section={section}>
      <div className="max-w-prose space-y-5 text-lg">
        {site.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </SectionPage>
  );
}
