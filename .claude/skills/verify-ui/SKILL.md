---
name: verify-ui
description: Verify the portfolio's UI in a real headless browser. Use after changing components, styles, layout, or content, and when asked to check responsiveness, console errors, accessibility, themes, or how the page looks.
---

# Verify UI

Headless Chromium checks for this project (Playwright + axe). Config: `playwright.config.ts`. Tests: `tests/ui/verify.spec.ts`.

## Steps

1. Run `npm run test:ui`. It reuses a dev server on port 3000 if one is running, otherwise starts one. It runs against the dev server on purpose: React reports hydration warnings only in development. `npm run build` covers production.
   - One test: `npx playwright test -g "<part of its name>"`.
   - First run on a new machine: `npx playwright install chromium`.
2. Read failures. Layout tests report horizontal overflow, axe violations (rule id + selector), and console errors (including hydration warnings). They're named:
   - `layout home <width>px <scheme>`: home at 320, 768, 1024, 1440.
   - `layout <section id> <320|1440>px <scheme>`: every section page (from `sections` in `src/content/site.ts`).
   - `layout compass menu open 320px <scheme>`.
   - Everything else is a behaviour test, named for what it checks.
3. Look at screenshots with the Read tool in `test-results/screenshots/`: `home-<width>-<light|dark>.png`, `<section id>-<320|1440>-<light|dark>.png`, `menu-320-<light|dark>.png`. Check what tests can't: overlap, cramped spacing, awkward wrapping, visual hierarchy, both themes looking intentional. Look at the pages and widths the change affects, not every file.
4. Report: what passed, what failed (with fixes), and what still needs human eyes.

## How the suite is set up

- **Reduced motion is the default** (`contextOptions` in the config), so checks see the settled page. Tests that need animation call `page.emulateMedia({ reducedMotion: "no-preference" })`.
- **The loading screen is skipped:** a `beforeEach` marks the intro as seen in `sessionStorage` before each page loads. Loader tests open a fresh page with `freshPage(context, reducedMotion)` to see it.
- **Touch** is simulated with pointer events (`dispatchEvent`), e.g. the compass drag and the hologram card tilt.
- **Moving elements:** the hologram card never stops animating, so `locator.click()` waits forever. Click by position with `page.mouse` at its bounding box.
- **Stale styles:** if a CSS change doesn't show in screenshots, Turbopack is serving an old `globals.css`. Restart the dev server.

## Limits (always state them)

- Chromium only: no Safari/Firefox, no real devices (touch is simulated).
- Screenshots are for review, not pixel-diff baselines.
- Full-motion feel (timing, smoothness, scroll, the loader and card animations) needs a manual look.

## Maintaining

When a new interactive feature lands (menu, form, toggle, animation with state), add a behaviour test to `tests/ui/verify.spec.ts`. New section pages get layout tests automatically through `sections` in `src/content/site.ts`. Keep this file in step with the test names and screenshot paths.
