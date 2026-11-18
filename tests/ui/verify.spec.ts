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
const chartFigure = (page: Page) => page.getByRole("figure", { name: /^Career timeline/ });

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

// Mobile menu open, both schemes.
for (const scheme of SCHEMES) {
  test(`layout mobile menu open 320px ${scheme}`, async ({ page }) => {
    const errors = collectErrors(page);
    await openPage(page, "/", 320, scheme);
    await page.getByRole("button", { name: "Menu" }).click();
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

test("desktop header links every page and marks the current one", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  for (const section of pages) {
    await expect(nav.getByRole("link", { name: section.label, exact: true })).toBeVisible();
  }
  await nav.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(nav.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("mobile menu opens, closes with Escape, and closes on link click", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu" });
  const link = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" });

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(link).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();

  await toggle.click();
  await link.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/\/contact$/);
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

test("theme switcher sets, persists, and clears the theme", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const html = page.locator("html");
  const switcher = page.getByRole("group", { name: "Color theme" });
  // Click the visible option (label with icon) like a user; the radio itself is visually hidden.
  const option = (name: string) => switcher.getByTitle(name);
  const radio = (name: string) => switcher.getByRole("radio", { name });

  await option("Dark").click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(radio("Dark")).toBeChecked();

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(radio("Dark")).toBeChecked();

  await option("System").click();
  await expect(html).not.toHaveAttribute("data-theme", /.*/);
  await expect(radio("System")).toBeChecked();
});

test("a first-time visitor gets the System theme, following their OS", async ({ page }) => {
  // Fresh context: nothing in localStorage, like a brand-new visitor.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
  await expect(
    page.getByRole("group", { name: "Color theme" }).getByRole("radio", { name: "System" }),
  ).toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
});

/* ---------- Behaviour: learning chart ---------- */

test("chart plots every timeline item and lists them all in the table", async ({ page }) => {
  await page.goto("/");
  const markers = chartPlot(page).locator("[data-kind]");
  await expect(markers).toHaveCount(timeline.length);
  await expect(chartPlot(page).locator('[data-kind="project"]')).toHaveCount(
    timeline.filter((p) => p.kind === "project").length,
  );

  await page.getByText("Show as table").click();
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

test("every project tool is a listed technology or a known service", async () => {
  const { projects } = await import("../../src/content/projects");
  const { skillGroups } = await import("../../src/content/skills");
  const skills = new Set(skillGroups.flatMap((group) => group.skills));
  const services = new Set(["OpenRouter", "Spotify Web API", "Cloudflare Turnstile"]);
  const unknown = projects.flatMap((project) =>
    project.stack.filter((tool) => !skills.has(tool) && !services.has(tool)).map((tool) => `${project.name}: ${tool}`),
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
  // Only skills deliberately without a devicon logo use the fallback glyph.
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

  await expect(panel).toContainText("Pick a highlighted technology");
  await typescript.click();
  await expect(typescript).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/#tech-typescript$/);
  await expect(panel).toContainText("Used in 3 projects");
  for (const name of ["Flood Forecast", "GADvance", "Untold Diaries"]) {
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
  await expect(panel).toContainText("Pick a highlighted technology");
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
  await expect(group.getByTestId("skill-usage")).toContainText("Used in 2 projects");
});

/* ---------- Behaviour: motion, hero, GitHub ---------- */

test("hero shows the network (3D canvas or static fallback) behind readable text", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const hero = page.locator("#home");
  await expect(hero.locator("[data-hero-canvas], [data-hero-fallback]").first()).toBeAttached();
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Neil Patrick Pajadan");
  const axe = await new AxeBuilder({ page }).include("#home").withTags(["wcag2aa"]).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test("GitHub section shows live stats or the documented fallback", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#github");
  await expect(section.getByRole("heading", { name: "GitHub activity" })).toBeVisible();
  const heatmap = section.getByTestId("heatmap");
  if ((await heatmap.count()) > 0) {
    // Token configured: full calendar (52-53 weeks) and activity counters.
    expect(await heatmap.locator("[data-day]").count()).toBeGreaterThanOrEqual(364);
    await expect(section.getByText("Contributions in the last year", { exact: true })).toBeVisible();
    await expect(section.getByText("Current streak", { exact: true })).toBeVisible();
    await expect(section.getByText("Longest streak", { exact: true })).toBeVisible();

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
  await page.waitForTimeout(1500); // hero entrance + 3D scene start

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

test("links to other sites open in a new tab, safely", async ({ page }) => {
  for (const path of ["/projects", "/credentials"]) {
    await page.goto(path);
    const external = page.locator('main a[href^="http"]');
    expect(await external.count(), `${path} has outside links`).toBeGreaterThan(0);
    for (const link of await external.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  }
});
