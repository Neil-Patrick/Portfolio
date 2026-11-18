/** Technical skills, grouped as on the CV. Proficiency tiers come later (ask before adding). */

export type SkillGroup = { name: string; skills: string[] };

export const skillGroups: SkillGroup[] = [
  {
    name: "Programming languages",
    skills: ["Python", "SQL", "JavaScript", "TypeScript", "Java", "C#", "HTML", "CSS"],
  },
  {
    name: "Frameworks and libraries",
    skills: ["Next.js", "React", "React Router", "Tailwind CSS", "Bootstrap"],
  },
  {
    name: "Databases and backend services",
    skills: ["MySQL", "PostgreSQL", "Supabase", "Turso (libSQL)"],
  },
  { name: "Hosting and deployment", skills: ["Vercel"] },
  { name: "Tools and platforms", skills: ["Git", "GitHub", "Visual Studio", "VS Code"] },
  { name: "Design and prototyping", skills: ["Figma", "Canva"] },
];
