# Portfolio

Personal portfolio website.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- ESLint (`eslint-config-next`)
- IBM Plex Sans via `next/font` (one family for everything)
- No UI, icon, or chart libraries: icons are inline SVG and the home chart is hand-built SVG
- Hosted on [Vercel](https://vercel.com)

## Requirements

- Node.js 22.13+ (or 20.19+ / 24+)
- npm

## Setup

```bash
npm install
```

## Environment config

No environment variables are needed yet. When they are, put them in `.env.local` (git-ignored) and add the same variables in the Vercel project settings.

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
  - Chart: one marker per timeline item and a table row for each; Home, End and arrow keys move the selection; clicking selects the nearest item; the chart fits a 320px screen.

First run on a new machine: `npx playwright install chromium`. Checks run in Chromium only, so Safari, Firefox and real devices still need a manual look.

## Project structure

```
src/
  app/
    layout.tsx    Root layout: theme script, skip link, header, <main>, title template
    page.tsx      Home: hero, learning chart, and a preview <Section> per page
    about/ credentials/ skills/ projects/ contact/
                  One page.tsx per section (full detail)
    globals.css   Design tokens (Tailwind @theme), theming, base styles, chart reveal
  components/
    SiteHeader.tsx     Sticky top bar: name, page links, theme switcher; "Menu" disclosure on small screens
    SiteFooter.tsx     Plain page links + contact links
    LearningChart.tsx  Home chart: cumulative timeline, readout, table view
    ThemeSwitcher.tsx  Light / dark / system control
    Section.tsx        Home preview section with heading and a link to its page
    SectionPage.tsx    Shared shell for section pages (h1, back link, body)
  content/
    site.ts       Site info and section list: label, route, summary, detail, link text
                  (drives the header, home order, and section pages)
    credentials.ts  Education, featured certification, Credly badges, TESDA modules
    skills.ts      Skill groups (from the CV)
    projects.ts    Projects: description, start month, stack, links
  lib/
    theme.ts      Theme constants, applyTheme(), inline init script
    timeline.ts   Builds the chart's dated points from the content files
public/           Static assets (images, icons)
tests/ui/         Playwright UI checks
```

Text in `[square brackets]` in `src/content/` is placeholder content.

**Dev server note:** on this Windows setup, Turbopack sometimes keeps serving an old build of `globals.css` after an edit. If a style change doesn't show up, stop and restart `npm run dev`.

## Deploy

1. Push the repository to GitHub.
2. Import it in Vercel. It detects Next.js automatically; the default build settings work.
3. Every push to `main` redeploys. Add a custom domain later in Vercel's project settings under Domains.

## Key decisions

- **Tailwind over Sass:** design tokens are defined once in `@theme`, so every utility class uses them, and only the classes actually used get shipped.
- **Content as data:** projects, skills, and links live in `src/content/`, separate from UI components.
- **Visual direction: a calm data report.** Neil is moving into data and AI, so the site reads like a well-designed report about his work. The one signature element is the home chart: every certification and project plotted over time as a cumulative learning curve, built from the content files. Everything else stays quiet: IBM Plex Sans, a cool off-white or deep navy canvas, one teal accent, borders instead of shadows, no decorative motion. The only animation is the chart revealing itself once on load, switched off under reduced motion.
- **Hand-built chart, no library:** one chart doesn't justify a charting dependency. Gridlines and the step line are SVG with non-scaling strokes; markers and axis labels are HTML positioned in percentages, so nothing distorts at any width. Certifications are circles and projects squares (identity never relies on color alone), the two series colors passed a colorblind-safety and contrast validator in both themes, and a table view lists every point. Mouse, tap, and arrow keys all drive one readout line instead of a floating tooltip.
- **Semantic color tokens only:** Tailwind's default palette is removed (`--color-*: initial`). Components use role names (`bg-canvas`, `bg-surface`, `text-ink`, `border-line-strong`, `text-accent`) and never `dark:` classes. Each token is `light-dark(LIGHT, DARK)`, so restyling means editing `globals.css` only. Every text and background pair passes WCAG AA, and control borders (`line-strong`) pass 3:1.
- **Theming without a library:** an inline `<head>` script applies a saved light/dark choice before first paint (no flash), following the Next.js "preventing flash before hydration" guide. "System" removes `data-theme` so CSS follows the OS live. The choice is stored in `localStorage` and synced across tabs. `next-themes` was considered and skipped: it would be an extra dependency for about 40 lines of code.
- **Home preview + section pages:** the home page shows a short preview of every section with a link to its page; each section has its own static route with the full content. Sections keep their `#id` anchors on the home page.
- **One folder per section page, not a `[section]` dynamic route:** each page will grow its own layout (project grid, credentials list, contact form). They share `SectionPage` for now to stay DRY.
- **Plain top navigation:** text links in the header on large screens, a "Menu" disclosure on small ones, plus the same links in the footer. An earlier game-style radial menu was dropped with the pixel theme; a playful interactive piece may return later as its own section.
