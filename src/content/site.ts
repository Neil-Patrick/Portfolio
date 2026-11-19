/**
 * Site-wide content. Sources: CV, Credly, previous portfolio, and project repos.
 * Anything in [square brackets] is a PLACEHOLDER. Do not ship placeholders.
 */

export const site = {
  name: "Neil Patrick Pajadan",
  role: "Computer Science student specializing in Intelligent Systems",
  intro:
    "I'm a Computer Science student at Laguna State Polytechnic University, graduating in 2027. I build web apps with TypeScript and Next.js, and I'm moving toward data and AI work.",
  description:
    "Neil Patrick Pajadan, a Computer Science student in Laguna, Philippines, building web apps and moving toward data and AI.",
  /** GitHub login for the home page activity section (stats come from the GitHub API). */
  githubUsername: "Neil-Patrick",
  /** Featured technologies in the home page preview. Up to 5. */
  featuredSkills: ["Python", "SQL", "PostgreSQL", "TypeScript", "Next.js"],
  /** Footer and Contact page. Phone number deliberately left off the public site. */
  contactLinks: [
    { label: "Email", href: "mailto:neilpatrick.dev@gmail.com", text: "neilpatrick.dev@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/neil-patrick-pajadan/", text: "neil-patrick-pajadan" },
    { label: "GitHub", href: "https://github.com/Neil-Patrick", text: "Neil-Patrick" },
    { label: "Credly", href: "https://www.credly.com/users/neil-patrick-pajadan", text: "neil-patrick-pajadan" },
  ],
  /** About page body, one string per paragraph. */
  about: [
    "I'm a Computer Science student at Laguna State Polytechnic University in San Pablo City, specializing in Intelligent Systems. I expect to graduate in 2027.",
    "Most of what I've built so far is for the web: a flood-risk forecast app, an anonymous message board, and GADvance, a learning platform for our university's Gender and Development office. I build these with my thesis teammates, and we share the work across the whole stack, from the database to the interface.",
    "Now I'm moving toward data and AI: analysis, automation, and building with AI models. In 2026 I earned the IT Specialist – Artificial Intelligence certification, and my next projects are in that direction.",
    "Before university, I took the STEM track at Laguna Science National High School and graduated with honors.",
  ],
};

export type SectionId =
  | "home"
  | "about"
  | "credentials"
  | "technologies"
  | "projects"
  | "contact";

export type SiteSection = {
  id: SectionId;
  /** Used for the nav item, the home section heading, and the detail page h1. */
  label: string;
  /** Link text from the home preview to this section's page. */
  cta: string;
  /** Route of the section's own page. Home is "/". */
  href: string;
  /** Short preview shown on the home page. */
  summary: string;
  /** Lead sentence under the section page's h1. */
  detail: string;
};

/** Order here is the order on the home page and in the wheel. */
export const sections: SiteSection[] = [
  { id: "home", label: "Home", cta: "", href: "/", summary: "", detail: "" },
  {
    id: "about",
    label: "About",
    cta: "Read more about me",
    href: "/about",
    summary: "Computer Science student in Laguna, Philippines, moving from web development toward data and AI.",
    detail: "Who I am, what I've built, and where I'm heading.",
  },
  {
    id: "credentials",
    label: "Credentials",
    cta: "See all credentials",
    href: "/credentials",
    summary: "Plus 14 badges from IBM SkillsBuild and Cisco.",
    detail: "My education and certifications, newest first. Each badge links to its verification page on Credly.",
  },
  {
    id: "technologies",
    label: "Technologies",
    cta: "See all technologies",
    href: "/technologies",
    summary: "Python, SQL, TypeScript, and Next.js, with MySQL, PostgreSQL, and Supabase for data.",
    detail: "The languages, frameworks, and tools I work with, grouped by area.",
  },
  {
    id: "projects",
    label: "Projects",
    cta: "See all projects",
    href: "/projects",
    summary: "Flood Forecast, GADvance, and Untold Diaries, built with my thesis team.",
    detail: "Team projects with my thesis teammates. We split the work evenly across the whole stack.",
  },
  {
    id: "contact",
    label: "Contact",
    cta: "See contact details",
    href: "/contact",
    summary: "Reach me by email or on LinkedIn.",
    detail: "The best ways to reach me.",
  },
];

/** Look up a section by id (used by the detail pages). */
export function getSection(id: SectionId): SiteSection {
  const section = sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown section: ${id}`);
  return section;
}
