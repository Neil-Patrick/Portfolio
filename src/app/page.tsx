import { Section } from "@/components/Section";
import { sections, site } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <section id="home" aria-labelledby="home-heading" className="container-page py-24 sm:py-32">
        <p className="mb-4 font-mono text-sm text-ink-muted">{site.role}</p>
        <h1 id="home-heading" className="text-display font-bold tracking-tight">
          {site.name}
        </h1>
        <p className="mt-6 max-w-prose text-lg text-ink-muted">{site.intro}</p>
      </section>

      {sections
        .filter((section) => section.id !== "home")
        .map((section) => (
          <Section key={section.id} id={section.id} title={section.label} href={section.href}>
            <p className="max-w-prose text-ink-muted">{section.summary}</p>
          </Section>
        ))}
    </>
  );
}
