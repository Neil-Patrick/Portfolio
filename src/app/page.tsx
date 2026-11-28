import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Landing } from "@/components/hero/Landing";
import { NameHero } from "@/components/hero/NameHero";
import { Icon } from "@/components/icons";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { ScanImage } from "@/components/ScanImage";
import { Section } from "@/components/Section";
import { TechIcon } from "@/components/TechIcon";
import { projects } from "@/content/projects";
import { getSection } from "@/content/site";
import { techIcons } from "@/content/tech";
import { isSkill } from "@/lib/skill-usage";

/**
 * Up to six logos for a project preview card: technologies that have a real logo,
 * each logo shown once (React and React Native share one). Glyph-only names are
 * skipped; they say nothing at this size and the full stack is on the Projects page.
 */
function previewLogos(stack: string[]) {
  const seen = new Set<string>();
  return stack
    .filter((tool) => {
      const icon = techIcons[tool];
      if (!isSkill(tool) || !icon) return false;
      // React Native ships as its own file but draws the same atom as React.
      const key = tool === "React" || tool === "React Native" ? "react" : typeof icon.src === "string" ? icon.src : icon.src.src;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

const projectsSection = getSection("projects");

/**
 * Home, top to bottom (the same order as `homeIndex` in site.ts, which the
 * depth gauge reads), after the loading screen (rendered by the root layout):
 * the name on its own (the page's h1), the landing (headline, actions, Open to
 * Work, the hologram projector) and projects; the
 * "Let's Build" invitation opens the footer, on every page. The career
 * timeline and GitHub activity live on the About page.
 */
export default function HomePage() {
  return (
    <>
      {/* First screen: the name on its own (the page's h1), running up behind the transparent header. */}
      <NameHero />

      {/* Second screen: headline, actions, Open to Work, and the hologram projector. */}
      <Landing />

      <Section id="projects" title={projectsSection.label} href={projectsSection.href} cta={projectsSection.cta}>
        {/* Cards rise in one after another; each thumbnail's scan wipe follows the same stagger. */}
        <Reveal as="ul" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const thumbnail = project.images?.[0];
            return (
              <RevealItem as="li" key={project.id}>
                <Link
                  href={`/projects#${project.id}`}
                  className="project-card group hud-notch hud-notch-edge flex h-full flex-col border border-line-strong bg-surface/80 transition-colors hover:border-accent hover:[--edge:var(--color-accent)] focus-visible:-outline-offset-4"
                >
                  {thumbnail && (
                    <span className="relative block aspect-video border-b border-line">
                      <ScanImage
                        src={thumbnail.src}
                        alt={thumbnail.alt}
                        sizes="(min-width: 64rem) 30vw, (min-width: 48rem) 45vw, 90vw"
                        delay={index * 120}
                      />
                      {/* Slides in on hover or focus; the link itself already names the project. */}
                      <span
                        aria-hidden
                        className="card-tag absolute right-3 bottom-3 inline-flex items-center gap-1.5 bg-canvas/85 px-2.5 py-1 hud-label text-xs text-accent backdrop-blur-sm"
                      >
                        View Project
                        <Icon icon={ArrowRight} />
                      </span>
                    </span>
                  )}
                  <span className="flex flex-1 flex-col p-6 pr-8">
                    <span className="font-display text-2xl font-bold transition-colors group-hover:text-accent">{project.name}</span>
                    <span className="mt-2 flex-1 text-ink-muted">{project.summary}</span>
                    {/* Logos of the technologies it uses (names are in the project page). */}
                    <span aria-hidden className="mt-5 flex flex-wrap gap-2">
                      {previewLogos(project.stack).map((tool) => (
                        <TechIcon key={tool} name={tool} />
                      ))}
                    </span>
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </Reveal>
      </Section>

    </>
  );
}
