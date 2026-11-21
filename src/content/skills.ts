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

/** One plain sentence per technology: what it is. Shown on the Technologies page. */
export const techDescriptions: Record<string, string> = {
  // Programming Languages
  Python: "A general-purpose programming language, widely used for data analysis, machine learning, and automation.",
  SQL: "The standard language for querying and managing data in relational databases.",
  JavaScript: "The programming language of the web, running in every browser and on servers through Node.js.",
  TypeScript: "JavaScript with static types, which catch mistakes before the code runs.",
  Java: "An object-oriented language that runs on any device with the Java Virtual Machine.",
  "C#": "Microsoft's object-oriented language for desktop apps, games, and web services on .NET.",
  HTML: "The markup language that gives every web page its structure and content.",
  CSS: "The style language that controls how web pages look: layout, color, and type.",
  // Frameworks and Libraries
  "Next.js": "A React framework for full websites, with routing, server rendering, and APIs built in.",
  React: "A JavaScript library for building user interfaces from reusable components.",
  "React Native": "A framework for building native iOS and Android apps with React.",
  Expo: "A toolkit and platform that makes building, running, and shipping React Native apps easier.",
  "React Router": "A routing library for React apps that maps URLs to pages, and a full-stack framework in its own right.",
  Vite: "A fast build tool and development server for modern web projects.",
  "Tailwind CSS": "A utility-first CSS framework for styling directly in the markup.",
  Bootstrap: "A CSS framework of ready-made, responsive layout and interface components.",
  "Sass (SCSS)": "A CSS extension that adds variables, nesting, and reusable styles.",
  "Framer Motion": "A React animation library for gestures, transitions, and layout animations.",
  "TanStack Query": "A library that fetches, caches, and keeps server data up to date in React apps.",
  // Backend and Databases
  MySQL: "A popular open-source relational database.",
  PostgreSQL: "An advanced open-source relational database known for reliability and features.",
  Supabase: "An open-source backend platform built on PostgreSQL, with authentication, storage, and APIs.",
  "Turso (libSQL)": "A hosted, SQLite-compatible database built on libSQL, designed to sit close to users.",
  "Node.js": "A runtime that runs JavaScript on servers and the command line.",
  Express: "A minimal web framework for building APIs and servers with Node.js.",
  Laravel: "A PHP web framework with routing, an ORM, and authentication built in.",
  "NextAuth.js": "An authentication library for Next.js that handles sign-in, sessions, and providers.",
  // Hosting and Deployment
  Vercel: "A cloud platform for deploying websites and frontend apps, made by the creators of Next.js.",
  // Tools and Platforms
  Git: "A version control system that tracks every change to a codebase.",
  GitHub: "A platform for hosting Git repositories and collaborating on code.",
  Docker: "A tool that packages an app and everything it needs into containers that run the same anywhere.",
  Jest: "A JavaScript testing framework for unit and integration tests.",
  "Visual Studio": "Microsoft's full IDE for .NET, C#, and C++ development.",
  "VS Code": "A lightweight, extensible code editor from Microsoft.",
  // Design and Prototyping
  Figma: "A collaborative, browser-based tool for interface design and prototyping.",
  Canva: "An online design tool for graphics, presentations, and social media visuals.",
};
