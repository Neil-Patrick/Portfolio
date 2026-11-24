---
name: Neil Patrick Pajadan Portfolio
description: A teal heads-up display the visitor operates to inspect Neil's work.
colors:
  canvas: "light-dark(#f7f8fa, #000000)"
  surface: "light-dark(#eceff3, #0f0f0f)"
  ink: "light-dark(#13233a, #ededed)"
  ink-muted: "light-dark(#4a5a70, #a1a1a1)"
  line: "light-dark(#d5dbe3, #262626)"
  line-strong: "light-dark(#74839a, #6b6b6b)"
  accent: "light-dark(#0b7268, #4fd1c1)"
  on-accent: "light-dark(#ffffff, #000000)"
  series-cert: "light-dark(#00897b, #1a9e8f)"
  series-project: "light-dark(#a35c00, #c98425)"
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
  hud-corner: "0.875rem"
  hud-corner-lg: "2rem"
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
  hud-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
  hud-row-hover:
    textColor: "{colors.accent}"
  hud-row-featured:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  hud-tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  arrow-link:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    size: "44px"
  arrow-link-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  panel:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
  header-control:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    size: "44px"
  header-control-hover:
    textColor: "{colors.accent}"
  back-to-top:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    size: "44px"
---

# Design System: Neil Patrick Pajadan Portfolio

## Overview

**Creative North Star: "The Operator's HUD"**

The site is a heads-up display that the visitor operates, not a page they read past. They steer with a compass, and panels lock on as they arrive. Rows read like log entries, and readouts report Neil's work as live system data. Every HUD device has a job: brackets frame what matters, notches mark what's active, and the scan sweep points at the one thing to do next. The cyberpunk feel comes from precision and response, not from neon saturation.

The system is restrained at rest and alive on interaction. Surfaces are flat canvas and surface tones divided by 1–2px lines. Teal is the only signal color, and motion answers the visitor:
- a row nudges toward the cursor;
- a badge flips;
- the hologram card tilts toward a finger.

The one big orchestrated moment is the first-visit loading screen; after that, effects stay small.

It works in both themes. Dark mode is a pure black void with a bright signal teal; light mode is a cool instrument-panel grey with a deep teal. Neither theme is an afterthought.

**Key Characteristics:**
- One signal color (teal) on neutral canvas and surface tones.
- Corner brackets, cut corners and heavy-left-edge rows instead of filled cards and soft shadows.
- A condensed display face (Saira Condensed) for titles and short caps labels; IBM Plex Sans for everything else.
- Motion is feedback (lock-on, wipe, scan, flip, tilt), always with a settled reduced-motion state.
- No neon palettes, no glowing body text, no monospace costume.

## Colors

A cool neutral instrument palette with a single teal signal, defined as `light-dark()` pairs so each token resolves per theme.

### Primary
- **Signal Teal** (accent): links, the active nav item, focus rings, HUD brackets and notches, primary buttons, and the selected state everywhere. It's deep in light mode and bright in dark mode so text contrast passes AA in both.
- **On-Signal** (on-accent): text and icons placed on Signal Teal fills (white in light mode, black in dark mode).

### Neutral
- **Void Canvas** (canvas): the page background. Pure black in dark mode, a pale cool grey in light mode. Log rows sit directly on it.
- **Instrument Surface** (surface): panels, cards and bands, one step off the canvas. The header is not one of them: scrolled, it's canvas-tinted glass, so it matches the page.
- **Instrument Ink** (ink): primary text.
- **Readout Grey** (ink-muted): secondary text, metadata and dates.
- **Hairline** (line): decorative dividers only, never a control boundary.
- **Frame Line** (line-strong): control and panel boundaries and row frames (at least 3:1 against canvas).

### Data Series (charts only)
- **Certificate Teal** (series-cert) and **Project Amber** (series-project): career timeline marks only, validated for colorblind separation. Chart text always uses the ink tokens, never series colors.

### Named Rules
**The One Signal Rule.** Teal is the only accent. Never add a second accent hue (no magenta, matrix green or neon cyan) for decoration. The amber series color exists only inside the career timeline chart.

**The Token-Only Rule.** Tailwind's default palette is removed (`--color-*: initial`). Every color comes from these tokens, and new tints are `color-mix()` of them, never new hex values.

## Typography

**Display Font:** Saira Condensed, 600/700 (with IBM Plex Sans, then a sans-serif fallback)
**Body Font:** IBM Plex Sans (with ui-sans-serif and system-ui)

**Character:** Saira Condensed gives the HUD its tall, engineered voice in titles and labels. IBM Plex Sans keeps body text calm and technical, with tabular figures for dates and counts.

### Hierarchy
- **Landing** (700, `clamp(2.25rem, 12cqi, 7.5rem)`, line-height 1): the home headline only ("Web Apps Today." / "Data and AI Next."). It's sized to its column with container units so each line always fits, and it decodes into place.
- **Display** (700, `clamp(2.5rem, 1.75rem + 3vw, 3.75rem)`, line-height 1.1): section page titles in the HUD panel, which decode in.
- **Headline** (600, line-height 1.2, -0.01em): h2 and h3 headings in Plex.
- **Body** (400, 1rem, line-height 1.6): paragraphs and descriptions, kept to a readable measure (`max-w-prose` or narrower).
- **Label** (Saira Condensed 600, uppercase, 0.12em tracking): short HUD labels such as tags, buttons, dates, issuers and field labels. The caller sets the size.

### Named Rules
**The Caps-for-Labels-Only Rule.** Uppercase is for short HUD labels of one to three words. Headings, links and sentences stay in Title Case or sentence case, never all caps.

**The No-Costume-Mono Rule.** There is no monospace face. Numbers and dates use Plex with `tabular-nums`. Don't add a monospace font to look technical.

## Layout

Pages use a single wide container: max width 110rem, fluid side gutters of `clamp(1rem, 5vw, 6rem)`. The sticky header is 4rem tall and also sets the anchor scroll offset. Breakpoints are Tailwind's defaults (sm 40rem, md 48rem, lg 64rem, xl 80rem, 2xl 96rem), mobile first.

- **The landing** is a full-viewport two-column grid on large screens (the headline and CTAs beside the hologram card), stacked on phones.
- **Section pages** open with a bracketed HUD panel holding the decoding title and lead, followed by log-style lists of rows.
- **Lists** of projects, credentials and achievements are vertical rows or wrapping tiles, never dense masonry.

No layout scrolls horizontally at 320px, and touch targets are at least 44px.

## Elevation & Depth

The system is flat. Depth comes from tonal layering (Void Canvas, then Instrument Surface), 1–2px frame lines and the 4px left edge of log rows, not from drop shadows. The only shadows are teal glows that mark the compass menu's aimed item. Real 3D appears in exactly one place: the hologram card's CSS perspective layers.

### Shadow Vocabulary
- **Aim Glow** (`box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 22%, transparent), 0 0 28px color-mix(in oklab, var(--color-accent) 40%, transparent)`): the item the compass needle points at.
- **Aim Glow, filter form** (`drop-shadow: 0 0 10px color-mix(in oklab, var(--color-accent) 55%, transparent)`): the same glow for clipped or SVG shapes such as the compass hexagons.

### Named Rules
**The Glow-Means-Aimed Rule.** Glow appears only on the thing the visitor is currently aiming at. It never decorates resting cards, text or buttons.

## Shapes

The form language is angular. Corners are square, or cut at 45°, with almost no rounding.

- **Corner brackets** (`hud-corners`): four teal L-shaped arms (0.875rem long, 2px thick, 2rem around the compass dial), drawn as backgrounds so they add no markup. They frame panels, cards and figures.
- **Notch** (`hud-notch`): a 0.75rem cut on the top-right corner of tags, primary buttons and the featured row. It clips outlines, so pair it with an inset focus ring.
- **Corner fold** (`corner-fold`): a small solid teal triangle in the top-right of badge tiles.
- **Hexagons:** compass menu buttons.
- **Circles:** only the 44px arrow link and small status dots.
- **Radii** (4px small, 8px medium) exist for the few soft controls, such as chips and the header's icon buttons. HUD elements stay square.

## Components

### Buttons
Precise and responsive: square, labeled in caps, at least 44px tall.
- **Primary** ("Work With Me", "Email Me"): a Signal Teal fill with On-Signal label text, the top-right notch, and (on the landing) a one-time scan sweep after load. Its focus ring is inset in On-Signal so the notch doesn't clip it. It sits in a subtle magnetic wrapper that pulls toward the cursor with full motion.
- **Secondary** ("See the Work"): transparent with a Frame Line border. On hover the border and text turn Signal Teal.
- **Arrow link** ("go to the section page"): a round 44px button with a Frame Line border and a teal arrow. On hover it fills Signal Teal, the arrow turns On-Signal and nudges right, and the magnetic wrapper applies.

### Log Rows (signature)
Projects, education and contact entries are framed log entries: a 1px Frame Line border with a 4px left edge, on Void Canvas.
- **Link rows:** on hover or focus the edge and text turn teal and the row nudges 0.25rem right (no nudge with reduced motion).
- **The featured row** (the contact email): inverts to a Signal Teal fill with On-Signal text, adds the notch, and plays one scan sweep. There is one per page at most.

### Console Tabs and Modules (About)
- **Tabs:** notched caps tabs on a 2px Signal Teal rail; the active one is filled Signal Teal with On-Signal text, the rest sit on Instrument Surface in Readout Grey and turn teal on hover. One row of three equal tabs on phones.
- **Module:** a bracketed panel of canvas-tinted glass. Header bar: the name in a caps label, a Hairline rule across, and a teal status readout from real data (a pulsing marker when the data is live).
- **Education trace:** entries hang off a vertical Signal Teal line by solder-pad nodes (a teal ring with a dot on canvas); the line draws downward when the tab opens, static with reduced motion.

### Spotify Module (About)
A console module below the tabs. Status reads "Live" with the pulsing marker while a song plays, "Idle" otherwise.
- **Now Playing deck** (only while playing): album art in corner brackets, a four-bar Signal Teal level meter (still under reduced motion), the song in the display face and the artist in Readout Grey.
- **Recently Played:** the last three tracks as log rows with a thumbnail, title, artist and a caps "how long ago" label; on phones the time sits under the artist.

### Filter Chips
Caps labels with a count, at least 44px tall, wrapping on phones (Credentials categories, Technologies). Resting: a Frame Line border that turns Signal Teal on hover. Selected: a Signal Teal fill with On-Signal text, and the count inverts. They're toggle buttons (`aria-pressed`), and the choice lives in the URL hash.

### HUD Tags
Short caps labels on Instrument Surface with a 2px teal left edge and the notch. The compass menu uses them to name each destination.

### Panels
A HUD panel is a Hairline border with corner brackets, open to the canvas behind it (no fill). On section pages its brackets "lock on" once (sliding out from the center over 700ms) as the title decodes.

### Credential Chips (signature)
Every certification is the same microchip card; none is singled out. Grid of 2 (phones) to 5 (xl) per row, newest first in each category.
- **Package:** a square die framed by Frame Line pins on all four sides (`chip-pins`, drawn as backgrounds).
- **Die front:** Instrument Surface with corner brackets; the issuer in small caps, a pin-1 dot, the short code big in the display face, the month in teal, and a status LED.
- **Aimed (hover or focus):** pins, LED and name turn Signal Teal, and the die flips in 3D to the real Credly badge. With reduced motion it swaps without the spin.
- **Under the package:** the full name in the display face and the issuer in Readout Grey. The whole card is the link.

### Badge Tiles
Square tiles (80px small, 112px large), used for GitHub achievements.
- **Front:** the issuer label, a big code in the display face (for example "AI" or "DATA"), and a teal corner fold.
- **Back:** hover or focus on the parent link flips the tile in 3D to the real badge art. With reduced motion it swaps without the spin.

### Navigation (Compass Menu)
The primary navigation is a radial compass dial in corner brackets, with hexagon buttons for each section and a readout of the aimed destination.
- **Aiming:** on desktop the needle follows the pointer. On touch it follows a dragging finger, and releasing after a real drag opens that page.
- **The aimed item:** gets Aim Glow and a label that wipes in.
- **Keyboard and taps** work as ordinary links.

### Header Controls
The theme chip and the compass trigger are borderless 44px squares in Instrument Ink that turn Signal Teal on hover. No outlines.
- **Theme chip:** a glyph for the mode (sun, moon, or sun-and-moon for System) over three 6×2px ticks marking the stop in the Light → Dark → System cycle; the active tick is teal. A click glitches the glyph for 160ms (offset Signal Teal and Readout Grey copies), then the new theme spreads out from the chip in a circle.

### Back to Top
A 44px square, bottom right on every page, canvas-tinted glass with corner brackets. It fades in past the middle of the page. A Hairline outline fills with Signal Teal as you scroll, so it doubles as a progress readout. Hidden, it's inert.

### Footer (Terminal Sign-off)
A HUD panel of canvas-tinted glass with corner brackets and a short notched Signal Teal tab on its top edge.
- **Sign-off line:** "// End of Transmission" in a Readout Grey label, with the live availability status and a pulsing teal marker.
- **Links:** Pages and Get in Touch under caps labels. Every icon is one ink (brand logos too), and links turn teal on hover.
- **Bottom bar:** the copyright year and the location.

### Hologram Card (signature)
The landing's profile card starts flat like a printed card, then separates into floating 3D layers (back plate, photo, brackets, name tag, status chip) when the loader clears.
- **Movement:** it tilts toward the cursor or a dragging finger, sways when idle, and folds flat and pops back on tap.
- **Surface:** a holographic sheen and faint scanlines sit on top.
- **Reduced motion:** the card is flat and still.
- **Content:** its name tag is the page's h1.

### Loading Screen
Shown on every full load of Home (a refresh included), for about 5 seconds:
- the CRT powers on;
- the name glitches in;
- system-check rows print in, with real counts and a live Assets row;
- a progress bar fills;
- "Access Granted" appears, then the CRT powers off.

A click or key continues it immediately. It never shows with reduced motion.

## Do's and Don'ts

### Do:
- **Do** use Signal Teal as the only accent, and mix tints from it with `color-mix()`.
- **Do** frame important content with corner brackets, notches and frame lines instead of filled, shadowed cards.
- **Do** give every animation a settled final state under `prefers-reduced-motion` (content is fully visible and nothing hides behind motion).
- **Do** make motion answer the visitor (hover, focus, drag, press), and keep idle motion to the hologram card's sway and the loader.
- **Do** design and check both themes, with AA contrast for every text and background pair.
- **Do** keep labels in Title Case and reserve caps for short HUD labels.

### Don't:
- **Don't** add neon magenta, matrix green or a second accent hue.
- **Don't** put glow or `text-shadow` on body text, headings or resting elements. Glow means "aimed".
- **Don't** add a monospace font for a technical look. Use `tabular-nums` for figures.
- **Don't** add constant glitching or CRT flicker outside the loading screen.
- **Don't** use heavy blur or frosted-glass panels; the hologram card owns the holographic look.
- **Don't** build a dark-only effect. Every treatment must work in light mode too.
- **Don't** round HUD elements; radii are for the few soft controls only.
