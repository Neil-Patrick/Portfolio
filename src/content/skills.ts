/**
 * Technical skills, grouped as on the CV, plus Node.js, Express, Laravel, and Sass
 * from the CV's project lines. Names must match project stack entries exactly;
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
    skills: ["Next.js", "React", "React Router", "Tailwind CSS", "Bootstrap", "Sass (SCSS)"],
  },
  {
    name: "Backend and Databases",
    skills: ["MySQL", "PostgreSQL", "Supabase", "Turso (libSQL)", "Node.js", "Express", "Laravel"],
  },
  { name: "Hosting and Deployment", skills: ["Vercel"] },
  { name: "Tools and Platforms", skills: ["Git", "GitHub", "Visual Studio", "VS Code"] },
  { name: "Design and Prototyping", skills: ["Figma", "Canva"] },
];
