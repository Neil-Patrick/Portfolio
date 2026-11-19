# Portfolio

Personal portfolio website.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- ESLint (`eslint-config-next`)
- IBM Plex Sans via `next/font` (one family for everything)
- [devicon](https://devicon.dev) (MIT) for technology logos, plus the GitHub and LinkedIn marks on contact links
- [Lucide](https://lucide.dev) (`lucide-react`, ISC) for UI icons: navigation, contact links, theme switcher, GitHub stats; only the imported icons ship
- [Motion](https://motion.dev) (MIT) for scroll reveals, count-ups, hover/tilt effects, and page transitions
- [Lenis](https://lenis.darkroom.engineering) (MIT) for smooth scrolling
- [three.js](https://threejs.org) + [React Three Fiber](https://r3f.docs.pmnd.rs) (MIT) for the 3D neural network in the home hero (lazy-loaded)
- No UI or chart libraries: the career timeline and heatmap are hand-built
- Hosted on [Vercel](https://vercel.com)

## Requirements

- Node.js 22.13+ (or 20.19+ / 24+)
- npm

## Setup

```bash
npm install
```

## Environment config

Create a `.env.local` file (git-ignored; env files are never committed) with the variables below. Add the same variables in Vercel under Project Settings > Environment Variables.

| Variable | Needed for | Without it |
| --- | --- | --- |
| `GITHUB_TOKEN` | The home page GitHub section: stats (commits, PRs, issues, stars, repositories contributed to), all-time total and streaks, a contribution calendar per year, this month's activity, languages by code size | The section shows public stats only (repos, followers, primary languages) |

`GITHUB_TOKEN` is read only on the server (`src/lib/github.ts`) and never reaches the browser. Use a **fine-grained personal access token** with *Public repositories (read-only)* access and no extra permissions. GitHub data is cached for hours, so the page stays static and GitHub is called a few times a day at most (two GraphQL queries per refresh). Only repositories the token can read are counted, so a repository it can't see is left out of this month's activity and the language totals.

## Commands

| Command         | What it does                                       |
| --------------- | -------------------------------------------------- |
| `npm run dev`   | Start the dev server at http://localhost:3000      |
| `npm run build` | Create an optimized production build               |
| `npm run start` | Serve the production build locally                 |
| `npm run lint`  | Check code with ESLint                             |
| `npm run test:ui` | Run UI checks in headless Chromium (Playwright)  |

## Testing

`npm run test:ui` runs `tests/ui/verify.spec.ts` against the dev server (it reuses one already running on port 3000):

- Layout checks: no horizontal scroll, no console errors (including hydration warnings), and no axe WCAG 2.1 AA violations. Screenshots go to `test-results/screenshots/`.
  - Home page at 320, 768, 1024 and 1440px, in light and dark.
  - Each section page at 320 and 1440px, and the open mobile menu at 320px, in light and dark.
- Behaviour:
  - Navigation: every section exists on the home page; each home preview link opens its page with the right title; the desktop header links every page and marks the current one; the mobile menu opens, closes with Escape (returning focus) and on link click; the footer reaches every page.
  - Theme: the switcher sets, persists and clears the theme; a first-time visitor gets System.
  - Technologies and projects: every project tool is a listed technology or a known service; every technology shows an icon and every logo loads; selecting a technology lists its projects, updates the URL hash, and links to the project; a project's tool chip opens the Technologies page with it selected; on phones the panel opens under the selected group.
  - Hero and motion: the hero shows the 3D canvas or its static fallback behind readable text; with full motion the page animates, scrolls, and hovers without errors, every revealed element ends fully visible, and the career timeline finishes drawing; with Lenis on, anchor links still land below the sticky header.
  - GitHub: the section shows counters, streaks, and the contribution calendar, and the year buttons swap the calendar (with a token); or the public fallback (without).
  - Chart: one marker per timeline item and a table row for each; Home, End and arrow keys move the selection; clicking selects the nearest item; the chart fits a 320px screen.

Tests run with reduced motion by default (`playwright.config.ts`), so layout and accessibility checks see the settled page; the "full motion" tests switch animations back on.

First run on a new machine: `npx playwright install chromium`. Checks run in Chromium only, so Safari, Firefox and real devices still need a manual look.

## Project structure

```
src/
  app/
    layout.tsx    Root layout: theme script, skip link, header, <main>, title template
    page.tsx      Home: hero, learning chart, and a preview <Section> per page
    about/ credentials/ technologies/ projects/ contact/
                  One page.tsx per section (full detail)
    globals.css   Design tokens (Tailwind @theme), theming, base styles, chart reveal
  components/
    SiteHeader.tsx     Sticky top bar: name, page links, theme switcher; "Menu" disclosure on small screens
    SiteFooter.tsx     Plain page links + contact links
    CareerTimeline.tsx Career timeline: cumulative chart, readout, table view
    GitHubActivity.tsx      GitHub section (server: fetches cached stats)
    GitHubActivityView.tsx  Counters, streaks (ring), this month's activity, language bars
    GitHubCalendar.tsx      Contribution heatmap with year buttons, readout, monthly table
    hero/              3D neural network (NeuralNetwork), lazy loader + pause logic
                       (HeroBackground), static fallback, name entrance (HeroIntro)
    motion/            MotionRoot (reduced-motion config + Lenis), Reveal, CountUp,
                       Tilt/Magnetic, PageTransition
    ThemeSwitcher.tsx  Light / dark / system control
    Section.tsx        Home preview section with heading and a link to its page
    SkillExplorer.tsx  Technologies page: chips, "Used in" panel, hash-based selection
    TechIcon.tsx       Logo for a technology or tool (color, single-color, or fallback glyph)
    icons.tsx          Shared icon defaults (Icon) and the page / contact-link icon maps
    SectionPage.tsx    Shared shell for section pages (h1, back link, body)
  content/
    site.ts       Site info and section list: label, route, summary, detail, link text
                  (drives the header, home order, and section pages)
    credentials.ts  Education, featured certification, Credly badges
    skills.ts      Technology groups for the Technologies page (from the CV)
    projects.ts    Projects: description, start month, stack, links
    tech.ts        Logo for each technology name (devicon imports)
  lib/
    theme.ts      Theme constants, applyTheme(), inline init script
    timeline.ts   Builds the chart's dated points from the content files
    github.ts     Cached GitHub stats (GraphQL with token, REST fallback)
    skill-usage.ts  Links technologies and projects by name (which projects use each one)
public/           Static assets (images, icons)
tests/ui/         Playwright UI checks
```

Text in `[square brackets]` in `src/content/` is placeholder content.

**Adding a technology:** add its name to a group in `src/content/skills.ts` (the file keeps its original name; it feeds the Technologies page). For a logo, find it on [devicon.dev](https://devicon.dev), import its `-original.svg` in `src/content/tech.ts`, and add one line to `techIcons` (use `mono: true` for black-by-brand logos, `darkBacking: true` for dark ones). If a project uses it, write the same name in that project's `stack` in `projects.ts` and the two connect automatically.

**Dev server note:** on this Windows setup, Turbopack sometimes keeps serving an old build of `globals.css` after an edit. If a style change doesn't show up, stop and restart `npm run dev`.

## Deploy

1. Push the repository to GitHub.
2. Import it in Vercel. It detects Next.js automatically; the default build settings work.
3. Every push to `main` redeploys. Add a custom domain later in Vercel's project settings under Domains.

## Key decisions

- **Tailwind over Sass:** design tokens are defined once in `@theme`, so every utility class uses them, and only the classes actually used get shipped.
- **Content as data:** projects, technologies, and links live in `src/content/`, separate from UI components.
- **Visual direction: work shown as data, brought to life.** A full-bleed home hero with a 3D neural network (nodes, links, and pulses of "data" moving along them, leaning toward the cursor), a career timeline built from the real credentials and projects, and live GitHub activity. Deep navy or off-white canvas, one teal accent, IBM Plex Sans, no divider lines: sections separate through space and alternating full-width bands.
- **Motion with guardrails:** Motion handles reveals, count-ups, tilt, the name entrance, and page transitions; Lenis smooths scrolling. Under `prefers-reduced-motion: reduce`, Lenis is off, the 3D scene is a still frame, and a CSS rule shows every `[data-reveal]` element as-is (CSS rather than JS branching, so server and client HTML match and nothing hydrates differently). Without JavaScript, a `<noscript>` style does the same.
- **3D kept off the critical path:** three.js and React Three Fiber load only on the client after the page is interactive (`next/dynamic`, about 240 KB gzipped, separate chunk), never on other pages. The scene pauses when the hero is off-screen or the tab is hidden, caps the pixel ratio at 1.5, and uses half the nodes on phones. A static SVG version of the same network shows first and whenever WebGL is unavailable.
- **GitHub data, cached and honest:** fetched on the server with `'use cache'` + `cacheLife('hours')`, so the home page is prerendered and refreshes in the background. Every number comes from the API; without a token the section says what it can't show. The heatmap uses one hue (the accent) from light to dark instead of GitHub's greens, with a legend and a monthly-totals table. Streaks are computed from the yearly calendars; a day with no contributions yet doesn't break the current streak, and on a tie the most recent longest streak is shown. The current-streak ring fills toward the longest streak, which is said in text beside it. There is deliberately no letter grade (as some GitHub stats cards show): it's a third-party score, not data.
- **Hand-built chart, no library:** one chart doesn't justify a charting dependency. Gridlines and the step line are SVG with non-scaling strokes; markers and axis labels are HTML positioned in percentages, so nothing distorts at any width. Certifications are circles and projects squares (identity never relies on color alone), the two series colors passed a colorblind-safety and contrast validator in both themes, and a table view lists every point. Mouse, tap, and arrow keys all drive one readout line instead of a floating tooltip.
- **Semantic color tokens only:** Tailwind's default palette is removed (`--color-*: initial`). Components use role names (`bg-canvas`, `bg-surface`, `text-ink`, `border-line-strong`, `text-accent`) and never `dark:` classes. Each token is `light-dark(LIGHT, DARK)`, so restyling means editing `globals.css` only. Every text and background pair passes WCAG AA, and control borders (`line-strong`) pass 3:1.
- **Theming without a library:** an inline `<head>` script applies a saved light/dark choice before first paint (no flash), following the Next.js "preventing flash before hydration" guide. "System" removes `data-theme` so CSS follows the OS live. The choice is stored in `localStorage` and synced across tabs. `next-themes` was considered and skipped: it would be an extra dependency for about 40 lines of code.
- **Home preview + section pages:** the home page shows a short preview of every section with a link to its page; each section has its own static route with the full content. Sections keep their `#id` anchors on the home page.
- **One folder per section page, not a `[section]` dynamic route:** each page will grow its own layout (project grid, credentials list, contact form). They share `SectionPage` for now to stay DRY.
- **Brand logos from devicon:** full-color logos make the technology list scannable. devicon is a regular dependency so adding a logo is one import line; only the imported SVGs reach visitors (static files, no JS or CDN). Black-by-brand logos (Next.js, Vercel, GitHub, Express) are drawn in the text color through a CSS mask so they work in dark mode, and MySQL's dark blue sits on a light tile in dark mode. SQL and Turso have no devicon logo and use a database glyph; services (OpenRouter, Spotify Web API, Cloudflare Turnstile) all use a neutral service glyph, explained by a legend on the Projects page.
- **Technologies and projects linked by name:** a project's `stack` uses the exact names from `skills.ts`, and `src/lib/skill-usage.ts` derives the connection, so there's no second list to keep in sync (a test fails if a name doesn't match). The selected technology lives in the URL hash (`/technologies#tech-python`) so project chips can link straight to it; the hash avoids the Suspense boundary that search params would need.
- **Plain top navigation:** text links in the header on large screens, a "Menu" disclosure on small ones, plus the same links in the footer. An earlier game-style radial menu was dropped with the pixel theme; a playful interactive piece may return later as its own section.
