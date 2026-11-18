/**
 * Technical skills, grouped as on the CV, plus Node.js, Express, Laravel, and Sass
 * from the CV's project lines. Names must match project stack entries exactly;
 * logos live in tech.ts. Proficiency tiers come later (ask before adding).
 */

export type SkillGroup = { name: string; skills: string[] };

export const skillGroups: SkillGroup[] = [
  {
    name: "Programming languages",
    skills: ["Python", "SQL", "JavaScript", "TypeScript", "Java", "C#", "HTML", "CSS"],
  },
  {
    name: "Frameworks and libraries",
    skills: ["Next.js", "React", "React Router", "Tailwind CSS", "Bootstrap", "Sass (SCSS)"],
  },
  {
    name: "Backend and databases",
    skills: ["MySQL", "PostgreSQL", "Supabase", "Turso (libSQL)", "Node.js", "Express", "Laravel"],
  },
  { name: "Hosting and deployment", skills: ["Vercel"] },
  { name: "Tools and platforms", skills: ["Git", "GitHub", "Visual Studio", "VS Code"] },
  { name: "Design and prototyping", skills: ["Figma", "Canva"] },
];
