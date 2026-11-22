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
- [three.js](https://threejs.org) + [React Three Fiber](https://r3f.docs.pmnd.rs) (MIT) for the subtle wave-line background behind the home page (lazy-loaded)
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
  - Navigation: the home page shows exactly the sections in `homeIndex`, in order (no Credentials section); each home arrow opens its page with the right title; the compass menu links every page at phone and desktop widths and marks the current one; it opens aimed at the current page, arrow keys move the needle and focus, Escape and the close button close it (returning focus); the footer reaches every page; on the home page the depth gauge lists every section, jumps to the one clicked (landing below the header) and marks it, and is hidden on phones and other pages.
  - Theme: the dial turns Light → Dark → System at desktop and phone widths, the choice survives a reload, a first-time visitor follows the OS, and with full motion the circular reveal runs without errors.
  - Theme: the switcher sets, persists and clears the theme; a first-time visitor gets System.
  - Technologies and projects: every project tool is a listed technology or a known service; every technology shows an icon and every logo loads; selecting a technology lists its projects, updates the URL hash, and links to the project; a project's tool chip opens the Technologies page with it selected; on phones the panel opens under the selected group.
  - Background and motion: the home page shows the fixed wave background (static lines under reduced motion) behind readable text, and other pages have none; with full motion the page animates, scrolls, and hovers without errors, every revealed element ends fully visible, and the career timeline finishes drawing; with Lenis on, anchor links still land below the sticky header.
  - GitHub: the section shows counters, streaks, and the contribution calendar, and the year buttons swap the calendar (with a token); or the public fallback (without).
  - Chart: one marker per timeline item and a table row for each; Home, End and arrow keys move the selection; clicking selects the nearest item; the chart fits a 320px screen.
  - Home landing and "Let's Build": the headline lines fit their column at every width. Sonar (when active): every project is a contact linking to it, an older project sits farther from the center, labels stay on screen and never overlap at 320 to 1440px, and under reduced motion the sweep is still and every contact lit. Boot (when active): the system check reports the real counts and status, fully shown under reduced motion. The brief builder turns the picks into an email subject and outline (a real `mailto:` link); Copy Email copies the address and says so.

Tests run with reduced motion by default (`playwright.config.ts`), so layout and accessibility checks see the settled page; the "full motion" tests switch animations back on.

First run on a new machine: `npx playwright install chromium`. Checks run in Chromium only, so Safari, Firefox and real devices still need a manual look.

## Project structure

```
src/
  app/
    layout.tsx    Root layout: theme script, skip link, header, <main>, title template
    page.tsx      Home, in `homeIndex` order: landing, intro, projects, technologies,
                  career timeline, GitHub activity, "Let's Build"
    about/ credentials/ technologies/ projects/ contact/
                  One page.tsx per section (full detail)
    globals.css   Design tokens (Tailwind @theme), theming, base styles, chart reveal,
                  HUD utilities (hud-corners, hud-label, hud-notch, hud-row) and animations
  components/
    SiteHeader.tsx     Sticky top bar: name, theme control, compass menu trigger
    nav/               CompassMenu (radial page menu in a native <dialog>), CompassRose
                       (the rose SVG, also the trigger icon), compass-geometry.ts,
                       DepthGauge (home page section index on the right edge)
    SiteFooter.tsx     Plain page links + contact links
    CareerTimeline.tsx Career timeline: cumulative chart, readout, table view
    GitHubActivity.tsx      GitHub section (server: fetches cached stats)
    GitHubActivityView.tsx  Counters, streaks (ring), this month's activity, language bars
    GitHubCalendar.tsx      Contribution heatmap with year buttons, readout, monthly table
    background/        Fixed home-page background: PageBackground (loader, pause logic),
                       WaveLines (animated), WaveFallback (static), waves.ts (shared
                       wave math), scene-utils.ts (theme colors for the scene)
    hero/              Landing (first screen: headline, actions, and one visual),
                       SonarScope and BootPanel (the two landing visuals), and
                       HeroIntro (name entrance and links, the home intro)
    home/              Collaborate ("Let's Build" section with the project brief builder)
    motion/            MotionRoot (reduced-motion config + Lenis), Reveal, CountUp,
                       Tilt/Magnetic, PageTransition, DecodeText (HUD title decode)
    ThemeSwitcher.tsx  Sun-and-moon dial: one button that turns Light → Dark → System
    Section.tsx        Home preview section (visually hidden heading) and ArrowLink, the round
                       arrow to a section's page
    SkillExplorer.tsx  Technologies page: chips, "Used in" panel, hash-based selection
    TechIcon.tsx       Logo for a technology or tool (color, single-color, or fallback glyph)
    icons.tsx          Shared icon defaults (Icon) and the page / contact-link icon maps
    SectionPage.tsx    Shared HUD shell for section pages (bracketed panel, decoding h1, body)
  content/
    site.ts       Site info and section list: label, route, summary, detail, link text
                  (drives the header, home order, and section pages)
    credentials.ts  Education, featured certification, Credly badges
    skills.ts      Technology groups and one-line descriptions for the Technologies
                   page (CV plus main tools from the project repos)
    projects.ts    Projects: description, start month, stack (notable tools, checked
                   against each repo), links
    tech.ts        Logo for each technology name (devicon imports)
  lib/
    theme.ts      Theme constants, applyTheme(), inline init script
    theme-transition.ts  Circular theme reveal (View Transitions API, instant fallback)
    timeline.ts   Builds the chart's dated points from the content files
    github.ts     Cached GitHub stats (GraphQL with token, REST fallback)
    skill-usage.ts  Links technologies and projects by name (which projects use each one)
    sonar.ts      Sonar contact positions: distance from the center = how recently it started
    css-vars.ts   Typed helper for CSS custom properties in inline styles
public/           Static assets (images, icons)
tests/ui/         Playwright UI checks
```

Text in `[square brackets]` in `src/content/` is placeholder content.

**Adding a technology:** add its name to a group in `src/content/skills.ts` (the file keeps its original name; it feeds the Technologies page). For a logo, find it on [devicon.dev](https://devicon.dev), import its `-original.svg` in `src/content/tech.ts`, and add one line to `techIcons` (use `mono: true` for black-by-brand logos, `darkBacking: true` for dark ones). If a project uses it, write the same name in that project's `stack` in `projects.ts` and the two connect automatically. Every name in a project's `stack` must be a listed technology (a test checks this), so stacks list only notable tools, not small helper libraries or APIs. Skills without a devicon logo get a neutral library glyph.

**Dev server note:** on this Windows setup, Turbopack sometimes keeps serving an old build of `globals.css` after an edit. If a style change doesn't show up, stop and restart `npm run dev`.

## Deploy

1. Push the repository to GitHub.
2. Import it in Vercel. It detects Next.js automatically; the default build settings work.
3. Every push to `main` redeploys. Add a custom domain later in Vercel's project settings under Domains.

## Key decisions

- **Tailwind over Sass:** design tokens are defined once in `@theme`, so every utility class uses them, and only the classes actually used get shipped.
- **Content as data:** projects, technologies, and links live in `src/content/`, separate from UI components.
- **Visual direction: work shown as data, brought to life.** Subtle wave lines drifting behind the whole home page, a career timeline built from the real credentials and projects, and live GitHub activity. Pure black (dark) or off-white (light) canvas with neutral grays, one teal accent, IBM Plex Sans for text with Saira Condensed for HUD titles and labels, one background color for the whole page, no divider lines: sections separate through space.
- **Depth gauge instead of a custom scrollbar:** on the home page (lg and up) a hairline on the right edge carries one tick per section, and a teal diamond, the compass needle's tip, springs to the section being read (the last one whose top passed a third of the way down the screen). Ticks are plain hash links with names on hover/focus, so it's a real "On This Page" nav; the native scrollbar is untouched.
- **Theme as a sky dial:** one round button with a horizon; the sun and moon ride a disc behind it, and each click turns it forward one stop (Light: sun up, Dark: moon up, System: both on the horizon with an "A"), with the compass needle's spring. The new theme spreads out from the dial as a circle (View Transitions API with `clip-path: circle()`); browsers without it and visitors with reduced motion switch instantly. It stays a plain button whose name states the current theme and the next one.
- **Navigation as a compass:** one compass-rose button opens a full-screen radial menu, the same at every width. Page icons sit in hexagons on a ring, each with an all-caps name tag (the aimed one fills teal; the current page keeps a teal edge), and a readout under the needle shows the aimed page and its subtitle; the compass needle swings (spring with a slight wobble) toward whatever you aim at: mouse direction from the center, hover, focus, or arrow keys. On open the ring draws itself, corner brackets lock on around the dial, the rose spins in, and the icons fly out clockwise; with reduced motion it simply fades. It's a native modal `<dialog>` (focus trap, Escape, focus returns to the trigger), page scrolling pauses while it's open, and the footer still lists every page as a plain fallback.
- **Background kept subtle:** six hairline waves in the accent color at 10-25% opacity, drifting so slowly that one cycle takes about half a minute; scrolling only nudges their phase. No pointer effects, particles, or pulses: it's texture, not a feature. Earlier experiments (a 3D neural network, a particle field) were dropped as too busy behind text.
- **Motion with guardrails:** Motion handles reveals, count-ups, tilt, the name entrance, and page transitions; Lenis smooths scrolling. Under `prefers-reduced-motion: reduce`, Lenis is off, the 3D scene is a still frame, and a CSS rule shows every `[data-reveal]` element as-is (CSS rather than JS branching, so server and client HTML match and nothing hydrates differently). Without JavaScript, a `<noscript>` style does the same.
- **3D kept off the critical path:** three.js and React Three Fiber load only on the client after the page is interactive (`next/dynamic`, about 240 KB gzipped, separate chunk), never on other pages. The wave scene pauses when the tab is hidden. A static SVG of the same lines shows first, whenever WebGL is unavailable, and on its own with reduced motion (the 3D code is then never downloaded).
- **GitHub data, cached and honest:** fetched on the server with `'use cache'` + `cacheLife('hours')`, so the home page is prerendered and refreshes in the background. Every number comes from the API; without a token the section says what it can't show. The heatmap uses one hue (the accent) from light to dark instead of GitHub's greens, with a legend and a monthly-totals table. Streaks are computed from the yearly calendars; a day with no contributions yet doesn't break the current streak, and on a tie the most recent longest streak is shown. The current-streak ring fills toward the longest streak, which is said in text beside it. There is deliberately no letter grade (as some GitHub stats cards show): it's a third-party score, not data.
- **Hand-built chart, no library:** one chart doesn't justify a charting dependency. Gridlines and the step line are SVG with non-scaling strokes; markers and axis labels are HTML positioned in percentages, so nothing distorts at any width. Certifications are circles and projects squares (identity never relies on color alone), the two series colors passed a colorblind-safety and contrast validator in both themes, and a table view lists every point. Mouse, tap, and arrow keys all drive one readout line instead of a floating tooltip.
- **Semantic color tokens only:** Tailwind's default palette is removed (`--color-*: initial`). Components use role names (`bg-canvas`, `bg-surface`, `text-ink`, `border-line-strong`, `text-accent`) and never `dark:` classes. Each token is `light-dark(LIGHT, DARK)`, so restyling means editing `globals.css` only. Every text and background pair passes WCAG AA, and control borders (`line-strong`) pass 3:1.
- **Theming without a library:** an inline `<head>` script applies a saved light/dark choice before first paint (no flash), following the Next.js "preventing flash before hydration" guide. "System" removes `data-theme` so CSS follows the OS live. The choice is stored in `localStorage` and synced across tabs. `next-themes` was considered and skipped: it would be an extra dependency for about 40 lines of code.
- **HUD style for section pages, inspired by a game-HUD Figma template:** each section page is one panel with teal corner brackets that "lock on" at load, and its title decodes from random glyphs into place (screen readers only get the real text). Credentials and Contact are log-entry rows that print in from the left, with the most important entry as a filled, notched teal row that a light sweep crosses once. About's facts are a profile panel, projects and the Technologies panel are bracketed, and the selected technology's name decodes in. The pieces are utilities in `globals.css` (`hud-corners`, `hud-label`, `hud-notch`, `hud-row`, `hud-row-link`, plus `hud-lock`, `hud-wipe`, `hud-scan` animations) built only from the color tokens, so both themes work. Navigation stays the compass menu alone (a section tab bar was tried and dropped as a second navbar). All caps only for short labels; titles and body text keep normal case for readability. Every animation is off under reduced motion. Left out on purpose from the template: level/coins/clocks, quests and rewards, self-rated skill sliders, sound, its red accent (the site stays teal), its tiny low-contrast caps, and its character artwork (copyrighted game art).
- **Home layout, ordered for a visitor deciding whether to reach out:** a full-screen landing (the hook and the main action), the intro (name, role, links; it doubles as the About preview, which repeated it), Projects (the strongest proof, so it comes first), Technologies, the Career Timeline (it plots every certification, so Credentials needs no home section), GitHub Activity, and "Let's Build" (the ask, last before the footer). The order lives once in `homeIndex` (`site.ts`): the depth gauge reads it and a test checks the page follows it. Each section page still has its own static route with the full content, and the compass menu and footer link all of them.
- **Landing with one animated piece, two to choose from (`site.landing.visual`):** a huge headline decodes in beside either the **sonar** or the **boot sequence**; both are CSS-driven, so they start at first paint, and the headline is visible from the first paint (no slower LCP). It's sized in container-query units so each line fits its column. Under reduced motion everything is shown at rest.
  - **Sonar (current):** a scope whose teal sweep turns every 6 seconds; each project is a contact that pings (and its label flashes) as the sweep passes. Distance from the center is real data, how recently the project started (`src/lib/sonar.ts`); bearing only spreads the contacts so every label can face outward and fit, which a test checks at phone to desktop widths. Sweep and pings share one period and each contact's delay is its bearing's share of the turn, so they stay in step with no JavaScript. Contacts are links to their projects, with lock-on brackets on hover and focus. It fits the site's instruments: compass menu, depth gauge, waves.
  - **Boot sequence:** a bracketed System Check panel that "boots": a progress bar fills, each row prints in with its number counting up, then "Ready" and a blinking cursor. Every number is real (projects, certifications with a Credly link, technologies); `@property` integer counters do the counting, and screen readers get the real numbers.
- **"Let's Build" with a project brief builder, no backend:** visitors pick what they're reaching out about (internship or job, freelance project) and the focus (web, mobile, data or AI, UI design); "Email the Brief" is a real `mailto:` link with a ready subject and outline, so nothing is sent from the site and there's nothing to secure or host. The chips are native radio buttons and checkboxes (keyboard and screen-reader friendly), a live "Subject" line shows exactly what will be sent, and Copy Email and LinkedIn cover visitors without an email app. Without JavaScript it's still a plain email link.
- **One folder per section page, not a `[section]` dynamic route:** each page will grow its own layout (project grid, credentials list, contact form). They share `SectionPage` for now to stay DRY.
- **Brand logos from devicon:** full-color logos make the technology list scannable. devicon is a regular dependency so adding a logo is one import line; only the imported SVGs reach visitors (static files, no JS or CDN). Black-by-brand logos (Next.js, Vercel, GitHub, Express) are drawn in the text color through a CSS mask so they work in dark mode, and MySQL's dark blue sits on a light tile in dark mode. SQL and Turso have no devicon logo and use a database glyph.
- **Technologies and projects linked by name:** a project's `stack` uses the exact names from `skills.ts`, and `src/lib/skill-usage.ts` derives the connection, so there's no second list to keep in sync (a test fails if a name doesn't match). The selected technology lives in the URL hash (`/technologies#tech-python`) so project chips can link straight to it; the hash avoids the Suspense boundary that search params would need.
