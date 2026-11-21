/**
 * Technical skills, grouped as on the CV, plus Node.js, Express, Laravel, and Sass
 * from the CV's project lines, and the main tools found in the project repos
 * (React Native, Expo, Vite, Framer Motion, TanStack Query, NextAuth.js, Docker, Jest). Names must match project stack entries exactly;
 * logos live in tech.ts. Proficiency tiers come later (ask before adding).
 */

export type SkillGroup = { name: string; skills: string[] };

export const skillGroups: SkillGroup[] = [
  {
    name: "Programming Languages",
    skills: ["Python", "SQL", "JavaScript", "TypeScript", "Java", "C#", "HTML", "CSS"],
  },
  {
    name: "Frameworks and Libraries",
    skills: [
      "Next.js",
      "React",
      "React Native",
      "Expo",
      "React Router",
      "Vite",
      "Tailwind CSS",
      "Bootstrap",
      "Sass (SCSS)",
      "Framer Motion",
      "TanStack Query",
    ],
  },
  {
    name: "Backend and Databases",
    skills: [
      "MySQL",
      "PostgreSQL",
      "Supabase",
      "Turso (libSQL)",
      "Node.js",
      "Express",
      "Laravel",
      "NextAuth.js",
    ],
  },
  { name: "Hosting and Deployment", skills: ["Vercel"] },
  { name: "Tools and Platforms", skills: ["Git", "GitHub", "Docker", "Jest", "Visual Studio", "VS Code"] },
  { name: "Design and Prototyping", skills: ["Figma", "Canva"] },
];

/**
 * Libraries and services that appear in project stacks but aren't listed as
 * technologies. Every other stack name must match skills.ts exactly (a test
 * checks this). They show the neutral service glyph (see the Projects legend).
 */
export const projectOnly = new Set([
  "OpenRouter",
  "Spotify Web API",
  "Cloudflare Turnstile",
  "MapLibre GL",
  "Upstash Redis",
  "Recharts",
  "Zod",
  "Render",
]);
