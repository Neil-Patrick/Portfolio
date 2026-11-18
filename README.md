# Portfolio

Personal portfolio website.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- ESLint (`eslint-config-next`)
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
  - Each section page, and the open wheel menu, at 320 and 1440px in light and dark. The wheel check also confirms every item is on screen and at least 44px.
- Behaviour: the theme switcher sets, persists and clears the theme; the wheel opens, moves with arrow keys, closes with Escape or an outside click, returns focus, and navigates; each home "View all" link opens its page with the right title; every section in `src/content/site.ts` exists on the home page.

First run on a new machine: `npx playwright install chromium`. Checks run in Chromium only, so Safari, Firefox and real devices still need a manual look.

## Project structure

```
src/
  app/
    layout.tsx    Root layout: theme script, skip link, header, <main>, title template
    page.tsx      Home: hero + a short preview <Section> per entry in site.ts
    about/ credentials/ skills/ projects/ contact/
                  One page.tsx per section (full detail)
    globals.css   Design tokens (Tailwind @theme), theming, base styles
  components/
    SiteHeader.tsx     Sticky top bar: name, theme switcher, wheel button
    WheelMenu.tsx      Radial navigation in a native <dialog>
    ThemeSwitcher.tsx  Light / dark / system control
    Section.tsx        Home preview section with heading and "View all" link
    SectionPage.tsx    Shared shell for section pages (h1, back link, body)
  content/
    site.ts       Site info and section list: label, route, summary, detail
                  (drives the wheel, home order, and section pages)
  lib/
    theme.ts      Theme constants, applyTheme(), inline init script
public/           Static assets (images, icons)
tests/ui/         Playwright UI checks
```

Text in `[square brackets]` in `src/content/` is placeholder content.

## Deploy

1. Push the repository to GitHub.
2. Import it in Vercel. It detects Next.js automatically; the default build settings work.
3. Every push to `main` redeploys. Add a custom domain later in Vercel's project settings under Domains.

## Key decisions

- **Tailwind over Sass:** design tokens are defined once in `@theme`, so every utility class uses them, and only the classes actually used get shipped.
- **Content as data:** projects, skills, and links live in `src/content/`, separate from UI components.
- **Semantic color tokens only:** Tailwind's default palette is removed (`--color-*: initial`). Components use role names (`bg-canvas`, `text-ink`, `border-line`, `bg-accent`) and never `dark:` classes. Each token is `light-dark(LIGHT, DARK)`, so restyling means editing `globals.css` only. The current palette is a neutral placeholder.
- **Theming without a library:** an inline `<head>` script applies a saved light/dark choice before first paint (no flash), following the Next.js "preventing flash before hydration" guide. "System" removes `data-theme` so CSS follows the OS live. The choice is stored in `localStorage` and synced across tabs. `next-themes` was considered and skipped: it would be an extra dependency for about 40 lines of code.
- **Home preview + section pages:** the home page shows a short preview of every section with a "View all" link; each section has its own static route with the full content. Sections keep their `#id` anchors on the home page.
- **One folder per section page, not a `[section]` dynamic route:** each page will grow its own layout (project grid, credentials list, contact form). They share `SectionPage` for now to stay DRY.
- **Wheel navigation:** a button in the top bar opens a ring of sections, on every screen size. It is a native modal `<dialog>`, so focus trapping, Escape, and the inert page come from the browser with no library. Items are placed on the circle with CSS transforms (`--i`, `--count`, `--spacing-wheel-radius`). Arrow keys move around the ring, and the current page is marked with `aria-current`. The open animation uses the motion tokens and only fades under reduced motion. Nav items come from `src/content/site.ts`, so the nav style can still be swapped without touching pages.
