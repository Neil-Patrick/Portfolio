/**
 * Site-wide content. Everything in [square brackets] is a PLACEHOLDER
 * waiting for real content. Do not ship placeholders.
 */

export const site = {
  name: "[Your Name]",
  role: "[Your role or tagline]",
  intro: "[One or two sentences introducing yourself.]",
  description: "[Short description of the site for search engines.]",
  /** Shown on the home profile card's "hotbar". Up to 5. */
  featuredSkills: ["[Skill]", "[Skill]", "[Skill]", "[Skill]", "[Skill]"],
};

export type SectionId =
  | "home"
  | "about"
  | "credentials"
  | "skills"
  | "projects"
  | "contact";

export type SiteSection = {
  id: SectionId;
  /** Used for the nav item, the home section heading, and the detail page h1. */
  label: string;
  /** One-line description shown in the wheel menu's center. UI copy; edit freely. */
  tagline: string;
  /** Route of the section's own page. Home is "/". */
  href: string;
  /** Short preview shown on the home page. */
  summary: string;
  /** Full content shown on the section's own page. */
  detail: string;
};

/** Order here is the order on the home page and in the wheel. */
export const sections: SiteSection[] = [
  { id: "home", label: "Home", tagline: "Back to the start.", href: "/", summary: "", detail: "" },
  {
    id: "about",
    label: "About",
    tagline: "Who I am.",
    href: "/about",
    summary: "[Short teaser about you.]",
    detail: "[About you in full: background, what you do, what drives you.]",
  },
  {
    id: "credentials",
    label: "Credentials",
    tagline: "Degrees and certifications.",
    href: "/credentials",
    summary: "[Your top two or three credentials.]",
    detail: "[All degrees, certifications, and awards, with dates and issuers.]",
  },
  {
    id: "skills",
    label: "Skills",
    tagline: "What I work with.",
    href: "/skills",
    summary: "[Your core skills at a glance.]",
    detail: "[Full list of languages, frameworks, and tools, grouped by area.]",
  },
  {
    id: "projects",
    label: "Projects",
    tagline: "Things I've built.",
    href: "/projects",
    summary: "[Two or three featured projects.]",
    detail: "[Every project with description, role, stack, and links.]",
  },
  {
    id: "contact",
    label: "Contact",
    tagline: "Get in touch.",
    href: "/contact",
    summary: "[One line on how to reach you.]",
    detail: "[How to reach you: email, socials, availability.]",
  },
];

/** Look up a section by id (used by the detail pages). */
export function getSection(id: SectionId): SiteSection {
  const section = sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown section: ${id}`);
  return section;
}
