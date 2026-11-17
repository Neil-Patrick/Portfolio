/**
 * Site-wide content. Everything in [square brackets] is a PLACEHOLDER
 * waiting for real content. Do not ship placeholders.
 */

export const site = {
  name: "[Your Name]",
  role: "[Your role or tagline]",
  intro: "[One or two sentences introducing yourself.]",
  description: "[Short description of the site for search engines.]",
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
  /** Used for the nav link and the section heading. */
  label: string;
  placeholder: string;
};

/** Order here is the order on the page and in the nav. */
export const sections: SiteSection[] = [
  { id: "home", label: "Home", placeholder: "" },
  { id: "about", label: "About", placeholder: "[About you: background, what you do, what drives you.]" },
  { id: "credentials", label: "Credentials", placeholder: "[Degrees, certifications, awards.]" },
  { id: "skills", label: "Skills", placeholder: "[Languages, frameworks, tools.]" },
  { id: "projects", label: "Projects", placeholder: "[Selected projects with links.]" },
  { id: "contact", label: "Contact", placeholder: "[How to reach you: email, socials.]" },
];
