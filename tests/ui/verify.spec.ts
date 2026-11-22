import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { sections } from "../../src/content/site";
import { buildTimeline } from "../../src/lib/timeline";

const WIDTHS = [320, 768, 1024, 1440];
const SCHEMES = ["light", "dark"] as const;
const SCREENSHOT_DIR = "test-results/screenshots";
const pages = sections.filter((s) => s.href !== "/");
const timeline = buildTimeline();

/** Collects console errors and uncaught exceptions from the moment it is called. */
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

/** Fails on horizontal scroll, axe WCAG 2.1 AA violations, or collected console errors. */
async function checkPage(page: Page, errors: string[]) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(0);

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const violations = axe.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(violations, "accessibility violations").toEqual([]);

  expect(errors, "console errors").toEqual([]);
}

async function openPage(page: Page, path: string, width: number, scheme: (typeof SCHEMES)[number]) {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

const chartPlot = (page: Page) => page.getByRole("group", { name: /Timeline plot/ });
const chartReadout = (page: Page) => page.getByTestId("chart-readout");
const chartFigure = (page: Page) => page.getByRole("figure", { name: /^Career timeline/i });

/* ---------- Layout, console, and accessibility ---------- */

// Home: every width × scheme.
for (const width of WIDTHS) {
  for (const scheme of SCHEMES) {
    test(`layout home ${width}px ${scheme}`, async ({ page }) => {
      const errors = collectErrors(page);
      await openPage(page, "/", width, scheme);
      // Let the chart's one-time reveal finish before capturing.
      await page.waitForTimeout(1400);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/home-${width}-${scheme}.png`, fullPage: true });
      await checkPage(page, errors);
    });
  }
}

// Section pages: smallest and largest width × scheme.
for (const section of pages) {
  for (const width of [320, 1440]) {
    for (const scheme of SCHEMES) {
      test(`layout ${section.id} ${width}px ${scheme}`, async ({ page }) => {
        const errors = collectErrors(page);
        await openPage(page, section.href, width, scheme);
        await expect(page.getByRole("heading", { level: 1, name: section.label })).toBeVisible();
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/${section.id}-${width}-${scheme}.png`,
          fullPage: true,
        });
        await checkPage(page, errors);
      });
    }
  }
}

// Compass menu open on the smallest phone, both schemes.
for (const scheme of SCHEMES) {
  test(`layout compass menu open 320px ${scheme}`, async ({ page }) => {
    const errors = collectErrors(page);
    await openPage(page, "/", 320, scheme);
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/menu-320-${scheme}.png` });
    await checkPage(page, errors);
  });
}

/* ---------- Behaviour: navigation ---------- */

test("every section in site.ts exists on the home page", async ({ page }) => {
  await page.goto("/");
  for (const section of sections) {
    await expect(page.locator(`#${section.id}`), `#${section.id}`).toHaveCount(1);
  }
});

test("each home preview links to its page", async ({ page }) => {
  for (const section of pages) {
    await page.goto("/");
    await page.getByRole("link", { name: section.cta, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${section.href}$`));
    await expect(page.getByRole("heading", { level: 1, name: section.label })).toBeVisible();
    await expect(page).toHaveTitle(new RegExp(`^${section.label} \\|`));
  }
});

const compassNav = (page: Page) =>
  page.getByRole("dialog", { name: "Site navigation" }).getByRole("navigation", { name: "Primary" });

test("compass menu links every page and marks the current one", async ({ page }) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await expect(trigger).toBeVisible();
    await trigger.click();
    for (const section of sections) {
      await expect(compassNav(page).getByRole("link", { name: section.label, exact: true })).toBeVisible();
    }
    await expect(compassNav(page).getByRole("link", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  }
  await compassNav(page).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeHidden();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(compassNav(page).getByRole("link", { name: "Projects", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("compass menu: Escape and the close button close it; arrow keys move the needle", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  const dialog = page.getByRole("dialog", { name: "Site navigation" });
  const aim = page.getByTestId("compass-aim");

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  // Opens aimed at (and focused on) the current page.
  await expect(aim).toHaveText("Home");
  await expect(compassNav(page).getByRole("link", { name: "Home", exact: true })).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(aim).toHaveText(sections[1].label);
  await expect(compassNav(page).getByRole("link", { name: sections[1].label, exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(aim).toHaveText(sections[sections.length - 1].label);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(dialog).toBeHidden();
});

test("footer links reach every page", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const footerNav = page.getByRole("navigation", { name: "Pages" });
  for (const section of sections) {
    await page.goto("/about");
    await footerNav.getByRole("link", { name: section.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${section.href === "/" ? "/" : section.href}$`));
  }
});

/* ---------- Behaviour: theme ---------- */

const themeDial = (page: Page) => page.getByRole("button", { name: /^Color theme:/i });

test("theme dial turns Light, Dark, System, and the choice persists", async ({ page }) => {
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const html = page.locator("html");
    const dial = themeDial(page);
    await expect(dial).toHaveAccessibleName(/System\. Switch to Light/i);

    await dial.click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(dial).toHaveAccessibleName(/Light\. Switch to Dark/i);
    await dial.click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(themeDial(page)).toHaveAccessibleName(/Dark\. Switch to System/i);

    await themeDial(page).click();
    await expect(html).not.toHaveAttribute("data-theme", /.*/);
    await expect(themeDial(page)).toHaveAccessibleName(/System\. Switch to Light/i);
  }
});

test("a first-time visitor gets the System theme, following their OS", async ({ page }) => {
  // Fresh context: nothing in localStorage, like a brand-new visitor.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
  await expect(themeDial(page)).toHaveAccessibleName(/^Color theme: System/i);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
});

test("with full motion: the theme reveal runs without errors and lands on the right theme", async ({ page }) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "dark" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await themeDial(page).click();
  await page.waitForTimeout(800); // circle reveal + dial spring
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await themeDial(page).click();
  await page.waitForTimeout(800);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors, "console errors").toEqual([]);
});

/* ---------- Behaviour: career timeline ---------- */

test("chart plots every timeline item and lists them all in the table", async ({ page }) => {
  await page.goto("/");
  const markers = chartPlot(page).locator("[data-kind]");
  await expect(markers).toHaveCount(timeline.length);
  await expect(chartPlot(page).locator('[data-kind="project"]')).toHaveCount(
    timeline.filter((p) => p.kind === "project").length,
  );

  await page.getByText(/^Show as table$/i).click();
  await expect(chartFigure(page).locator("table tbody tr")).toHaveCount(timeline.length);
});

test("chart selection works with keyboard and pointer", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const newest = timeline[timeline.length - 1];
  const oldest = timeline[0];

  // Starts on the newest item.
  await expect(chartReadout(page)).toContainText(newest.label);

  await chartPlot(page).focus();
  await page.keyboard.press("Home");
  await expect(chartReadout(page)).toContainText(oldest.label);
  await page.keyboard.press("ArrowRight");
  await expect(chartReadout(page)).toContainText(timeline[1].label);
  await page.keyboard.press("End");
  await expect(chartReadout(page)).toContainText(newest.label);

  // Clicking near the left edge of the plot selects the oldest item.
  const box = (await chartPlot(page).boundingBox())!;
  await page.mouse.click(box.x + 2, box.y + box.height - 2);
  await expect(chartReadout(page)).toContainText(oldest.label);
});

test("chart fits a 320px phone without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const figure = (await chartFigure(page).boundingBox())!;
  expect(figure.x).toBeGreaterThanOrEqual(0);
  expect(figure.x + figure.width).toBeLessThanOrEqual(320);
});

/* ---------- Behaviour: technologies ↔ projects ---------- */

test("every project tool is a listed technology", async () => {
  const { projects } = await import("../../src/content/projects");
  const { skillGroups } = await import("../../src/content/skills");
  const skills = new Set(skillGroups.flatMap((group) => group.skills));
  const unknown = projects.flatMap((project) =>
    project.stack.filter((tool) => !skills.has(tool)).map((tool) => `${project.name}: ${tool}`),
  );
  expect(unknown, "stack names must match skills.ts exactly").toEqual([]);
});

test("every technology shows an icon, and every logo loads", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/technologies");
  await page.waitForLoadState("networkidle");
  const { skillGroups } = await import("../../src/content/skills");
  const total = skillGroups.flatMap((group) => group.skills).length;

  const chips = page.locator('main li[id^="tech-"]');
  await expect(chips).toHaveCount(total);
  for (const chip of await chips.all()) {
    await expect(chip.locator("[data-tech-icon]").first()).toBeAttached();
  }
  // Only skills deliberately without a devicon logo use a fallback glyph.
  const fallbacks = await chips
    .filter({ has: page.locator('[data-tech-icon="fallback"]') })
    .allInnerTexts();
  // Button chips also contain a project count, so compare only the name (first line).
  expect(fallbacks.map((t) => t.split("\n")[0].trim()).sort()).toEqual(["SQL", "Turso (libSQL)"]);

  const broken = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>("img[data-tech-icon]")]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.src),
  );
  expect(broken, "logos that failed to load").toEqual([]);
});

test("selecting a technology lists the projects that use it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/technologies");
  await page.waitForLoadState("networkidle");
  const typescript = page.getByRole("button", { name: /^TypeScript/ });
  const panel = page.getByRole("complementary", { name: "Projects using the selected technology" }).getByTestId("skill-usage");

  await expect(panel).toContainText("Pick a technology");
  await typescript.click();
  await expect(typescript).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/#tech-typescript$/);
  await expect(panel).toContainText(/Used in 4 projects/i);
  for (const name of ["Flood Forecast", "GADvance", "Statera", "Untold Diaries"]) {
    await expect(panel.getByRole("link", { name })).toBeVisible();
  }

  await panel.getByRole("link", { name: "GADvance" }).click();
  await expect(page).toHaveURL(/\/projects#gadvance$/);

  // Clicking the selected technology again clears the selection.
  await page.goto("/technologies#tech-typescript");
  await page.waitForLoadState("networkidle");
  await expect(typescript).toHaveAttribute("aria-pressed", "true");
  await typescript.click();
  await expect(typescript).toHaveAttribute("aria-pressed", "false");
  await expect(panel).toContainText("Pick a technology");
});

test("every technology has a one-sentence description", async () => {
  const { skillGroups, techDescriptions } = await import("../../src/content/skills");
  const missing = skillGroups.flatMap((group) => group.skills).filter((name) => !techDescriptions[name]?.trim());
  expect(missing, "technologies without a description").toEqual([]);
});

test("selecting a technology shows what it is, even when no project uses it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/technologies");
  await page.waitForLoadState("networkidle");
  const { techDescriptions } = await import("../../src/content/skills");
  const panel = page.getByRole("complementary", { name: "Projects using the selected technology" }).getByTestId("skill-usage");
  await page.getByRole("button", { name: "Java", exact: true }).click();
  await expect(panel).toContainText(techDescriptions.Java);
  await expect(panel).toContainText("Not in a listed project yet.");
  await page.getByRole("button", { name: /^Python/ }).click();
  await expect(panel).toContainText(techDescriptions.Python);
  await expect(panel.getByRole("link", { name: "Flood Forecast" })).toBeVisible();
});

test("a project's tool chip opens the Technologies page with it selected", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects");
  await page.locator("#flood-forecast").getByRole("link", { name: "Python", exact: true }).click();
  await expect(page).toHaveURL(/\/technologies#tech-python$/);
  await expect(page.getByRole("button", { name: /^Python/ })).toHaveAttribute("aria-pressed", "true");
});

test("on a phone, the usage panel opens under the selected technology's group", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/technologies");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /^MySQL/ }).click();
  const group = page.locator("section", { has: page.getByRole("heading", { name: "Backend and databases" }) });
  await expect(group.getByTestId("skill-usage")).toBeVisible();
  await expect(group.getByTestId("skill-usage")).toContainText(/Used in 2 projects/i);
});

/* ---------- Behaviour: motion, hero, GitHub ---------- */

test("home shows the wave background (animated or static) behind readable text", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const layer = page.locator('[data-bg="waves"]');
  await expect(layer).toHaveCSS("position", "fixed");
  await expect(layer).toHaveCSS("pointer-events", "none");
  // Tests run with reduced motion, so only the static lines show (no 3D download).
  await expect(layer.locator('[data-bg-fallback="waves"] path')).toHaveCount(6);
  await expect(layer.locator("canvas")).toHaveCount(0);
  await expect(page.locator("#home").getByRole("heading", { level: 1 })).toHaveText("Neil Patrick Pajadan");
  const axe = await new AxeBuilder({ page }).include("#home").withTags(["wcag2aa"]).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test("other pages have no 3D background", async ({ page }) => {
  for (const path of ["/about", "/projects"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-bg]")).toHaveCount(0);
  }
});

test("GitHub section shows live stats or the documented fallback", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#github");
  // The heading is visually hidden but still names the section for screen readers.
  await expect(section.getByRole("heading", { name: /^GitHub activity$/i })).toBeAttached();
  const heatmap = section.getByTestId("heatmap");
  if ((await heatmap.count()) > 0) {
    // Token configured: full calendar (52-53 weeks) and streaks.
    expect(await heatmap.locator("[data-day]").count()).toBeGreaterThanOrEqual(364);
    await expect(section.getByText(/^Current streak$/i)).toBeVisible();
    await expect(section.getByText(/^Longest streak$/i)).toBeVisible();

    // Year buttons swap the calendar; exactly one is pressed.
    const years = section.getByRole("group", { name: "Calendar year" }).getByRole("button");
    if ((await years.count()) > 1) {
      const second = years.nth(1);
      const year = (await second.innerText()).trim();
      await second.click();
      await expect(second).toHaveAttribute("aria-pressed", "true");
      await expect(section.locator("#heatmap-caption")).toContainText(`in ${year}`);
      await expect(section.locator('[aria-pressed="true"]')).toHaveCount(1);
      expect(await heatmap.locator(`[data-day^="${year}-"]`).count()).toBeGreaterThan(0);
    }
  } else {
    // No token: public stats, or an explicit "unavailable" message if GitHub is unreachable.
    await expect(
      section.getByText(/Public repositories|GitHub stats are unavailable/).first(),
    ).toBeVisible();
  }
});

test("with full motion: home animates, scrolls, and hovers without errors", async ({ page }) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500); // hero entrance + wave scene start
  await expect(page.locator('[data-bg-canvas="waves"], [data-bg-fallback="waves"]').first()).toBeAttached();

  // Scroll the whole page so every reveal, counter, and heatmap runs.
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(800);
  const card = page.locator("#projects a").first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(300);

  // Everything revealed by now is fully visible.
  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 0.99,
      ).length,
  );
  expect(hidden, "elements still hidden after scrolling").toBe(0);
  // The career timeline's wipe finished (its line and markers are uncovered).
  const chartClip = await chartFigure(page)
    .locator("[data-reveal]")
    .first()
    .evaluate((el) => getComputedStyle(el).clipPath);
  expect(chartClip, "career timeline revealed").not.toContain("100%");
  // The compass menu plays its open and close animations without errors.
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.waitForTimeout(900);
  await page.mouse.move(900, 300);
  await page.waitForTimeout(400);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeHidden();
  expect(errors, "console errors").toEqual([]);
});

test("with full motion: anchor links land below the sticky header", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Jump via an in-page anchor, the way footer/home links use hashes.
  await page.evaluate(() => {
    const link = document.createElement("a");
    link.href = "#technologies";
    link.textContent = "test anchor";
    document.body.append(link);
    link.click();
  });
  await page.waitForTimeout(1600); // Lenis eases to the target
  const top = await page.locator("#technologies").evaluate((el) => el.getBoundingClientRect().top);
  expect(top, "section top sits just below the 64px header").toBeGreaterThanOrEqual(40);
  expect(top).toBeLessThanOrEqual(120);
});

test("depth gauge lists every home section and jumps to the one clicked", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const gauge = page.getByRole("navigation", { name: "On This Page" });
  await expect(gauge).toBeVisible();
  await expect(gauge.getByRole("link")).toHaveCount(sections.length + 2);
  await expect(gauge.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "location");

  await gauge.getByRole("link", { name: "Projects" }).click();
  await expect(gauge.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "location");
  const top = await page.locator("#projects").evaluate((el) => el.getBoundingClientRect().top);
  expect(top, "section top sits just below the header").toBeGreaterThanOrEqual(40);
  expect(top).toBeLessThanOrEqual(120);

  // Every tick points at a section that exists.
  for (const href of await gauge.getByRole("link").evaluateAll((links) => links.map((a) => a.getAttribute("href")))) {
    await expect(page.locator(href!)).toHaveCount(1);
  }
});

test("depth gauge is hidden on phones and absent on other pages", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "On This Page" })).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects");
  await expect(page.getByRole("navigation", { name: "On This Page" })).toHaveCount(0);
});

test("links to other sites open in a new tab, safely; email links don't", async ({ page }) => {
  for (const path of ["/", "/about", "/credentials", "/technologies", "/projects", "/contact"]) {
    await page.goto(path);
    const external = page.locator('a[href^="http"]');
    expect(await external.count(), `${path} has outside links`).toBeGreaterThan(0);
    for (const link of await external.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
    for (const link of await page.locator('a[href^="mailto:"]').all()) {
      await expect(link).not.toHaveAttribute("target", "_blank");
    }
  }
});
