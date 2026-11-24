import Link from "next/link";
import { PageBackground } from "@/components/background/PageBackground";
import { DepthGauge } from "@/components/nav/DepthGauge";
import { Landing } from "@/components/hero/Landing";
import { Collaborate } from "@/components/home/Collaborate";
import { Tilt } from "@/components/motion/Tilt";
import { Section } from "@/components/Section";
import { TechIcon } from "@/components/TechIcon";
import { projects } from "@/content/projects";
import { getSection, homeIndex } from "@/content/site";
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
 * the landing (with the hologram card and the page's h1), projects, and the
 * "Let's Build" invitation. The career timeline and GitHub activity live on
 * the About page.
 */
export default function HomePage() {
  return (
    <>
      {/* Subtle wave lines, fixed behind every home section. */}
      <PageBackground />
      <DepthGauge items={homeIndex} />

      {/* Full-screen landing, running up behind the transparent header. */}
      <Landing />

      <Section id="projects" title={projectsSection.label} href={projectsSection.href} cta={projectsSection.cta}>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Tilt className="h-full">
                <Link
                  href={`/projects#${project.id}`}
                  className="hud-corners flex h-full flex-col border border-line-strong bg-canvas p-6 transition-colors hover:border-accent"
                >
                  <span className="text-xl font-semibold">{project.name}</span>
                  <span className="mt-2 flex-1 text-ink-muted">{project.summary}</span>
                  {/* Logos of the technologies it uses (names are in the project page). */}
                  <span aria-hidden className="mt-5 flex flex-wrap gap-2">
                    {previewLogos(project.stack).map((tool) => (
                      <TechIcon key={tool} name={tool} />
                    ))}
                  </span>
                </Link>
              </Tilt>
            </li>
          ))}
        </ul>
      </Section>

      {/* The ask, right before the footer. */}
      <Collaborate />
    </>
  );
}
