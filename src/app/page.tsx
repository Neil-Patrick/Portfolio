import Link from "next/link";
import { GitHubActivity } from "@/components/GitHubActivity";
import { PageBackground } from "@/components/background/PageBackground";
import { DepthGauge } from "@/components/nav/DepthGauge";
import { HeroIntro } from "@/components/hero/HeroIntro";
import { Landing } from "@/components/hero/Landing";
import { Collaborate } from "@/components/home/Collaborate";
import { IntroLoader } from "@/components/intro/IntroLoader";
import { CareerTimeline } from "@/components/CareerTimeline";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { Tilt } from "@/components/motion/Tilt";
import { ArrowLink, Section } from "@/components/Section";
import { TechIcon } from "@/components/TechIcon";
import { projects } from "@/content/projects";
import { getSection, homeIndex, site } from "@/content/site";
import { techIcons } from "@/content/tech";
import { isSkill, skillAnchor } from "@/lib/skill-usage";
import { buildTimeline } from "@/lib/timeline";

const timeline = buildTimeline();

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

/** Intro links: the three a recruiter needs first. */
const introLinks = site.contactLinks.filter((link) =>
  ["Email", "GitHub", "LinkedIn"].includes(link.label),
);

const about = getSection("about");
const projectsSection = getSection("projects");
const technologies = getSection("technologies");

/**
 * Home, top to bottom (the same order as `homeIndex` in site.ts, which the
 * depth gauge reads), after the loading screen: the landing, the intro, projects,
 * technologies, the career timeline (which also plots every certification),
 * GitHub activity, and the "Let's Build" invitation.
 */
export default function HomePage() {
  return (
    <>
      {/* Cyberpunk loading screen: first home visit in a tab only (decided before first paint). */}
      <IntroLoader />

      {/* Subtle wave lines, fixed behind every home section. */}
      <PageBackground />
      <DepthGauge items={homeIndex} />

      {/* Full-screen landing, running up behind the transparent header. */}
      <Landing />

      {/* Who I am: the name (the page's h1), role, intro, and links. Stands in for an About preview. */}
      <section id="about" aria-labelledby="intro-heading" className="py-16 sm:py-24">
        <div className="container-page grid gap-8">
          <HeroIntro name={site.name} role={site.role} intro={site.intro} links={introLinks} />
          <Reveal>
            <RevealItem>
              <ArrowLink href={about.href} label={about.cta} />
            </RevealItem>
          </Reveal>
        </div>
      </section>

      <Section id="projects" title={projectsSection.label} href={projectsSection.href} cta={projectsSection.cta}>
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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

      <Section id="technologies" title={technologies.label} href={technologies.href} cta={technologies.cta}>
        <Reveal className="flex flex-wrap gap-3">
          {site.featuredSkills.map((skill) => (
            <RevealItem key={skill}>
              <Link
                href={`/technologies#${skillAnchor(skill)}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-line-strong px-4 py-2 text-lg hover:border-accent hover:text-accent"
              >
                <TechIcon name={skill} />
                {skill}
              </Link>
            </RevealItem>
          ))}
        </Reveal>
      </Section>

      <section id="career-timeline" aria-label="Career Timeline" className="py-12 sm:py-16">
        <div className="container-page">
          <CareerTimeline points={timeline} />
        </div>
      </section>

      <Section id="github" title="GitHub Activity">
        <GitHubActivity />
      </Section>

      {/* The ask, right before the footer. */}
      <Collaborate />
    </>
  );
}
