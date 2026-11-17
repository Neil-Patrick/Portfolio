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

There is no automated test suite yet.

## Project structure

```
src/
  app/
    layout.tsx    Root layout: theme script, skip link, header, <main>
    page.tsx      Single page: Home hero + one <Section> per entry in site.ts
    globals.css   Design tokens (Tailwind @theme), theming, base styles
  components/
    SiteHeader.tsx     Sticky navbar + mobile menu
    ThemeSwitcher.tsx  Light / dark / system control
    Section.tsx        Anchored page section with heading
  content/
    site.ts       Site info and section list (drives nav + page order)
  lib/
    theme.ts      Theme constants, applyTheme(), inline init script
public/           Static assets (images, icons)
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
- **Single page with anchors:** sections live on one page and the nav links to `#id`. The nav reads its links from `src/content/site.ts`, so the navbar component can be replaced without touching sections.
