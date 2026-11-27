# Portfolio

Personal portfolio website.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- ESLint (`eslint-config-next`)
- IBM Plex Sans via `next/font` (one family for everything)
- [devicon](https://devicon.dev) (MIT) for technology logos, plus the GitHub and LinkedIn marks on contact links
- [Lucide](https://lucide.dev) (`lucide-react`, ISC) for UI icons: navigation, contact links, GitHub stats; only the imported icons ship
- [Motion](https://motion.dev) (MIT) for scroll reveals, count-ups, hover/tilt effects, and page transitions
- [Lenis](https://lenis.darkroom.engineering) (MIT) for smooth scrolling
- [three.js](https://threejs.org) + [React Three Fiber](https://r3f.docs.pmnd.rs) (MIT) for the signal-line background behind every page (lazy-loaded)
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
  - Home page at 320, 768, 1024 and 1440px (dark only).
  - Each section page at 320 and 1440px, and the open mobile menu at 320px.
- Behaviour:
  - Navigation: the home page shows exactly the sections in `homeIndex`, in order (no Credentials section); each home arrow opens its page with the right title; the compass menu links every page at phone and desktop widths and marks the current one; it opens aimed at the current page, arrow keys move the needle and focus, Escape and the close button close it (returning focus); the footer reaches every page; on the home page the depth gauge lists every section, jumps to the one clicked (landing below the header) and marks it, and is hidden on phones and other pages.
  - Dark only: there is no theme control, the color scheme is dark, and the canvas is tinted (not pure black).
  - Back to top, footer and cursor: the circular back-to-top button is hidden (and out of the tab order) at the top, appears past the middle of the page, and returns to the top; the footer draws every contact logo in one ink and opens with "Let's Build" on every page; mouse pointers get the glowing dart, the pointing hand on links, the open hand on the carousel, and the I-beam in fields (no crosshair).
  - Technologies and projects: every project tool is a listed technology or a known service; every technology shows an icon and every logo loads; selecting a technology lists its projects, updates the URL hash, and links to the project; a project's tool chip opens the Technologies page with it selected; on phones the panel opens under the selected group.
  - Contact form (needs `NEXT_PUBLIC_WEB3FORMS_KEY` on the server under test; skipped otherwise): an empty or invalid submit shows field errors, focuses the first one and sends nothing; a valid message posts the right fields to Web3Forms (mocked), confirms and resets; a rejected send explains it, keeps the text and offers the email address.
  - Background and motion: every page has the signal-line background (full on Home, calm on section pages; static lines under reduced motion); with full motion the page animates, scrolls, and hovers without errors, every revealed element ends fully visible; with Lenis on, anchor links still land below the sticky header (checked on a Projects anchor).
  - GitHub (About page): the section shows counters, streaks, and the contribution calendar, and the year buttons swap the calendar (with a token); or the public fallback (without).
  - Chart (About page): one marker per timeline item and a table row for each; Home, End and arrow keys move the selection; clicking selects the nearest item; the chart fits a 320px screen.
  - Home landing and "Let's Build" (in the footer): the headline lines fit their column at every width; Email Me is a plain `mailto:` link; Copy Email copies the address and says so.
  - Loading screen: it plays on a full load of Home (full motion) with the real counts, preloads and marks Assets "Ready", is still on screen at 3s and clears by itself (then the landing headline decodes), a click continues it, the page scrolls again afterwards, a reload plays it again, and with reduced motion it never shows. (Every other test sets a test-only skip mark in sessionStorage to keep it out of the way.)
  - Hologram card: it holds the page's h1 and a labeled photo placeholder; with reduced motion it stays flat and still; with full motion its layers separate into depth, it tilts toward the cursor and a dragging finger, and a tap folds it flat and back, without console errors.
  - Compass menu on touch: dragging a finger aims the needle (the readout follows) and letting go opens the aimed page.
  - About and Credentials: a labeled photo placeholder until a photo is set; Education is on About (both schools, the console's default tab) and not on Credentials; the About tabs switch by click and by arrow keys/Home/End, keep one tab in the tab order, follow and set the URL hash, and hide the other panels. The credential carousel has one emblem per certification oldest first, copies on either side for the loop, no scrollbar or arrow buttons; a mouse drag past the newest wraps round and settles on (and selects) a credential; clicking centers one; arrow keys wrap round; every certification's real Credly badge loads in the details with its "Verify on Credly" link. Browse by Field sits under the carousel: All lists every credential grouped by field, each field lists exactly its own (`aria-pressed`, URL hash and the "Showing N of 15" line follow), Back works, `/credentials#<field>` preselects it, and picking a row selects it in the carousel. The GitHub section lists the saved achievements as circle nodes linking to GitHub.

Tests run with reduced motion by default (`playwright.config.ts`), so layout and accessibility checks see the settled page; the "full motion" tests switch animations back on.

First run on a new machine: `npx playwright install chromium`. Checks run in Chromium only, so Safari, Firefox and real devices still need a manual look.

## Project structure

```
src/
  app/
    layout.tsx    Root layout: intro script, loading screen, background, skip link, header,
                  <main>, footer, scroll rail, back-to-top button, title template
    page.tsx      Home, in `homeIndex` order: landing, projects ("Let's Build" is in the footer)
    about/page.tsx     About: bio, At a Glance, then the console (tabs: education, career
                       timeline, GitHub activity; components/about/)
    credentials/page.tsx  Certifications: looping carousel, details, browse by field (CredentialPath)
    about/ credentials/ technologies/ projects/ contact/
                  One page.tsx per section (full detail)
    globals.css   Design tokens (Tailwind @theme, dark only), base styles, chart reveal,
                  utilities (hud-label, hud-notch, hud-row open rows), cursor, background, animations
  components/
    SiteHeader.tsx     Sticky top bar: name and the compass menu trigger
    nav/               CompassMenu (radial page menu in a native <dialog>), CompassRose
                       (the rose SVG, also the trigger icon), compass-geometry.ts,
                       ScrollRail (the site's scrollbar on every page; DepthGauge on Home),
                       BackToTop (bottom-right circle with a scroll-progress ring)
    SiteFooter.tsx     Open footer on every page: FooterCta ("Let's Build"), status, page and contact links
    CareerTimeline.tsx Career timeline: cumulative chart, readout, table view
    GitHubActivity.tsx      GitHub section (server: fetches cached stats)
    GitHubActivityView.tsx  Counters, streaks (ring), this month's activity, language bars
    GitHubCalendar.tsx      Contribution heatmap with year buttons, readout, monthly table
    background/        The background on every page: PageBackground (grid, vignette, intensity per route, pause logic),
                       WaveLines (animated), WaveFallback (static), waves.ts (shared
                       wave math, intensity), scene-utils.ts (token colors for the scene)
    hero/              Landing (first screen: headline, actions) and HologramCard
                       (the 2D card that splits into 3D layers; holds the page's h1)
    ProfilePhoto.tsx   Profile photo in a notched frame, or a labeled placeholder until set
    ProjectMedia.tsx   A project's screenshots (first large, the rest as thumbnails that swap in),
                       or a labeled "Screenshot Placeholder" frame until images are added
    intro/             IntroLoader (cyberpunk loading screen markup + its pre-paint script)
                       and IntroController (click to continue, scroll lock, preloading,
                       hand-off to the landing)
    FooterCta.tsx      "Let's Build": email, copy email, LinkedIn, Contact page (top of the footer)
    motion/            MotionRoot (reduced-motion config + Lenis), Reveal, CountUp,
                       Tilt/Magnetic, PageTransition, DecodeText (HUD title decode)
    CredentialPath.tsx Credentials page: looping wave carousel, details with the real Credly badge, browse by field
    CredentialEmblem.tsx  A certification's circular emblem (issuer ring color, code, year)
    RingNode.tsx       Circle node for badge art (GitHub achievements) and small circle markers
    Section.tsx        Home section (teal rule, visible title, content) and ArrowLink, the notched
                       arrow to a section's page
    SkillExplorer.tsx  Technologies page: notched chips, group headers with counts, "Usage" panel,
                       hash-based selection
    ContactForm.tsx    Contact page message form (Web3Forms): validation, honeypot, send states
    TechIcon.tsx       Logo for a technology or tool (color, single-color, or fallback glyph)
    icons.tsx          Shared icon defaults (Icon) and the page / contact-link icon maps
    SectionPage.tsx    Shared open shell for section pages (teal rule, decoding h1, lead, body; no panel)
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
    timeline.ts   Builds the chart's dated points from the content files
    github.ts     Cached GitHub stats (GraphQL with token, REST fallback)
    spotify.ts    Now playing + the last 5 played from Spotify (server only, cached ~30s),
                  served to the About page at app/api/now-playing/route.ts
    skill-usage.ts  Links technologies and projects by name (which projects use each one)
    intro.ts      Loading screen: pre-paint script (every full load of Home), done event
    webgl.ts      WebGL support check for the animated background
    css-vars.ts   Typed helper for CSS custom properties in inline styles
public/           Static assets (images, icons); cursors/ holds the glowing cursor PNGs (1x, 2x);
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
- **The "Signal" redesign (November 2026):** the site had grown about eight visual languages and put nearly everything in a box on pure black, so it was redesigned around one system (DESIGN.md). Dark only: a near-neutral charcoal canvas (never pure black) with near-white text and grey line work, and teal reserved for what is interactive or live. An open layout: no page panels or nested boxes; pages and sections open with a short teal rule, a decoding title and a lead, then content directly on the background, structured by spacing, rules and rails. Two shapes: the notched corner for controls and cards, the circle for nodes in a sequence. Three motion signatures: decode, signal pulses, node glow. The compass menu, the loading screen and the hologram card were kept.
- **A custom scroll rail, on every page:** the browser's page scrollbar is hidden; on desktop a rail on the right edge is the scrollbar. Home shows the depth gauge (a tick per section, a circle marker springing to the section being read); every other page shows a track that fills teal down to a glowing circle following the scroll, which you can click to jump or drag. It's mouse-only and hidden from assistive tech (keyboard and screen reader users scroll as usual), and hidden on pages too short to scroll.
- **Navigation as a compass:** one compass-rose button opens a full-screen radial menu, the same at every width. Page icons sit in hexagons on a ring, each with an all-caps name tag (the aimed one fills teal; the current page keeps a teal edge), and a readout under the needle shows the aimed page and its subtitle; the compass needle swings (spring with a slight wobble) toward whatever you aim at: mouse direction from the center, hover, focus, or arrow keys. On open the ring draws itself, corner brackets lock on around the dial, the rose spins in, and the icons fly out clockwise; with reduced motion it simply fades. It's a native modal `<dialog>` (focus trap, Escape, focus returns to the trigger), page scrolling pauses while it's open, and the footer still lists every page as a plain fallback.
- **One background on every page:** a faint grid and vignette (CSS), grey signal lines drifting slowly, and small teal pulses travelling along a few of them (three.js, lazy-loaded). Full on Home, calmer on reading pages (fewer, dimmer lines, one pulse). The device pixel ratio is capped at 1.5, it pauses when the tab is hidden, and reduced motion (or no WebGL) gets a static SVG of the same lines without downloading three.js.
- **Motion with guardrails:** Motion handles reveals, count-ups, tilt, the name entrance, and page transitions; Lenis smooths scrolling, tuned slower than its default (`wheelMultiplier: 0.7`, `lerp: 0.08` in `MotionRoot`). Under `prefers-reduced-motion: reduce`, Lenis is off, the 3D scene is a still frame, and a CSS rule shows every `[data-reveal]` element as-is (CSS rather than JS branching, so server and client HTML match and nothing hydrates differently). Without JavaScript, a `<noscript>` style does the same.
- **3D kept off the critical path:** three.js and React Three Fiber load only on the client after the page is interactive (`next/dynamic`, about 240 KB gzipped, separate chunk), never on other pages. The wave scene pauses when the tab is hidden. A static SVG of the same lines shows first, whenever WebGL is unavailable, and on its own with reduced motion (the 3D code is then never downloaded).
- **GitHub data, cached and honest:** fetched on the server with `'use cache'` + `cacheLife('hours')`, so the About page is prerendered and refreshes in the background. Every number comes from the API; without a token the section says what it can't show. The heatmap uses one hue (the accent) from light to dark instead of GitHub's greens, with a legend and a monthly-totals table. Streaks are computed from the yearly calendars; a day with no contributions yet doesn't break the current streak, and on a tie the most recent longest streak is shown. The current-streak ring fills toward the longest streak, which is said in text beside it. There is deliberately no letter grade (as some GitHub stats cards show): it's a third-party score, not data.
- **Hand-built chart, no library:** one chart doesn't justify a charting dependency. Gridlines and the step line are SVG with non-scaling strokes; markers and axis labels are HTML positioned in percentages, so nothing distorts at any width. Certifications are circles and projects squares (identity never relies on color alone), the two series colors passed a colorblind-safety and contrast validator in both themes, and a table view lists every point. Mouse, tap, and arrow keys all drive one readout line instead of a floating tooltip.
- **Semantic color tokens only:** Tailwind's default palette is removed (`--color-*: initial`). Components use role names (`bg-canvas`, `bg-surface`, `text-ink`, `border-line-strong`, `text-accent`) and never `dark:` classes. The site is dark only, so each token is a single value, and restyling means editing `globals.css` only. Every text and background pair passes WCAG AA, and control borders (`line-strong`) pass 3:1.
- **Dark only, on purpose:** light mode, the theme switcher, its pre-paint script and the circular theme reveal were removed in the redesign so the background, glow and contrast could be tuned for one canvas. Every token is a single value (contrast-checked: ink 17.7:1, ink-muted 7.4:1, accent 10.5:1, control borders 3.4:1).
- **Open layout instead of HUD panels:** the first design framed every section page in a bracketed panel, nested modules inside it, and boxed the footer, Spotify and credentials. That read as a dashboard template, so the redesign removed the frames: rows are open with a left rail, tabs sit over a hairline, the About profile is an open column with a rail, and only real objects (project cards, media frames, form fields) keep a surface. Corner brackets survive only on the hologram card and the compass dial.
- **Home layout, lean on purpose:** a full-screen landing (the hook, the main action, and the hologram card with the name as the page's h1), Projects (the strongest proof), and "Let's Build" (the ask, last before the footer). The Career Timeline and GitHub Activity moved to the About page, under the bio. About, Credentials, and Technologies live on their own pages, reachable from the compass menu, the footer, and the project chips. The order lives once in `homeIndex` (`site.ts`): the depth gauge reads it and a test checks the page follows it.
- **A cyberpunk loading screen that also preloads, on every full load of Home:** a CRT power-on, flicker and scanlines, the name glitching in, a progress bar and a system check with the real counts printing in, "Access Granted", then a CRT power-off that reveals the landing, about 5 seconds; a click anywhere (or any key) continues sooner, and scrolling deliberately doesn't. Meanwhile it warms up what's heavy (the wave background's three.js chunk, fonts, every section page via router prefetch, the profile photo once set) and its "Assets" row turns Ready when that's done. An inline script in the root layout's `<head>` decides before first paint (every full load of Home, a refresh included, but not navigating to Home within the site; motion allowed), and the loader's markup comes before the header and outside the page fade-in, so the page never flashes first, and without JavaScript or with reduced motion it never shows. The look and timeline are CSS; a small controller holds the page still and announces `intro:done`, which the landing headline's decode and the card's 3D pop wait for. It's always dark (its own `color-scheme`).
- **Hologram card instead of a WebGL scene:** after trying a sonar, a boot panel, and three three.js scenes (compass, gyroscope, monolith), the landing settled on a profile card that starts as flat 2D and splits into floating layers (plate, photo, brackets, name tag, status) once the loader clears. It tilts toward the cursor or a dragging finger, a tap folds it flat and pops it back, and idle it sways. It's plain CSS 3D (`preserve-3d`, `translateZ`) driven by Motion springs and pointer events, so it works the same with touch, keeps real text (the h1), and costs no WebGL. With reduced motion it's a flat, still card. The photo is a clearly marked placeholder until `site.photo` is set.
- **Contact on every page:** "Let's Build Something" moved from the end of Home into the top of the footer, so every page ends with the same ask: Email Me (a plain `mailto:`, the primary action with a soft glow), Copy Email (with a "Copied" confirmation), LinkedIn, and the arrow to the Contact page (left out on the Contact page itself).
- **Compass menu follows a finger:** on touch, dragging on the dial aims the needle at the finger (the readout follows), and letting go after a real drag opens that page, like a game's radial menu; taps, mouse, and keys work as before.
- **Certifications as a looping wave carousel:** after a microchip grid, a filterable talent path and a hexagon path were tried, the Credentials page became a carousel of circular emblems on one line, oldest to newest, looping round. Each emblem is drawn in the site's style (issuer ring color, short code, year); the real Credly badge is shown untouched in the details panel, so verification still shows the genuine badge. The line and the emblems ride one wave that swells with drag or swipe speed and settles at rest; emblems grow toward the center and fade toward the edges; teal pulses run along the line. Drag (with momentum) or swipe settles on the nearest emblem and selects it; clicking centers one; arrow keys and Home/End work for keyboards; there's no scrollbar or arrow buttons. It renders three copies of the set and quietly jumps by one set at the edges, so it loops both ways. Browse by Field sits below: field chips over open rows, grouped by field under All.
- **Credly badges and GitHub achievements saved locally:** `scripts/fetch-credly-badges.mjs` saves each badge image from the public Credly profile into `public/badges/<badge id>.png`; `scripts/fetch-github-achievements.mjs` reads the public GitHub profile's achievements (GitHub has no API for them) into `src/content/achievements.json` plus `public/achievements/`. The site never calls either at runtime; re-run the scripts after earning something new. Achievements show in the About page's GitHub section.
- **Footer, open:** a hairline with a short teal rule, then "Let's Build", "// End of Transmission" with the live availability status, the page and contact links (every icon in one ink, teal on hover), copyright and location. No panel.
- **Back-to-top button:** bottom right on every page, it fades in past the middle of the page. A circle (the site's node shape) whose teal ring fills clockwise with scroll progress and glows on hover; a click glides to the top (Lenis) or jumps with reduced motion, and moves focus to the top of the content.
- **Project screenshots:** each project on the Projects page has a notched 16:9 frame (top of the right column on desktop, first on phones). Until screenshots are added it shows a labeled "Screenshot Placeholder"; to add them, put files in `public/projects/<id>/` and list them under `images` in `src/content/projects.ts` (the first fills the frame, others become thumbnails).
- **About with open tabs:** under the bio and the open At a Glance column, three notched tabs (Education, Career Timeline, GitHub Activity) sit over a hairline and switch one open panel at a time (WAI-ARIA tabs, URL hash, Back works). Education keeps its drawn trace with circle nodes.
- **Spotify player on About:** its own block below the About panel and above the footer (`src/components/about/spotify/Player.tsx`, shared pieces in `shared.tsx`). Left: the loaded song (album art, title linking to Spotify, artist, Open Spotify). Right, filling the rest of the row: a fixed 152px preview panel. Below: the track index (the song playing now, then S1–S5); a row loads that song (no separate transport buttons). The header shows On Air with bouncing signal bars or Off Air. **Song preview:** Spotify no longer gives new apps preview clips, so "Preview on Spotify" opens Spotify's own embed player (a 30-second preview, or the full song for visitors signed in to Spotify) inside the same fixed panel, so nothing else moves; nothing from Spotify loads before that click. Hosting or streaming the audio ourselves isn't allowed. Spotify's design guidelines shaped the rest: the official full logo (path data from Spotify's 2024 logo pack, in `SpotifyLogo.tsx`) is the heading, black on light and Spotify Green on black, never under 70px wide; album art is never animated, bordered or overlaid, with 4px/8px corners; every track links to Spotify, with an "Open Spotify" link. Earlier designs (a radio tuner, a signal scanner, a cassette deck, DJ decks) were tried and removed as too busy. The keys stay on the server; the block polls a cached route every 45 seconds while the tab is visible and hides itself when Spotify isn't set up or fails. Spotify's February 2026 rules: a Development Mode app works only while its owner has Premium, for at most five listed users.
- **Credential fields:** the 15 certifications sit in five fields (AI and Data, Web Development, IT Foundations, Design and UX, Project Management; `category` in `credentials.ts`). The field filter lives under the carousel and lists rows; it never dims the carousel. The choice is in the URL hash, so links like `/credentials#web-development` keep working.
- **One folder per section page, not a `[section]` dynamic route:** each page will grow its own layout (project grid, credentials list, contact form). They share `SectionPage` for now to stay DRY.
- **Brand logos from devicon:** full-color logos make the technology list scannable. devicon is a regular dependency so adding a logo is one import line; only the imported SVGs reach visitors (static files, no JS or CDN). Black-by-brand logos (Next.js, Vercel, GitHub, Express) are drawn in the text color through a CSS mask so they read on the dark canvas, and MySQL's dark blue sits on a light tile. SQL and Turso have no devicon logo and use a database glyph.
- **Glowing cursor, CSS only:** one angular set, dark-filled with a teal outline, a very soft neon glow and a faint offset echo: the arrow, a pointing hand over clickable things, an open hand over draggable things (the credential carousel, the scroll rail) that becomes a fist while dragging, an I-beam in text fields, a slashed box on disabled controls, and the arrow with an hourglass while the contact form sends; drawn as SVG and rendered to 32px PNGs at 1x and 2x (`image-set()`), since glow filters inside SVG cursors are unreliable in Safari and larger images risk being ignored. Mouse pointers only; forced-colors mode keeps the system cursors. No crosshair or reticle.
- **Contact links:** Email, LinkedIn and GitHub. The Credly profile link was removed from Contact and the footer at Neil's request; each certification still links to its own Credly verification page.
- **Contact form through Web3Forms (not Resend):** chosen by Neil for the simplest setup and no backend code. The browser posts to Web3Forms, which emails neilpatrick.dev@gmail.com with the visitor's address as reply-to. Validation runs in the browser (required fields, email format, message length) and a hidden honeypot field catches simple bots; without JavaScript the form still posts natively and Web3Forms shows its own confirmation. Trade-offs accepted: 250 messages a month on the free plan and spam filtering on their side. Resend (server-side, 3,000 a month, secret key) is the upgrade path if spam or volume becomes a problem.
- **Technologies and projects linked by name:** a project's `stack` uses the exact names from `skills.ts`, and `src/lib/skill-usage.ts` derives the connection, so there's no second list to keep in sync (a test fails if a name doesn't match). The selected technology lives in the URL hash (`/technologies#tech-python`) so project chips can link straight to it; the hash avoids the Suspense boundary that search params would need.
