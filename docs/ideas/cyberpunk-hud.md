# Cyberpunk / HUD ideas (from UI/UX Pro Max)

Ideas pulled on 2026-11-23 from three entries in the UI/UX Pro Max style data
([nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill),
`data/styles.csv`): **Cyberpunk UI**, **HUD / Sci-Fi FUI**, and **Cyberpunk Mobile HUD**.
The skill itself is not installed; this is a one-time read for inspiration.

Nothing here is approved work. Each idea is filtered for this site: teal accent,
Saira Condensed display type, light and dark themes, reduced motion respected.

## What the entries say, in short

| | Cyberpunk UI | HUD / Sci-Fi FUI | Cyberpunk Mobile HUD |
|---|---|---|---|
| Palette | Matrix green #00FF00, magenta #FF00FF, cyan #00FFFF on #0D0D0D | Cyan #00FFFF, holo blue #0080FF, alert red #FF0000, grid lines #333 | Void #0A0A0F, card #12121A, neon green #00FF88, magenta, cyan #00D4FF, alert #FF3366, border #2A2A3A |
| Type | Monospace | Monospaced "tech" fonts | Orbitron headings, JetBrains Mono body |
| Effects | Neon text glow, glitch (skew/offset), scanline overlay | 1px fine lines, glow, scanning animations, ticker text, blinking markers, line drawing, transparency | Chamfered 45° corners, scanlines, CRT flicker, glitch on active states, neon pulse on buttons, corner brackets, prompt-style inputs, holographic blur panels |
| Light mode | Not recommended | Supported | Not recommended |
| Accessibility risk | Low | High | Conditional |
| Their own rules | "Glitch effect subtle", reduced motion | Not for reading-heavy content | "Reduced motion disables glitch/flicker" |

## Already on the site

Corner brackets (`hud-corners`), chamfered corners (`hud-notch`, `corner-fold`),
1px lines (`hud-row`), scanning sweep (`hud-scan`), lock-on and wipe reveals,
CRT power on/off and flicker plus the glitched name (loader only), blinking cursor,
holographic sheen and scanlines (hologram card), glow token (`--drop-shadow-glow`),
live pulse dot, decoding titles.

## Ideas worth trying

**Recommended** (small, fits the system, adds life):

1. **Line drawing on reveal.** HUD frames and the career timeline's lines draw
   themselves in (SVG `stroke-dashoffset`, or a `clip-path`/`scale` wipe on borders)
   the first time they scroll into view. One orchestrated moment per section, not
   per element. Reduced motion: drawn already.
2. **Prompt-style contact form.** Inputs get a `>` prompt prefix and a block caret
   while focused (`caret-shape: block` where supported, accent `caret-color`). The
   labels stay real `<label>`s; only the decoration is terminal-like.
3. **Glitch on press, not on idle.** A 2-step `translateX(±2px)` with `steps(2)`
   for ~150ms when a primary button is pressed or a menu link is chosen. Response to
   the visitor's action, so it reads as feedback rather than noise. Off with reduced motion.
4. **An alert color token.** A red/pink token (their #FF3366 is a good start; check
   contrast in both themes) for form errors and the "copy failed" state, so errors
   stop borrowing the accent. Always paired with an icon or text, never color alone.

**Maybe** (good, but watch the budget):

5. **Ticker line.** A slow horizontal ticker in the footer or under the landing
   (status, location, current focus, local time). Must pause on hover and focus,
   stop with reduced motion, and carry real content only.
6. **Blinking markers.** Tiny accent crosshair or square markers that blink at
   panel corners or on the active timeline point. Limit to one blinking thing per
   screen.
7. **Faint grid backdrop on section pages.** 1px grid lines at low opacity behind
   the HUD panel (theirs: #333 at fine spacing), using a border token so it adapts
   to light mode.
8. **Neon pulse on the primary CTA.** A slow glow breathing on "Work With Me" only,
   using `--drop-shadow-glow`. One element site-wide, or it turns into noise.

**Skip** (clashes with this site or its rules):

- Their palettes (matrix green, magenta, pure cyan). The teal accent is the identity.
- Monospace or Orbitron everywhere. Saira Condensed already carries the tech feel;
  monospace stays for data and numbers only.
- Neon `text-shadow` on body text. It hurts readability and contrast.
- Constant glitch or CRT flicker outside the loader.
- Heavy blur "holographic" panels. Costly on phones, and the hologram card already
  owns that look.
- "Dark only". The site supports both themes on purpose.

## Before building any of these

Propose the chosen ideas as a plan first (CLAUDE.md). Check each against
prefers-reduced-motion, WCAG AA contrast in both themes, 44px touch targets, and
the Playwright suite.
