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
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | The About page Spotify module (from your app at developer.spotify.com, Web API, redirect URI `http://127.0.0.1:3000/callback`; the app owner needs Spotify Premium and must be listed under User Management) | The module is hidden |
| `SPOTIFY_REFRESH_TOKEN` | The same; created once by `node scripts/spotify-auth.mjs`, which writes it into `.env.local` | The module is hidden |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | The Contact page message form (access key from [web3forms.com](https://web3forms.com), created with neilpatrick.dev@gmail.com; messages go to that inbox) | The form is hidden; the contact links remain |
| `GITHUB_TOKEN` | The About page GitHub section: stats (commits, PRs, issues, stars, repositories contributed to), all-time total and streaks, a contribution calendar per year, this month's activity, languages by code size | The section shows public stats only (repos, followers, primary languages) |

`GITHUB_TOKEN` is read only on the server (`src/lib/github.ts`) and never reaches the browser. Use a **fine-grained personal access token** with *Public repositories (read-only)* access and no extra permissions. GitHub data is cached for hours, so the page stays static and GitHub is called a few times a day at most (two GraphQL queries per refresh). Only repositories the token can read are counted, so a repository it can't see is left out of this month's activity and the language totals.

The Web3Forms key is public by design (it is sent from the browser and can only deliver to the inbox it was created for), so it uses the `NEXT_PUBLIC_` prefix; it still lives in env rather than code so it can be rotated. It is read at build time, so restart the dev server or redeploy after changing it. Free plan: 250 messages a month. To set it up: enter neilpatrick.dev@gmail.com at web3forms.com, copy the key from the email it sends into `.env.local` and Vercel, then send yourself a test message from `/contact`.

The Spotify variables are read only on the server (`src/lib/spotify.ts`). The browser polls `/api/now-playing`, which returns just the track playing now (if any) and the last five played (name, artist, album art, link, when); the result is cached for about 30 seconds, so Spotify sees roughly two calls a minute however many people visit. To set it up: create the Spotify app (Web API only), put the client ID and secret in `.env.local`, run `node scripts/spotify-auth.mjs` in your own terminal and follow its three steps, then restart the dev server. Visitors see what you're listening to; a Spotify Private Session hides it.

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
  - Theme: the HUD chip cycles Light → Dark → System at desktop and phone widths and its ticks follow, the choice survives a reload, a first-time visitor follows the OS, and with full motion the glitch and circular reveal run without errors.
  - Back to top and footer: the back-to-top button is hidden (and out of the tab order) at the top, appears past the middle of the page, and returns to the top; the footer draws every contact logo in one ink, LinkedIn included.
  - Theme: the switcher sets, persists and clears the theme; a first-time visitor gets System.
  - Technologies and projects: every project tool is a listed technology or a known service; every technology shows an icon and every logo loads; selecting a technology lists its projects, updates the URL hash, and links to the project; a project's tool chip opens the Technologies page with it selected; on phones the panel opens under the selected group.
  - Contact form (needs `NEXT_PUBLIC_WEB3FORMS_KEY` on the server under test; skipped otherwise): an empty or invalid submit shows field errors, focuses the first one and sends nothing; a valid message posts the right fields to Web3Forms (mocked), confirms and resets; a rejected send explains it, keeps the text and offers the email address.
  - Background and motion: the home page shows the fixed wave background (static lines under reduced motion) behind readable text, and other pages have none; with full motion the page animates, scrolls, and hovers without errors, every revealed element ends fully visible; with Lenis on, anchor links still land below the sticky header (checked on the Credentials page).
  - GitHub (About page): the section shows counters, streaks, and the contribution calendar, and the year buttons swap the calendar (with a token); or the public fallback (without).
  - Chart (About page): one marker per timeline item and a table row for each; Home, End and arrow keys move the selection; clicking selects the nearest item; the chart fits a 320px screen.
  - Home landing and "Let's Build": the headline lines fit their column at every width; Email Me is a plain `mailto:` link; Copy Email copies the address and says so.
  - Loading screen: it plays on a full load of Home (full motion) with the real counts, preloads and marks Assets "Ready", is still on screen at 3s and clears by itself (then the landing headline decodes), a click continues it, the page scrolls again afterwards, a reload plays it again, and with reduced motion it never shows. (Every other test sets a test-only skip mark in sessionStorage to keep it out of the way.)
  - Hologram card: it holds the page's h1 and a labeled photo placeholder; with reduced motion it stays flat and still; with full motion its layers separate into depth, it tilts toward the cursor and a dragging finger, and a tap folds it flat and back, without console errors.
  - Compass menu on touch: dragging a finger aims the needle (the readout follows) and letting go opens the aimed page.
  - About and Credentials: a labeled photo placeholder until a photo is set; Education is on About (both schools, the console's default tab) and not on Credentials; the About console's tabs switch by click and by arrow keys/Home/End, keep one tab in the tab order, follow and set the URL hash (Back works, `/about#github` opens GitHub), and hide the other panels; the Credentials filter shows every badge under All, exactly a category's badges when one is chosen (`aria-pressed`, URL hash and the "Showing N of 15" line follow), Back returns to the previous filter, and `/credentials#<category>` preselects it; every certification shows its Credly badge, saved locally, loaded, and named; every certification is a tile with its unique code that flips to the badge on hover and focus; the GitHub section lists the saved achievements as tiles linking to GitHub.

Tests run with reduced motion by default (`playwright.config.ts`), so layout and accessibility checks see the settled page; the "full motion" tests switch animations back on.

First run on a new machine: `npx playwright install chromium`. Checks run in Chromium only, so Safari, Firefox and real devices still need a manual look.

## Project structure

```
src/
  app/
    layout.tsx    Root layout: theme and intro scripts, loading screen, skip link, header,
                  <main>, footer, back-to-top button, title template
    page.tsx      Home, in `homeIndex` order: landing, projects, "Let's Build"
    about/page.tsx     About: bio, At a Glance, then the console (tabs: education, career
                       timeline, GitHub activity; components/about/)
    credentials/page.tsx  Certifications by category, with a filter (CredentialExplorer)
    about/ credentials/ technologies/ projects/ contact/
                  One page.tsx per section (full detail)
    globals.css   Design tokens (Tailwind @theme), theming, base styles, chart reveal,
                  HUD utilities (hud-corners, hud-label, hud-notch, hud-row) and animations
  components/
    SiteHeader.tsx     Sticky top bar: name, theme control, compass menu trigger
    nav/               CompassMenu (radial page menu in a native <dialog>), CompassRose
                       (the rose SVG, also the trigger icon), compass-geometry.ts,
                       DepthGauge (home page section index on the right edge),
                       BackToTop (bottom-right HUD button with a scroll-progress outline)
    SiteFooter.tsx     Terminal sign-off: status line, page links, one-ink contact links
    CareerTimeline.tsx Career timeline: cumulative chart, readout, table view
    GitHubActivity.tsx      GitHub section (server: fetches cached stats)
    GitHubActivityView.tsx  Counters, streaks (ring), this month's activity, language bars
    GitHubCalendar.tsx      Contribution heatmap with year buttons, readout, monthly table
    background/        Fixed home-page background: PageBackground (loader, pause logic),
                       WaveLines (animated), WaveFallback (static), waves.ts (shared
                       wave math), scene-utils.ts (theme colors for the scene)
    hero/              Landing (first screen: headline, actions) and HologramCard
                       (the 2D card that splits into 3D layers; holds the page's h1)
    ProfilePhoto.tsx   Profile photo in HUD brackets, or a labeled placeholder until set
    ProjectMedia.tsx   A project's screenshots (first large, the rest as thumbnails that swap in),
                       or a labeled "Screenshot Placeholder" frame until images are added
    intro/             IntroLoader (cyberpunk loading screen markup + its pre-paint script)
                       and IntroController (click to continue, scroll lock, preloading,
                       hand-off to the landing)
    home/              Collaborate ("Let's Build": email, copy email, LinkedIn, Contact page)
    motion/            MotionRoot (reduced-motion config + Lenis), Reveal, CountUp,
                       Tilt/Magnetic, PageTransition, DecodeText (HUD title decode)
    ThemeSwitcher.tsx  HUD mode chip: one button that cycles Light → Dark → System
    Section.tsx        Home preview section (visually hidden heading) and ArrowLink, the round
                       arrow to a section's page
    SkillExplorer.tsx  Technologies page: notched chips, group headers with counts, "Usage" panel,
                       hash-based selection
    ContactForm.tsx    Contact page message form (Web3Forms): validation, honeypot, send states
    TechIcon.tsx       Logo for a technology or tool (color, single-color, or fallback glyph)
    icons.tsx          Shared icon defaults (Icon) and the page / contact-link icon maps
    SectionPage.tsx    Shared HUD shell for section pages (bracketed panel, decoding h1, body)
  content/
    site.ts       Site info and section list: label, route, summary, detail, link text
                  (drives the header, home order, and section pages)
    credentials.ts  Education, credential categories, featured certification, Credly badges
    skills.ts      Technology groups and one-line descriptions for the Technologies
                   page (CV plus main tools from the project repos)
    projects.ts    Projects: description, start month, stack (notable tools, checked
                   against each repo), links, optional screenshots (`images`)
    tech.ts        Logo for each technology name (devicon imports)
  lib/
    theme.ts      Theme constants, applyTheme(), inline init script
    theme-transition.ts  Circular theme reveal (View Transitions API, instant fallback)
    timeline.ts   Builds the chart's dated points from the content files
    github.ts     Cached GitHub stats (GraphQL with token, REST fallback)
    spotify.ts    Now playing + the last 5 played from Spotify (server only, cached ~30s),
                  served to the About page at app/api/now-playing/route.ts
    skill-usage.ts  Links technologies and projects by name (which projects use each one)
    intro.ts      Loading screen: pre-paint script (every full load of Home), done event
    webgl.ts      WebGL support check for the 3D wave background
    css-vars.ts   Typed helper for CSS custom properties in inline styles
public/           Static assets (images, icons); cursors/ holds the HUD cursor SVGs;
                  badges/ holds the Credly badge images,
                  achievements/ the GitHub achievement art
scripts/          fetch-credly-badges.mjs: re-download the badge images from Credly;
                  fetch-github-achievements.mjs: re-read the GitHub profile achievements;
                  spotify-auth.mjs: one-time Spotify refresh token into .env.local
tests/ui/         Playwright UI checks
.claude/skills/   Claude Code skills: impeccable (design; its engine downloads to
                  ~/.impeccable on first run, checksum-verified), verify-ui (Playwright checks),
                  web-design-guidelines (UI review), seo-schema and seo-sitemap
                  (reference only, see below)
```

**SEO skills:** `seo-schema` and `seo-sitemap` are copied from [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) (MIT, commit `468ed5b`, v2.6.2), skill files only. Their Python scripts, hook, and setup aren't installed, so steps that call `scripts/claude-seo` don't work; they serve as reference for JSON-LD and sitemap rules.

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
- **Theme as a HUD mode chip:** a borderless square the same shape as the compass button. Its glyph shows the mode (sun, moon, or both for System) and three small ticks under it mark the stop in the Light → Dark → System cycle (the active one teal). A click glitches the glyph for 160ms (offset accent and grey copies). The header controls have no outlines: they turn teal on hover. (Replaced the earlier round sun-and-moon dial.) The new theme spreads out from the chip as a circle (View Transitions API with `clip-path: circle()`); browsers without it and visitors with reduced motion switch instantly. It stays a plain button whose name states the current theme and the next one.
- **Navigation as a compass:** one compass-rose button opens a full-screen radial menu, the same at every width. Page icons sit in hexagons on a ring, each with an all-caps name tag (the aimed one fills teal; the current page keeps a teal edge), and a readout under the needle shows the aimed page and its subtitle; the compass needle swings (spring with a slight wobble) toward whatever you aim at: mouse direction from the center, hover, focus, or arrow keys. On open the ring draws itself, corner brackets lock on around the dial, the rose spins in, and the icons fly out clockwise; with reduced motion it simply fades. It's a native modal `<dialog>` (focus trap, Escape, focus returns to the trigger), page scrolling pauses while it's open, and the footer still lists every page as a plain fallback.
- **Background kept subtle:** six hairline waves in the accent color at 10-25% opacity, drifting so slowly that one cycle takes about half a minute; scrolling only nudges their phase. No pointer effects, particles, or pulses: it's texture, not a feature. Earlier experiments (a 3D neural network, a particle field) were dropped as too busy behind text.
- **Motion with guardrails:** Motion handles reveals, count-ups, tilt, the name entrance, and page transitions; Lenis smooths scrolling, tuned slower than its default (`wheelMultiplier: 0.7`, `lerp: 0.08` in `MotionRoot`). Under `prefers-reduced-motion: reduce`, Lenis is off, the 3D scene is a still frame, and a CSS rule shows every `[data-reveal]` element as-is (CSS rather than JS branching, so server and client HTML match and nothing hydrates differently). Without JavaScript, a `<noscript>` style does the same.
- **3D kept off the critical path:** three.js and React Three Fiber load only on the client after the page is interactive (`next/dynamic`, about 240 KB gzipped, separate chunk), never on other pages. The wave scene pauses when the tab is hidden. A static SVG of the same lines shows first, whenever WebGL is unavailable, and on its own with reduced motion (the 3D code is then never downloaded).
- **GitHub data, cached and honest:** fetched on the server with `'use cache'` + `cacheLife('hours')`, so the About page is prerendered and refreshes in the background. Every number comes from the API; without a token the section says what it can't show. The heatmap uses one hue (the accent) from light to dark instead of GitHub's greens, with a legend and a monthly-totals table. Streaks are computed from the yearly calendars; a day with no contributions yet doesn't break the current streak, and on a tie the most recent longest streak is shown. The current-streak ring fills toward the longest streak, which is said in text beside it. There is deliberately no letter grade (as some GitHub stats cards show): it's a third-party score, not data.
- **Hand-built chart, no library:** one chart doesn't justify a charting dependency. Gridlines and the step line are SVG with non-scaling strokes; markers and axis labels are HTML positioned in percentages, so nothing distorts at any width. Certifications are circles and projects squares (identity never relies on color alone), the two series colors passed a colorblind-safety and contrast validator in both themes, and a table view lists every point. Mouse, tap, and arrow keys all drive one readout line instead of a floating tooltip.
- **Semantic color tokens only:** Tailwind's default palette is removed (`--color-*: initial`). Components use role names (`bg-canvas`, `bg-surface`, `text-ink`, `border-line-strong`, `text-accent`) and never `dark:` classes. Each token is `light-dark(LIGHT, DARK)`, so restyling means editing `globals.css` only. Every text and background pair passes WCAG AA, and control borders (`line-strong`) pass 3:1.
- **Theming without a library:** an inline `<head>` script applies a saved light/dark choice before first paint (no flash), following the Next.js "preventing flash before hydration" guide. "System" removes `data-theme` so CSS follows the OS live. The choice is stored in `localStorage` and synced across tabs. `next-themes` was considered and skipped: it would be an extra dependency for about 40 lines of code.
- **HUD style for section pages, inspired by a game-HUD Figma template:** each section page is one panel with teal corner brackets that "lock on" at load, and its title decodes from random glyphs into place (screen readers only get the real text). Credentials, Education (on About) and Contact are log-entry rows that print in from the left, with the most important entry as a filled, notched teal row that a light sweep crosses once. About's facts are a profile panel, projects and the Technologies panel are bracketed, and the selected technology's name decodes in. The pieces are utilities in `globals.css` (`hud-corners`, `hud-label`, `hud-notch`, `hud-row`, `hud-row-link`, plus `hud-lock`, `hud-wipe`, `hud-scan` animations) built only from the color tokens, so both themes work. Navigation stays the compass menu alone (a section tab bar was tried and dropped as a second navbar). All caps only for short labels; titles and body text keep normal case for readability. Every animation is off under reduced motion. Left out on purpose from the template: level/coins/clocks, quests and rewards, self-rated skill sliders, sound, its red accent (the site stays teal), its tiny low-contrast caps, and its character artwork (copyrighted game art).
- **Home layout, lean on purpose:** a full-screen landing (the hook, the main action, and the hologram card with the name as the page's h1), Projects (the strongest proof), and "Let's Build" (the ask, last before the footer). The Career Timeline and GitHub Activity moved to the About page, under the bio. About, Credentials, and Technologies live on their own pages, reachable from the compass menu, the footer, and the project chips. The order lives once in `homeIndex` (`site.ts`): the depth gauge reads it and a test checks the page follows it.
- **A cyberpunk loading screen that also preloads, on every full load of Home:** a CRT power-on, flicker and scanlines, the name glitching in, a progress bar and a system check with the real counts printing in, "Access Granted", then a CRT power-off that reveals the landing, about 5 seconds; a click anywhere (or any key) continues sooner, and scrolling deliberately doesn't. Meanwhile it warms up what's heavy (the wave background's three.js chunk, fonts, every section page via router prefetch, the profile photo once set) and its "Assets" row turns Ready when that's done. An inline script in the root layout's `<head>` decides before first paint (every full load of Home, a refresh included, but not navigating to Home within the site; motion allowed), and the loader's markup comes before the header and outside the page fade-in, so the page never flashes first, and without JavaScript or with reduced motion it never shows. The look and timeline are CSS; a small controller holds the page still and announces `intro:done`, which the landing headline's decode and the card's 3D pop wait for. It's always dark (its own `color-scheme`).
- **Hologram card instead of a WebGL scene:** after trying a sonar, a boot panel, and three three.js scenes (compass, gyroscope, monolith), the landing settled on a profile card that starts as flat 2D and splits into floating layers (plate, photo, brackets, name tag, status) once the loader clears. It tilts toward the cursor or a dragging finger, a tap folds it flat and pops it back, and idle it sways. It's plain CSS 3D (`preserve-3d`, `translateZ`) driven by Motion springs and pointer events, so it works the same with touch, keeps real text (the h1), and costs no WebGL. With reduced motion it's a flat, still card. The photo is a clearly marked placeholder until `site.photo` is set.
- **"Let's Build" kept simple:** one line on what I'm open to, then Email Me (a plain `mailto:`), Copy Email (with a "Copied" confirmation, for visitors without an email app), LinkedIn, and the Contact page. An earlier brief builder was dropped as more detail than needed.
- **Compass menu follows a finger:** on touch, dragging on the dial aims the needle at the finger (the readout follows), and letting go after a real drag opens that page, like a game's radial menu; taps, mouse, and keys work as before.
- **Certifications as microchips, all alike:** every certification is the same chip card (`CredentialChip.tsx`): a die framed by CSS-drawn pins (`chip-pins`), with the issuer, the big code, the month, a pin-1 dot and a status LED; the name and issuer print below. Hover or focus lights the pins and LED teal and flips the die to the real Credly badge. No credential is singled out (the old teal "featured" row is gone from this page); `featuredCertification` still feeds About's "Latest Certification".
- **Badges as tiles, real art on the back:** each GitHub achievement is a HUD tile: the issuer, a big short code (`code` in `credentials.ts`, editable), and a teal folded corner; large tiles add the month. Hovering or focusing its row flips it in 3D (CSS `backface-visibility`) to the real badge; with reduced motion it swaps without the spin. The tile text is decorative; the row's link names the credential.
- **Credly badges and GitHub achievements saved locally:** `scripts/fetch-credly-badges.mjs` saves each badge image from the public Credly profile into `public/badges/<badge id>.png`; `scripts/fetch-github-achievements.mjs` reads the public GitHub profile's achievements (GitHub has no API for them) into `src/content/achievements.json` plus `public/achievements/`. The site never calls either at runtime; re-run the scripts after earning something new. Achievements show in the About page's GitHub section.
- **Footer as a terminal sign-off:** a bracketed HUD panel (canvas-tinted glass) with a teal notched tab on its top edge, an "End of Transmission" line with the live availability status, the page and contact links under caps HUD headings, and the copyright year (a `'use cache'` component, since Cache Components won't let a prerender read the clock) and location. Every contact logo is drawn in one ink (LinkedIn through devicon's cut-out "plain" variant), teal on hover; the home "Let's Build" LinkedIn button keeps the brand color.
- **Back-to-top button:** bottom right on every page, it fades in past the middle of the page. A HUD square with corner brackets whose teal outline traces how far down you are; it glides up with Lenis (or jumps, with reduced motion) and moves focus to the top of the content. Hidden, it's `inert`, so it never sits in the tab order.
- **Project screenshots:** each card on the Projects page has a 16:9 bracketed frame (top of the right column on desktop, first in the card on phones). Until screenshots are added it shows a hairline browser-window outline labeled "Screenshot Placeholder", so nothing is passed off as a real image. To add some: put files in `public/projects/<project id>/` (WebP or AVIF, about 1600px wide) and list them in that project's `images` in `src/content/projects.ts` with alt text describing what's on screen; the first is the large one, and two or more add thumbnails that swap into the frame. Flood Forecast was removed from the site at Neil's request (November 2026).
- **About as a tabbed console:** under the bio and At a Glance, three tabs (Education, Career Timeline, GitHub Activity) sit on a teal rail and switch one HUD module at a time. Each module has the same frame (`ConsoleModule`): bracketed glass, a header with the name, a hairline and a status readout from real data ("2 Records", the timeline's counts, "Synced Hourly" with a live marker). Education is a circuit trace: entries hang off a teal line by solder-pad nodes, and the line draws down when the tab opens. Real WAI-ARIA tabs; the open tab lives in the URL hash like the Credentials filter. All panels render on the server (the GitHub data stays a cached server component) and inactive ones are `hidden`. Tabs were chosen over stacked modules to keep the page short.
- **Spotify player on About:** its own block below the About panel and above the footer (`src/components/about/spotify/Player.tsx`, shared pieces in `shared.tsx`). Left: the loaded song (album art, title linking to Spotify, artist, Open Spotify). Right, filling the rest of the row: a fixed 152px preview panel. Below: the track index (the song playing now, then S1–S5); a row loads that song (no separate transport buttons). The header shows On Air with bouncing signal bars or Off Air. **Song preview:** Spotify no longer gives new apps preview clips, so "Preview on Spotify" opens Spotify's own embed player (a 30-second preview, or the full song for visitors signed in to Spotify) inside the same fixed panel, so nothing else moves; nothing from Spotify loads before that click. Hosting or streaming the audio ourselves isn't allowed. Spotify's design guidelines shaped the rest: the official full logo (path data from Spotify's 2024 logo pack, in `SpotifyLogo.tsx`) is the heading, black on light and Spotify Green on black, never under 70px wide; album art is never animated, bordered or overlaid, with 4px/8px corners; every track links to Spotify, with an "Open Spotify" link. Earlier designs (a radio tuner, a signal scanner, a cassette deck, DJ decks) were tried and removed as too busy. The keys stay on the server; the block polls a cached route every 45 seconds while the tab is visible and hides itself when Spotify isn't set up or fails. Spotify's February 2026 rules: a Development Mode app works only while its owner has Premium, for at most five listed users.
- **Credentials grouped and filterable:** the 15 badges sit in five categories (AI and Data, Web Development, IT Foundations, Design and UX, Project Management; `category` on each entry in `credentials.ts`), AI and Data first, newest first within each. A chip bar filters to one category or shows All; the choice lives in the URL hash (pushState, so Back works and there's no anchor jump), like the Technologies page. Education moved to About, next to the rest of the background.
- **One folder per section page, not a `[section]` dynamic route:** each page will grow its own layout (project grid, credentials list, contact form). They share `SectionPage` for now to stay DRY.
- **Brand logos from devicon:** full-color logos make the technology list scannable. devicon is a regular dependency so adding a logo is one import line; only the imported SVGs reach visitors (static files, no JS or CDN). Black-by-brand logos (Next.js, Vercel, GitHub, Express) are drawn in the text color through a CSS mask so they work in dark mode, and MySQL's dark blue sits on a light tile in dark mode. SQL and Turso have no devicon logo and use a database glyph.
- **HUD cursor, CSS only:** two small SVGs in `public/cursors/` (a teal dart, and a corner-bracket reticle over clickable things) set with `cursor: url(...)` in `globals.css`, only for mouse pointers, with system fallbacks; text fields keep the I-beam and forced-colors mode keeps the system cursors. No cursor-follower script, so no extra JavaScript or input lag.
- **Contact links:** Email, LinkedIn and GitHub. The Credly profile link was removed from Contact and the footer at Neil's request; each certification still links to its own Credly verification page.
- **Contact form through Web3Forms (not Resend):** chosen by Neil for the simplest setup and no backend code. The browser posts to Web3Forms, which emails neilpatrick.dev@gmail.com with the visitor's address as reply-to. Validation runs in the browser (required fields, email format, message length) and a hidden honeypot field catches simple bots; without JavaScript the form still posts natively and Web3Forms shows its own confirmation. Trade-offs accepted: 250 messages a month on the free plan and spam filtering on their side. Resend (server-side, 3,000 a month, secret key) is the upgrade path if spam or volume becomes a problem.
- **Technologies and projects linked by name:** a project's `stack` uses the exact names from `skills.ts`, and `src/lib/skill-usage.ts` derives the connection, so there's no second list to keep in sync (a test fails if a name doesn't match). The selected technology lives in the URL hash (`/technologies#tech-python`) so project chips can link straight to it; the hash avoids the Suspense boundary that search params would need.
