# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Recruiters and hiring managers** screening candidates for internships and junior roles, in the Philippines and for remote roles abroad. They skim quickly, often on a phone, and need to see in a minute or two what Neil builds, what he knows, and how to reach him.
- **Freelance clients**, small businesses or individuals who want a web app built and need to trust that Neil can deliver one end to end.

## Product Purpose

The personal portfolio of Neil Patrick Pajadan, a Computer Science student (Intelligent Systems) at Laguna State Polytechnic University, San Pablo City, graduating in 2027.

**Success, in priority order:**
1. An internship inquiry, by email or LinkedIn.
2. A freelance inquiry.

## Positioning

Web first, data and AI next. Neil ships real full-stack web apps with his team now, from the database to the interface, for real users (GADvance for the university's Gender and Development office). Data and AI is the stated next step, backed by the IT Specialist – Artificial Intelligence certification (2026). The site makes both claims true at once and never overstates the second.

## Operating Context

- **Loader:** every full load of Home (a refresh included) opens with a ~5-second loading screen that preloads assets and continues on any click or key. It never shows with reduced motion, nor when navigating to Home within the site.
- **Navigation:** a compass menu, which can be dragged with a finger on touch. Home is a short single scroll (landing, Projects), and every page ends with the "Let's Build" contact block in the footer; the Career Timeline and GitHub Activity sit on the About page, and each section also has its own page. On desktop a custom scroll rail on the right edge is the scrollbar on every page, and a back-to-top button appears past the middle of any page.
- **Theme and devices:** dark only since the November 2026 "Signal" redesign (light mode was removed so one canvas could be tuned properly). Visitors arrive on both phones and desktops.
- **Verification:** visitors check claims against external profiles: GitHub and LinkedIn links, and each badge's own Credly verification page (the Credly profile link was removed from Contact and the footer at Neil's request).

## Capabilities and Constraints

- **Content:** all content is typed data in `src/content/`, separate from the UI. Real content only: never invent personal information, projects, achievements or experience. Anything unknown is a clearly marked placeholder.
- **Contact:** the public email is neilpatrick.dev@gmail.com. No phone number on the public site.
- **External data:** Credly badges and GitHub achievements are saved locally by scripts in `scripts/`. GitHub contribution stats come from the GitHub API.
- **Stack:** Next.js 16, TypeScript, Tailwind v4, hosted on Vercel. Native HTML, CSS and JS are preferred over new dependencies.
- **Undecided:** the custom domain and the profile photo (a marked placeholder until provided).

## Evidence on Hand

- **Projects** (`src/content/projects.ts`):
  - GADvance: a Gender and Development learning platform for the university;
  - Statera: an Android app linking phone habits to grades, started January 2026;
  - Untold Diaries: an anonymous message board with an AI cat.
  - All are team builds: GADvance and Untold Diaries with his thesis teammates, Statera with a class team.
  - Screenshots: none yet; each project shows a labeled placeholder until Neil adds them.
- **Certifications** (`src/content/credentials.ts`): 15 Credly badges, with images in `public/badges/`, in five fields (AI and Data, Web Development, IT Foundations, Design and UX, Project Management). The Credentials page shows them as a looping carousel of emblems in date order, the real badge in the details, and a browse-by-field list below. The featured one is IT Specialist – Artificial Intelligence (Certiport, 2026).
- **GitHub:** the Pull Shark achievement and live contribution activity.
- **Education** (shown on the About page): LSPU BS Computer Science (2023 to present), and Laguna Science National High School STEM, With Honors.
- **Absences that must not be fabricated:**
  - a profile photo;
  - testimonials;
  - client names;
  - employment history;
  - usage metrics;
  - awards beyond those listed.

## Product Principles

1. **Proof over claims.** Every statement links to something checkable: a repo, a badge, a live app, a profile.
2. **The internship ask is always one step away.** From any section, the visitor can reach email or LinkedIn without hunting.
3. **Web first, honestly.** Show the shipped web work as the core; present data and AI as the direction, not as finished expertise.
4. **Skimmable, then deep.** The home page answers "who, what, how to reach him" fast; the section pages carry the detail.
5. **Delight never blocks.** The loader, the effects and the interactions can always be skipped, and must never hide content or slow the path to contact.

## Accessibility & Inclusion

- **Standard:** WCAG 2.2 AA contrast, including text over the brightest frame of the animated background.
- **Interaction:** full keyboard access, visible focus states, touch targets of at least 44px, semantic HTML and meaningful alt text.
- **Motion:** every animation respects `prefers-reduced-motion`, with a settled, fully visible final state.
- **Layout:** no horizontal scrolling at any width from 320px up.
