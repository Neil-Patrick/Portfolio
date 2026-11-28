---
name: Neil Patrick Pajadan Portfolio
description: An open, dark "Signal" layout where Neil's work sits directly on a living line field, with teal reserved for what responds.
colors:
  canvas: "#0b0c0e"
  surface: "#121417"
  ink: "#f2f4f5"
  ink-muted: "#9a9fa6"
  line: "#26282c"
  line-strong: "#62676e"
  accent: "#4fd1c1"
  on-accent: "#04110f"
  series-cert: "#1a9e8f"
  series-project: "#c98425"
  issuer-ibm: "#78a9ff"
  issuer-cisco: "#f5b85c"
  issuer-certiport: "#c792ea"
  spotify-logo: "#1ed760"
typography:
  landing:
    fontFamily: "Saira Condensed, IBM Plex Sans, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.25rem, 12cqi, 7.5rem)"
    fontWeight: 700
    lineHeight: 1
  display:
    fontFamily: "Saira Condensed, IBM Plex Sans, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.5rem, 1.75rem + 3vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Saira Condensed, IBM Plex Sans, ui-sans-serif, sans-serif"
    fontWeight: 600
    letterSpacing: "0.12em"
rounded:
  sm: "4px"
  md: "8px"
spacing:
  header: "4rem"
  hud-notch: "0.75rem"
  gutter: "clamp(1rem, 5vw, 6rem)"
  page-max: "110rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    padding: "8px 24px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "8px 24px"
    height: "44px"
  button-secondary-hover:
    textColor: "{colors.accent}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  log-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
  log-row-hover:
    textColor: "{colors.accent}"
  arrow-link:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    size: "44px"
  arrow-link-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  back-to-top:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    size: "48px"
---

# Design System: Neil Patrick Pajadan Portfolio

## Overview

**Creative North Star: "Signal on the Wire"**

The site is an open field, not a dashboard. Neil's work sits directly on a dark charcoal canvas crossed by faint grey signal lines, and small teal pulses travel along them like data on a wire. Nothing is boxed for the sake of it. Pages read as chapters: a short teal rule, a large title that decodes into place, then the content laid straight onto the background, organised by spacing, type and thin lines.

Teal is the signal. It marks what responds (links, buttons, the selected thing, focus) and what is live (On Air, Open to Work), and nothing else. Everything at rest is charcoal, grey and near-white, so the teal always stands out. Motion answers the visitor: the credential carousel waves as it is dragged, a pulse runs down the line, the selected emblem's ring turns. The one big orchestrated moment is still the first-visit loading screen.

The site is dark only. Light mode was removed in the November 2026 redesign so the background, glow and contrast could be tuned for one canvas.

**Key Characteristics:**
- Open layout: content on the background, structured by spacing, type, rules and rails, not panels.
- One signal color (teal) for interactive and live things only; neutral charcoal, grey and near-white for everything else.
- One background on every page: a faint grid, grey signal lines and teal pulses, calmer on reading pages.
- Two shapes: the notched corner for controls and cards, the circle for nodes in a sequence.
- A condensed display face (Saira Condensed) for titles and short caps labels; IBM Plex Sans for everything else.
- Motion is feedback with a settled reduced-motion state; three signatures only (decode, signal pulses, node glow).

## Colors

A near-neutral charcoal palette with a single teal signal. Every text pair is checked for WCAG AA (ink 17.7:1, ink-muted 7.4:1, accent 10.5:1 on the canvas).

### Primary
- **Signal Teal** (accent): links, primary buttons, the selected chip, tab and emblem, focus rings, live markers, the scroll rail's fill and the background pulses.
- **On-Signal** (on-accent): text and icons on Signal Teal fills.

### Neutral
- **Charcoal Canvas** (canvas): the page background, near-neutral so nothing reads as tinted. Never pure black.
- **Raised Surface** (surface): the few real objects (project cards, the media frame, form fields, emblem faces).
- **Bright Ink** (ink): primary text.
- **Readout Grey** (ink-muted): secondary text, labels, counts, dates, and every non-interactive label that used to be teal.
- **Hairline** (line): decorative dividers, the background grid.
- **Frame Line** (line-strong): control boundaries, rails, the signal lines (at least 3:1 against the canvas).

### Data Series (charts only)
- **Certificate Teal** (series-cert) and **Project Amber** (series-project): career timeline nodes only (certifications solid teal, projects an amber ring with a core). Chart text always uses the ink tokens.

### Named Rules
**The One Signal Rule.** Teal means interactive or live. Never use it for decoration, plain labels, counts or values; those are ink or Readout Grey.

**The Issuer Ring Rule.** Credential emblems ring in their issuer's color (IBM blue `#78a9ff`, Cisco amber `#f5b85c`, Certiport violet `#c792ea`). These three appear only on emblems and are never teal, so teal stays the signal.

**The Token-Only Rule.** Tailwind's default palette is removed (`--color-*: initial`). Every color is a token; new tints are `color-mix()` of tokens. Fixed exceptions are listed (cursor images, issuer rings, Spotify's logo green).

## Typography

**Display Font:** Saira Condensed, 600/700 (with IBM Plex Sans, then a sans-serif fallback)
**Body Font:** IBM Plex Sans (with ui-sans-serif and system-ui)

**Character:** Saira Condensed gives titles and labels a tall, engineered voice. IBM Plex Sans keeps body text calm and technical, with tabular figures for dates and counts.

### Hierarchy
- **Landing** (700, `clamp(2.25rem, 12cqi, 7.5rem)`, line-height 1): the home headline only ("CODE IN / PROGRESS.", caps by Neil's choice), sized to its column and decoding into place.
- **Display** (700, `clamp(2.5rem, 1.75rem + 3vw, 3.75rem)`, line-height 1.1): page titles and home section titles, under a short teal rule.
- **Headline** (600, line-height 1.2, -0.01em): h2 and h3 headings in Plex.
- **Body** (400, 1rem, line-height 1.6): paragraphs at a readable measure.
- **Label** (Saira Condensed 600, uppercase, 0.12em tracking): short labels: chips, buttons, field labels, dates, issuers, statuses.

### Named Rules
**The Caps-for-Labels-Only Rule.** Uppercase is for labels of one to three words. Sentences and links stay in sentence or Title Case.

**The No-Costume-Mono Rule.** There is no monospace face. Numbers use Plex with `tabular-nums`.

## Layout

One wide container (max 110rem, fluid gutters `clamp(1rem, 5vw, 6rem)`), a 4rem sticky header that turns into charcoal glass on scroll, Tailwind's default breakpoints, mobile first.

- **Page opening:** a 3rem teal rule, the decoding title, the lead sentence, then content directly on the background. No page panel.
- **One section per screen** (`screen-section`, `--spacing-screen`): every section is at least the window's height under the header, its content centred vertically with generous room above and below, so each reads on its own and nothing feels stacked. Taller content simply runs longer; a screen whose optional content renders nothing (Spotify unset) disappears. Section pages open with the title and first content on one screen, then one screen per part (`SectionPage`'s `after`, `<Screen>`): About (bio, console, Spotify), Projects (one project each), Credentials (carousel and detail, then Browse by Field). Home: Name, Intro, Projects. Sections are separated by space and hairlines, not boxes. Home sections get a visible title like the pages.
- **Lists** are open log rows with a 2px rail on the left and a hairline below.
- **The footer** on every page but Contact opens with "Let's Build Something" and the contact actions on a full, centred screen of its own (`--text-closing`; the section itself is `#contact`, so a jump to it fills the window and the footer stays out of view), then the compact footer links under a hairline, all open on the background. The Contact page skips Let's Build, being the full version of it.
- **The scroll rail** (desktop) replaces the browser's scrollbar on every page.

No layout scrolls horizontally at 320px; touch targets are at least 44px.

## Elevation & Depth

Flat. Depth comes from the background's layers (grid, signal lines, vignette), the Raised Surface tone on the few real objects, and glow on what is selected or aimed at. There are no drop shadows on resting cards. The hologram projector is the one place light is drawn as an effect (beam, glow, scanlines).

### Shadow Vocabulary
- **Signal Glow** (`drop-shadow: 0 0 6–12px color-mix(in oklab, var(--color-accent) 40–60%, transparent)`): the primary button, the hovered back-to-top button, the scroll rail marker.
- **Emblem Halo** (radial teal gradient, breathing): behind the selected credential emblem.
- **Aim Glow** (`box-shadow` ring plus soft teal): the compass menu's aimed item.

### Named Rules
**The Glow-Means-Selected Rule.** Glow appears on the primary action, the selected or aimed item, and nothing else. Never on resting cards, body text or plain labels.

## Shapes

- **Notch** (`hud-notch`, 0.75rem top-right cut): buttons, chips, tabs, project cards, the media and photo frames, the preview panel. On bordered elements, `hud-notch-edge` draws the clipped corner's diagonal so the outline stays closed. Pair with an inset focus ring.
- **Circle:** nodes in a sequence: credential emblems, GitHub achievements, education trace nodes, the scroll rail and home gauge markers.
- **Rails and rules:** 2px rails on list rows, 3rem teal rules opening pages and sections, hairline dividers.
- **Corner brackets** survive only on the About portrait's hologram card and the compass dial.
- **Radii** (4px, 8px) only for album art (Spotify's rule) and embedded players.

## Components

### Buttons
- **Primary:** a notched Signal Teal fill with On-Signal caps label and a soft Signal Glow (on a wrapper, since the notch clips shadows).
- **Secondary:** a notched outline (Frame Line), caps label; border, edge and text turn teal on hover.
- **Arrow link:** a notched 44px square with a teal arrow; fills teal on hover.

### Log Rows
Open rows on the background: a 2px Frame Line rail on the left and a hairline below. Link rows turn teal and nudge right on hover (no nudge with reduced motion). The Contact page's email row has a teal rail.

### Chips and Tabs
Notched outlines with caps labels and a count; selected is a Signal Teal fill. Used for credential fields, Technologies, and the About tabs (which sit over a hairline, with panels open below).

### Credential Carousel (signature)
A looping, draggable line of circular emblems, oldest to newest, then round again.
- **Emblem:** a Raised Surface disc ringed in the issuer's color, a ticked inner ring, the issuer above, the short code in the display face, the year below.
- **Motion:** the line and every emblem ride one wave that swells with drag or swipe speed and settles when still; emblems grow toward the center and fade toward the edges; teal pulses run along the line; the selected emblem's inner ring turns and a halo breathes behind it.
- **Interaction:** drag (mouse, with momentum) or swipe; it settles on the nearest emblem and selects it. Click glides one to the center. Arrow keys and Home/End for keyboards. No scrollbar, no arrow buttons.
- **Details:** below the carousel, the real Credly badge (untouched), field, position, issuer, dates and "Verify on Credly".
- **Browse by Field:** below that, field chips over open rows (small emblem, name, issuer, month, Credly link), grouped by field under All; the choice lives in the URL hash.

### GitHub Signal Readout (About)
GitHub's numbers in the site's own language, not GitHub's. A **streak reactor**: a flame flickers in a core ringed by one arc segment per day of the longest streak; the segments charge up to the current streak once in view, embers rise, and at a record the flame runs hotter. Total Contributions and Longest Streak flank it as readouts (big number, short teal rule, caps label). The year stays GitHub's familiar contribution heatmap (cells fill in diagonally; hover or tap reads a day; a monthly table is the text version), with notched year chips. **Languages** are arcs around a core with a named legend. **This month** is a transmission log: repositories branch off one wire, each trace as long as its commits, a pulse on the busiest, new repositories as hollow nodes. **Achievements** are circle badges strung on a wire. No profile button. All motion stops under reduced motion.

### Career Circuit Bus (About)
One horizontal wire is time. Each certification branches up and each project branches down to a circle node; close items fan out over three heights and step sideways on a 45° bend. Traces draw out once in view, a pulse runs along the bus and blips each node as it passes, and the running total sits at the end of the wire. One selection (nearest node, tap, arrow keys) drives the readout below; a table lists everything. Phones get a vertical bus, newest first, with each name beside its node.

### Spotify Player (About)
Open on a hairline: the official Spotify logo as the heading, On Air with bouncing signal bars or Off Air. Left, the loaded song (static album art, title linking to Spotify, artist, Open Spotify, a reserved Close Preview button). Right, a fixed 152px preview panel: a notched "Preview on Spotify" button that becomes Spotify's embed player in place, so nothing shifts. Below, the S1–S5 track index. Album art never animates (Spotify's rules).

### Technologies
Notched chips with logos and counts per group (group header: name, hairline, count). The usage column is open, with a rail on its left.

### Contact Form
Open fields under an open section header ("Send a Message"); square Raised Surface inputs with a Frame Line border that turns teal on hover and focus; a notched primary submit.

### Project Media
A notched 16:9 Raised Surface frame. With screenshots, the first fills it and others are thumbnails; without, a labeled "Screenshot Placeholder".

### Navigation (Compass Menu)
Kept from the first design and re-tinted: the compass dial with brackets, an aiming needle, Aim Glow on the aimed item.

### Scroll Rail
The site's scrollbar on every page (desktop). A Frame Line track that fills teal down to a glowing circle marker following the scroll; click the rail to jump or drag the marker. Home shows the section gauge instead (a tick per section, the marker springs to the current one).

### Back to Top
A 48px diamond, like the compass needle's tip: dark face, Frame Line edge, an upright chevron, glowing on hover. A teal line grows clockwise round its edge from the top point as you go down the page, easing smoothly (no fill). Appears past the middle of the page.

### Project images (Scan image)
`ScanImage.tsx`, on the home project cards and the Projects page's main frame:
- **Appear:** the first time an image is in view and loaded, it wipes in top-down behind a teal scan line. The home cards stagger it, rising in one after another with `Reveal`.
- **Hover or keyboard focus** on the card or frame: the image zooms a touch, a band sweeps across, faint scanlines show, the border turns teal and the card glows. Home cards also slide in a "View Project" tag.
- **Reduced motion:** images are simply shown.

Home cards lead with the project's first screenshot (16:9) above the name, summary and logos.

### Cursor
One angular set: dark-filled shapes with a teal outline and a very soft neon glow; the arrow and hands trail a faint offset echo. The arrow everywhere; a pointing hand over clickable things; an open hand over draggable things (the credential carousel, the scroll rail) that becomes a fist while dragging; an I-beam in text fields; a slashed box on disabled controls; the arrow with an hourglass while something works (the contact form sending). 32px PNGs at 1x and 2x. Mouse pointers only; forced-colors mode keeps the system cursors.

### Footer
A full screen, centred: a teal rule, "Let's Build Something" large, the lead, then Email Me (primary with glow), Copy Email, LinkedIn and the arrow to Contact. Then, on a hairline with a teal rule: "// End of Transmission", Open to Work, page and contact links, copyright and location.

### Name screen and Open to Work chip
Home opens on a screen of its own holding only the name (`NameHero.tsx`): the page's h1, large (`--text-name`, sized to the page width) and centred, decoding in as the loader clears, with an Explore button down to the landing. Neil plans more for this section. The landing is the second screen; its headline decode and the projector's project-in wait until it is scrolled into view. Open to Work is a projected HUD chip on its own line under the two actions (`AvailabilityChip.tsx`, globals.css "Open to Work chip"):
- **Look:** a translucent teal plate with scanlines, a dashed ring round a pulsing dot, the notched edge.
- **Link:** it goes to the "Let's Build" call to action.
- **Hover, keyboard focus or a press:**
  - it brightens and a band sweeps across;
  - the ring spins faster and the label jitters;
  - the detail ("Internships, jobs & freelance") slides out sideways, or opens as a second line on phones.
- **The detail** is always part of the link's text.

### Hologram Projector (signature)
The landing's centrepiece (`HoloProjector.tsx`, globals.css "Hologram projector"). The illustrated avatar (`site.avatar.holo`, black keyed out; never the real photo, which stays on About) stands in a teal beam rising from a ring emitter: perspective rings, orbiting dashes, tick marks, a glowing core. Scanlines and a rising scan band are clipped to the figure by its own alpha. No labels sit on the projection.
Motion, driven by `data-phase` (`off` / `on` / `glitch`):
- **Project-in:** once the loader clears, the rings open, the beam fades up, and the figure builds bottom-up with a flicker.
- **Idle:** a rare flicker, the scan band rising, the dashes orbiting, a slow float.
- **Pointer:** the pointer or a dragging finger drifts the figure in parallax; a tap glitches it (RGB split, jitter) and re-projects.
- **Reduced motion:** all of it is shown still. It's built in CSS and Motion springs, with no WebGL.

### Hologram Card (About portrait)
`HoloCard.tsx`, the earlier landing card's look, now holding only the About portrait, apart from the At a Glance list and the tabs:
- **Layers:** a bracketed plate with scanlines and a sheen that slides as it turns, the portrait floating in front, corner brackets further out.
- **Motion:** the layers separate into depth once in view; it tilts toward the cursor or a dragging finger, and sways gently when idle.
- **Drag guard:** a drag never counts as a click on the portrait.
- **Reduced motion:** a flat, still card.

### Photo Reveal (About)
`PhotoReveal.tsx`, inside the hologram card. The portrait shows the illustration (`site.avatar.illustrated`, on the same charcoal grid as the photo, face aligned) first. Once in view, a teal scan line sweeps down and uncovers the real photo, landing with a faint flicker.
- **The portrait is the control:** click, tap, Enter or Space flips it, sweeping again (down to the photo, up to the illustration).
- **Hover or keyboard focus:** a scan shimmer, a glowing frame and a "Click to switch" hint ("Tap to switch" on touch, where it shows faintly at rest).
- **Reduced motion:** the real photo shows at once and flips are instant.

### Loading Screen
Kept: the CRT boot sequence on a full load of Home, re-tinted to the charcoal canvas. Never plays with reduced motion. About 6 seconds in two acts after the CRT power-on:
1. **Data:** the progress bar, the system check with real counts, and "Access Granted". Then the status line and data block jolt twice and wipe off upward.
2. **The NP logo alone,** centred and enlarged to fit the screen (`IntroLogo.tsx`, `--spacing-intro-logo: min(52svh, 66vw)`). It blinks out at the end, before the CRT power-off reveals the page.

How the logo plays:
- **Trace:** each letter's outline traces in teal, one after another (left stem, diagonal, right stem, P).
- **Ignite:** the letters ignite solid with a flicker, and the outlines dim to a glow.
- **Glitch:** two sliced teal copies glitch over it as it settles.
- **Scanlines:** faint scanlines run over its shape.
- **Sparkle:** it spins in last with a flash ring and keeps pulsing.

## Do's and Don'ts

### Do:
- **Do** put content directly on the background and structure it with spacing, rules and rails.
- **Do** keep teal for interactive and live things; make plain labels, counts and values ink or Readout Grey.
- **Do** use the notch for controls and cards, and the circle for nodes in a sequence.
- **Do** give every animation a settled reduced-motion state, and pause ambient motion off screen.
- **Do** keep text at AA contrast against the brightest frame of the background.
- **Do** show real third-party marks untouched (Credly badges, Spotify logo and album art).

### Don't:
- **Don't** wrap sections or pages in bordered panels, or nest boxes inside boxes.
- **Don't** use pure black, or tint the whole page teal.
- **Don't** add a second accent color for decoration (issuer rings are the documented exception).
- **Don't** glow resting cards, body text or labels.
- **Don't** bring back light mode piecemeal; it was removed on purpose.
- **Don't** show the browser's page scrollbar; the scroll rail is the scrollbar.
- **Don't** animate album art or alter issuers' badge art.
