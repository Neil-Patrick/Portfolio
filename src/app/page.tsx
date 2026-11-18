import { User } from "pixelarticons/react/User.js";
import { Section } from "@/components/Section";
import { sections, site } from "@/content/site";

export default function HomePage() {
  return (
    <>
      {/* Profile card: portrait, name plate, class, bio, and a hotbar of featured skills. */}
      <section id="home" aria-labelledby="home-heading" className="container-page py-12 sm:py-20">
        <div className="pixel-panel grid gap-6 p-4 sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-8">
          {/* PLACEHOLDER portrait: swap for a pixel avatar image. */}
          <div className="pixel-slot grid size-32 place-content-center justify-items-center gap-2 sm:size-44">
            <User width={56} height={56} aria-hidden focusable={false} />
            <span className="text-sm">[Your portrait]</span>
          </div>

          <div className="flex flex-col justify-center">
            <h1 id="home-heading" className="text-display">
              {site.name}
            </h1>
            <p className="mt-2 font-display text-lg text-accent sm:text-xl">{site.role}</p>
            <p className="mt-4 max-w-prose text-lg">{site.intro}</p>
          </div>

          <div className="sm:col-span-2">
            <h2 className="mb-3 font-display text-base text-ink-muted">Featured skills</h2>
            <ul className="grid max-w-sm grid-cols-5 gap-2 sm:gap-3">
              {site.featuredSkills.map((skill, i) => (
                <li key={i} className="flex flex-col items-center gap-1">
                  <span className="pixel-slot aspect-square w-full" aria-hidden />
                  <span className="text-xs text-ink-muted">{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
