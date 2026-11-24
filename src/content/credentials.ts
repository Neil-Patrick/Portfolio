/**
 * Education and certifications. Sources: CV, Credly (verified badge data),
 *. Dates are ISO (YYYY-MM-DD).
 */

export type Education = {
  school: string;
  program: string;
  note?: string;
  location: string;
  period: string;
};

export const education: Education[] = [
  {
    school: "Laguna State Polytechnic University, San Pablo City Campus",
    program: "BS Computer Science, Intelligent Systems",
    location: "San Pablo City, Laguna",
    period: "2023 to present, expected graduation 2027",
  },
  {
    school: "Laguna Science National High School",
    program: "Senior High School, STEM",
    note: "With Honors",
    location: "Bay, Laguna",
    period: "2021 to 2023",
  },
];

/**
 * Groups for the Credentials page filter, in display order. Each `id` is also
 * the URL hash that selects it (e.g. /credentials#web-development).
 */
export const credentialCategories = [
  { id: "ai-and-data", label: "AI and Data" },
  { id: "web-development", label: "Web Development" },
  { id: "it-foundations", label: "IT Foundations" },
  { id: "design-and-ux", label: "Design and UX" },
  { id: "project-management", label: "Project Management" },
] as const;

export type CredentialCategoryId = (typeof credentialCategories)[number]["id"];

export type Certification = {
  name: string;
  category: CredentialCategoryId;
  /** Short code shown big on its badge tile (Credentials page). Edit freely; keep it 2 to 4 characters. */
  code: string;
  issuer: string;
  date: string;
  expires?: string;
  /** Public verification page. */
  url?: string;
};

const credly = (id: string) => `https://www.credly.com/badges/${id}`;

/**
 * The badge image saved from Credly (public/badges/<badge id>.png, by
 * scripts/fetch-credly-badges.mjs), or undefined for a credential without one.
 */
export function badgeImage(cert: Certification) {
  const id = cert.url?.match(/credly\.com\/badges\/([0-9a-f-]+)/)?.[1];
  return id ? `/badges/${id}.png` : undefined;
}

/** Shown first and larger: the most relevant credential for data and AI roles. */
export const featuredCertification: Certification = {
  name: "IT Specialist – Artificial Intelligence",
  category: "ai-and-data",
  code: "AI",
  issuer: "Certiport, a Pearson VUE business",
  date: "2026-11-12",
  expires: "2031-11-13",
  url: credly("0bf5a479-7526-4342-b235-47cd871b2067"),
};

/** Remaining Credly badges, newest first. */
export const certifications: Certification[] = [
  { name: "User Experience Design Fundamentals", category: "design-and-ux", code: "UX", issuer: "IBM SkillsBuild", date: "2026-05-21", url: credly("c30808d3-b34d-403d-82ea-bfe85f3eb9d0") },
  { name: "Data Fundamentals", category: "ai-and-data", code: "DATA", issuer: "IBM SkillsBuild", date: "2026-05-11", url: credly("a030ba7c-06dd-4362-bce7-9992d0de1781") },
  { name: "Operating Systems Basics", category: "it-foundations", code: "OS", issuer: "Cisco", date: "2026-03-28", url: credly("332c63bb-7f42-44be-8b95-eb974207faac") },
  { name: "Project Management Fundamentals", category: "project-management", code: "PM", issuer: "IBM SkillsBuild", date: "2025-11-23", url: credly("04f8ad8b-f62c-40c8-bd6b-2def53343427") },
  { name: "Introduction to Modern AI", category: "ai-and-data", code: "MAI", issuer: "Cisco", date: "2025-11-20", url: credly("ddc4e009-ba4c-492e-9efb-bb24d41dbca3") },
  { name: "Agile Explorer", category: "project-management", code: "AGL", issuer: "IBM SkillsBuild", date: "2025-10-15", url: credly("57047229-dd3e-4782-8956-ed1c05b43944") },
  { name: "HTML Essentials", category: "web-development", code: "HTML", issuer: "Cisco", date: "2025-09-14", url: credly("ec301821-f8ff-4034-89b6-9837b599a423") },
  { name: "AI Fundamentals with IBM SkillsBuild", category: "ai-and-data", code: "AIF", issuer: "Cisco", date: "2024-11-05", url: credly("d21034ea-b19e-4335-86cf-16ee06a17159") },
  { name: "Basic Principles of Design", category: "design-and-ux", code: "DSN", issuer: "IBM SkillsBuild", date: "2024-10-26", url: credly("5facdd07-4b7d-4a2f-804f-7240a965e551") },
  { name: "JavaScript Essentials 2", category: "web-development", code: "JS2", issuer: "Cisco", date: "2024-10-23", url: credly("a02a617a-c4a7-4201-81e5-b48eca3dac72") },
  { name: "Artificial Intelligence Fundamentals", category: "ai-and-data", code: "FAI", issuer: "IBM SkillsBuild", date: "2024-10-03", url: credly("8c47fa6f-8e3b-4a01-b31c-d9c089ae078f") },
  { name: "JavaScript Essentials 1", category: "web-development", code: "JS1", issuer: "Cisco", date: "2024-09-22", url: credly("bebba4a1-d44f-4476-8288-159ee955872d") },
  { name: "Cloud Computing Fundamentals", category: "it-foundations", code: "CLD", issuer: "IBM SkillsBuild", date: "2024-09-21", url: credly("faa51e9f-a807-42ed-8446-102904972fa0") },
  { name: "Fundamentals of Sustainability and Technology", category: "it-foundations", code: "SUS", issuer: "IBM", date: "2024-09-18", url: credly("a8edd2e1-d311-4cd2-91b7-bacf5a1b493c") },
];

/** "2026-11-12" -> "Nov 2026". UTC so the result never shifts with the reader's timezone. */
export function formatMonth(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
