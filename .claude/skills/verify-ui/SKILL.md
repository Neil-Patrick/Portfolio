---
name: verify-ui
description: Verify the portfolio's UI in a real headless browser. Use after changing components, styles, layout, or content, and when asked to check responsiveness, console errors, accessibility, themes, or how the page looks.
---

# Verify UI

Headless Chromium checks for this project (Playwright + axe). Config: `playwright.config.ts`. Tests: `tests/ui/verify.spec.ts`.

## Steps

1. Run `npm run test:ui`. It reuses a dev server on port 3000 if one is running, otherwise starts one.
   - First run on a new machine: `npx playwright install chromium`.
2. Read failures. Each layout test is named `layout <width>px <scheme>` and reports horizontal overflow, axe violations (rule id + selector), and console errors (including hydration warnings).
3. Look at screenshots with the Read tool: `test-results/screenshots/<width>-<light|dark>.png` for widths 320, 768, 1024, 1440. Check what tests can't: overlap, cramped spacing, awkward wrapping, visual hierarchy, both themes looking intentional. Look at the widths affected by the change, not all eight by default.
4. Report: what passed, what failed (with fixes), and what still needs human eyes.

## Limits (always state them)

- Chromium only: no Safari/Firefox, no real devices or touch.
- Screenshots are for review, not pixel-diff baselines.
- Motion feel, scroll smoothness, and reduced-motion behavior need a manual look.

## Maintaining

When a new interactive feature lands (menu, form, toggle, animation with state), add a behaviour test to `tests/ui/verify.spec.ts`. New sections are covered automatically through `sections` in `src/content/site.ts`.
