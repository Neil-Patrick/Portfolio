/**
 * Projects. All are team projects: Flood Forecast, GADvance, and Untold Diaries
 * with the thesis team, Statera with a class team. Work is shared across the
 * whole stack. Descriptions and stacks come from each project's code, README,
 * and live site (stacks list notable tools, not every small helper library).
 */

export type Project = {
  id: string;
  name: string;
  /** One line for the home page and project lists. */
  summary: string;
  /** What it does and for whom. */
  description: string;
  /** Month work started (YYYY-MM). From the repo's creation date; confirm with Neil. */
  started: string;
  stack: string[];
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    id: "flood-forecast",
    name: "Flood Forecast",
    summary: "Flood-risk predictions for any location and date.",
    description:
      "A flood-risk forecast app. Search for a location, and a Python forecasting API returns its predicted flood risk for the chosen date, so residents can prepare before the water rises.",
    started: "2025-11",
    stack: [
      "Python",
      "Node.js",
      "Express",
      "MySQL",
      "React",
      "React Router",
      "TypeScript",
      "Tailwind CSS",
      "Vite",
      "Docker",
      "Vercel",
    ],
    links: [
      { label: "Live Site", href: "https://flood-forecast-frontend-heyi.vercel.app" },
      { label: "Source", href: "https://github.com/nathsuki73/flood-forecast-frontend" },
    ],
  },
  {
    id: "gadvance",
    name: "GADvance",
    summary: "A Gender and Development learning platform for our university.",
    description:
      "A web platform for the Gender and Development (GAD) office at our university in San Pablo City, Laguna. It teaches gender-equality topics through learning modules with lessons, quizzes, and assessments that suggest topics to review, tracks each learner's progress, and gives the office participation analytics.",
    started: "2026-02",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "Express",
      "Laravel",
      "MySQL",
      "Jest",
      "Vercel",
    ],
    links: [
      { label: "Live Site", href: "https://gadvance.vercel.app" },
      { label: "Source", href: "https://github.com/nathsuki73/gadvance" },
    ],
  },
  {
    id: "statera",
    name: "Statera",
    summary: "An Android app that links students' phone habits to their grades.",
    description:
      "An Android app that tracks a student's screen time, app usage, phone pickups, and unlocks over a chosen number of days, then sends that data with their GWA to a machine-learning API. The API sorts them into one of six behavioral profiles, from Academic at Risk to High-Functioning Academic, and breaks down their top app categories. A companion Next.js website walks through the same GWA form and results on the web. Built with a class team of eight.",
    started: "2026-01",
    stack: ["React Native", "Expo", "TypeScript", "React", "Next.js", "Tailwind CSS"],
    links: [
      { label: "App Source", href: "https://github.com/Neil-Patrick/Statera_App" },
      { label: "Website Source", href: "https://github.com/Neil-Patrick/Statera_FrontEnd" },
    ],
  },
  {
    id: "untold-diaries",
    name: "Untold Diaries",
    summary: "An anonymous board for messages left unsaid, with an AI cat that reacts as you write.",
    description:
      "An anonymous message board. Write a message to someone, optionally attach a song from Spotify, and anyone can browse the messages or search them by recipient name. While you write, a \"therapist cat\" powered by an AI model through OpenRouter reacts to your draft with a short, supportive reply. Its prompt keeps replies brief, matches the writer's language (English, Filipino, or Taglish), and points anyone who mentions self-harm toward a crisis hotline; only free models are allowed, with fallback lines when the quota runs out. A captcha keeps spam out.",
    started: "2025-05",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Sass (SCSS)",
      "Tailwind CSS",
      "Turso (libSQL)",
      "Vercel",
    ],
    links: [
      { label: "Live Site", href: "https://untold-diaries.vercel.app" },
      { label: "Source", href: "https://github.com/nathsuki73/untold-diaries" },
    ],
  },
];
