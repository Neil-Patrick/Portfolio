/**
 * Projects. All three are team projects with the same thesis team, with work
 * shared across the whole stack. Descriptions come from each project's code,
 * README, and live site.
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
    stack: ["Python", "Node.js", "Express", "MySQL", "React Router", "TypeScript", "Tailwind CSS"],
    links: [
      { label: "Live site", href: "https://flood-forecast-frontend-heyi.vercel.app" },
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
    stack: ["Next.js", "TypeScript", "Node.js", "Express", "Laravel", "MySQL"],
    links: [
      { label: "Live site", href: "https://gadvance.vercel.app" },
      { label: "Source", href: "https://github.com/nathsuki73/gadvance" },
    ],
  },
  {
    id: "untold-diaries",
    name: "Untold Diaries",
    summary: "An anonymous board for messages left unsaid.",
    description:
      "An anonymous message board. Write a message to someone, optionally attach a song from Spotify, and anyone can browse the messages or search them by recipient name. A captcha keeps spam out.",
    started: "2025-05",
    stack: ["Next.js", "TypeScript", "SCSS", "Turso (libSQL)", "Spotify Web API", "Cloudflare Turnstile"],
    links: [
      { label: "Live site", href: "https://untold-diaries.vercel.app" },
      { label: "Source", href: "https://github.com/nathsuki73/untold-diaries" },
    ],
  },
];
