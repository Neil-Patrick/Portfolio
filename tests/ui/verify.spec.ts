import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { homeIndex, sections, site } from "../../src/content/site";
import { INTRO_SEEN_KEY } from "../../src/lib/intro";
import { bearing } from "../../src/components/nav/compass-geometry";
import { existsSync } from "node:fs";
import { buildTimeline } from "../../src/lib/timeline";

const WIDTHS = [320, 768, 1024, 1440];
const SCHEMES = ["dark"] as const;
const SCREENSHOT_DIR = "test-results/screenshots";
const pages = sections.filter((s) => s.href !== "/");
/** Section pages the home page links to with an arrow (Credentials has no home section). */
const homePages = pages.filter((s) => homeIndex.some((item) => item.id === s.id));
const timeline = buildTimeline();

// Ordinary tests skip the home loading screen with a test-only mark (the site
// never sets it). Its own tests open fresh pages without this mark.
test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    try {
      window.sessionStorage.setItem(key, "1");
    } catch {}
  }, INTRO_SEEN_KEY);
});

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

test("home shows exactly the sections in homeIndex, in that order", async ({ page }) => {
  await page.goto("/");
  for (const item of homeIndex) {
    await expect(page.locator(`#${item.id}`), `#${item.id}`).toHaveCount(1);
  }
  const order = await page.evaluate(
    (ids) => ids.map((id) => document.getElementById(id)!.getBoundingClientRect().top + window.scrollY),
    homeIndex.map((item) => item.id),
  );
  expect(order, "sections appear top to bottom in homeIndex order").toEqual([...order].sort((a, b) => a - b));
  // These have their own pages only (the career timeline plots every certification).
  for (const id of ["credentials", "about", "technologies"]) {
    await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(0);
  }
});

test("each home preview links to its page", async ({ page }) => {
  for (const section of homePages) {
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
  // The HUD readout also shows the aimed page's subtitle.
  await expect(page.getByTestId("compass-aim-detail")).toHaveText(sections[1].tab);
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

/* ---------- Dark only ---------- */

test("the site is dark only: no theme control, dark color scheme, tinted (not pure black) canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe("rgb(0, 0, 0)");
});

/* ---------- Behaviour: career timeline (About page) ---------- */

test("chart plots every timeline item and lists them all in the table", async ({ page }) => {
  await page.goto("/about#career-timeline");
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
  await page.goto("/about#career-timeline");
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
  await page.goto("/about#career-timeline");
  const figure =(await chartFigure(page).boundingBox())!;
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
  await expect(panel).toContainText(/Used in 3 projects/i);
  for (const name of ["GADvance", "Statera", "Untold Diaries"]) {
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
  // Python is a skill with no listed project now; Laravel is used by GADvance.
  await page.getByRole("button", { name: /^Python/ }).click();
  await expect(panel).toContainText(techDescriptions.Python);
  await expect(panel).toContainText("Not in a listed project yet.");
  await page.getByRole("button", { name: /^Laravel/ }).click();
  await expect(panel).toContainText(techDescriptions.Laravel);
  await expect(panel.getByRole("link", { name: "GADvance" })).toBeVisible();
});

test("a project's tool chip opens the Technologies page with it selected", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects");
  await page.locator("#gadvance").getByRole("link", { name: "Laravel", exact: true }).click();
  await expect(page).toHaveURL(/\/technologies#tech-laravel$/);
  await expect(page.getByRole("button", { name: /^Laravel/ })).toHaveAttribute("aria-pressed", "true");
});

test("each project shows a labeled screenshot placeholder until photos are added, and Flood Forecast is gone", async ({ page }) => {
  const { projects } = await import("../../src/content/projects");
  expect(projects.map((p) => p.id)).not.toContain("flood-forecast");
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/projects");
  for (const project of projects) {
    const card = page.locator(`#${project.id}`);
    if (project.images?.length) {
      await expect(card.getByRole("img", { name: project.images[0].alt })).toBeVisible();
    } else {
      await expect(card.getByRole("img", { name: `Screenshot placeholder for ${project.name}` })).toBeVisible();
    }
  }
  await expect(page.getByText(/flood/i)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test("on a phone, the usage panel opens under the selected technology's group", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/technologies");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /^MySQL/ }).click();
  const group = page.locator("section", { has: page.getByRole("heading", { name: "Backend and databases" }) });
  await expect(group.getByTestId("skill-usage")).toBeVisible();
  await expect(group.getByTestId("skill-usage")).toContainText(/Used in 1 project(?!s)/i);
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

test("every page has the signal-line background: full on Home, calm on the section pages", async ({ page }) => {
  for (const [path, intensity, lines] of [["/about", "calm", 4], ["/projects", "calm", 4], ["/", "full", 6]] as const) {
    await page.goto(path);
    const layer = page.locator('[data-bg="waves"]');
    await expect(layer).toHaveAttribute("data-intensity", intensity);
    await expect(layer).toHaveCSS("position", "fixed");
    await expect(layer.locator('[data-bg-fallback="waves"] path')).toHaveCount(lines);
  }
});

test("GitHub section (About page) shows live stats or the documented fallback", async ({ page }) => {
  await page.goto("/about#github");
  const section = page.getByRole("tabpanel", { name: "GitHub Activity" });
  await expect(section.getByRole("heading", { name: /^GitHub activity$/i })).toBeVisible();
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
  // Projects is long enough to bring its second project all the way up under the header.
  await page.goto("/projects");
  await page.waitForLoadState("networkidle");
  // Jump via an in-page anchor, the way footer/home links use hashes.
  await page.evaluate(() => {
    const link = document.createElement("a");
    link.href = "#statera";
    link.textContent = "test anchor";
    document.body.append(link);
    link.click();
  });
  await page.waitForTimeout(1600); // Lenis eases to the target
  const top = await page.locator("#statera").evaluate((el) => el.getBoundingClientRect().top);
  expect(top, "section top sits just below the 64px header").toBeGreaterThanOrEqual(40);
  expect(top).toBeLessThanOrEqual(120);
});

test("depth gauge lists every home section and jumps to the one clicked", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const gauge = page.getByRole("navigation", { name: "On This Page" });
  await expect(gauge).toBeVisible();
  await expect(gauge.getByRole("link")).toHaveCount(homeIndex.length);
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

/* ---------- Behaviour: HUD section pages ---------- */

test("credential carousel: every node shows its details and Credly link, opening safely in a new tab", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/credentials");
  await page.waitForLoadState("networkidle"); // clicks need the carousel to be interactive
  const { certifications, featuredCertification } = await import("../../src/content/credentials");
  const all = [featuredCertification, ...certifications].sort((a, b) => a.date.localeCompare(b.date));
  const tabs = page.getByRole("tablist", { name: "Credentials, oldest to newest" }).getByRole("tab");
  const detail = page.getByRole("tabpanel");
  await expect(tabs).toHaveCount(all.length);
  // Oldest first, the newest selected on arrival.
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await expect(detail.getByRole("heading", { level: 2 })).toHaveText(all.at(-1)!.name);
  for (const [i, cert] of all.entries()) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    await expect(detail.getByRole("heading", { level: 2 })).toHaveText(cert.name);
    const link = detail.getByRole("link", { name: /Verify on Credly/ });
    await expect(link).toHaveAttribute("href", cert.url!);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
});

test("credentials browse: the field chips under the carousel list rows, All grouped by field, and the hash selects one", async ({ page }) => {
  const { certifications, featuredCertification, credentialCategories } = await import("../../src/content/credentials");
  const all = [featuredCertification, ...certifications];
  await page.goto("/credentials");
  const filters = page.getByRole("navigation", { name: "Filter credentials" });
  const browse = page.getByRole("region", { name: "Browse by Field" });
  const rows = browse.locator("li.hud-row");
  const tabs = page.getByRole("tablist", { name: "Credentials, oldest to newest" }).getByRole("tab");
  const button = (label: string) => filters.getByRole("button", { name: new RegExp(`^${label} \\(`) });

  // The chips sit below the carousel.
  const carouselBottom = await page.locator("[data-credential-path]").evaluate((el) => el.getBoundingClientRect().bottom);
  expect(await filters.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThan(carouselBottom);

  // All by default: every field is a group, every credential a row with its Credly link.
  await expect(button("All")).toHaveAttribute("aria-pressed", "true");
  await expect(browse.locator("[data-category]")).toHaveCount(credentialCategories.length);
  await expect(rows).toHaveCount(all.length);
  await expect(browse.locator('a[href^="https://www.credly.com/badges/"]')).toHaveCount(all.length);

  for (const category of credentialCategories) {
    const expected = all.filter((cert) => cert.category === category.id);
    await button(category.label).click();
    await expect(button(category.label)).toHaveAttribute("aria-pressed", "true");
    await expect(button("All")).toHaveAttribute("aria-pressed", "false");
    await expect(page).toHaveURL(new RegExp(`#${category.id}$`));
    await expect(browse.locator("[data-category]")).toHaveCount(1);
    await expect(rows).toHaveCount(expected.length);
    for (const cert of expected) await expect(rows.filter({ hasText: cert.name })).toHaveCount(1);
    await expect(page.getByText(`Showing ${expected.length} of ${all.length} credentials`)).toBeAttached();
    // The carousel always keeps every credential; nothing in it is dimmed or disabled.
    await expect(tabs).toHaveCount(all.length);
    await expect(page.locator('[role="tab"][disabled]')).toHaveCount(0);
  }

  await button("All").click();
  await expect(rows).toHaveCount(all.length);
  // Back returns to the previous field.
  await page.goBack();
  await expect(button(credentialCategories.at(-1)!.label)).toHaveAttribute("aria-pressed", "true");

  // A link straight to a field preselects it; picking a row selects it in the carousel.
  await page.goto("/credentials#design-and-ux");
  await expect(button("Design and UX")).toHaveAttribute("aria-pressed", "true");
  const first = all.filter((cert) => cert.category === "design-and-ux").sort((a, b) => b.date.localeCompare(a.date))[0];
  await rows.first().getByRole("button").click();
  await expect(page.getByRole("tabpanel").getByRole("heading", { level: 2 })).toHaveText(first.name);
});

test("Education lives on the About page, not Credentials", async ({ page }) => {
  const { education } = await import("../../src/content/credentials");
  await page.goto("/about");
  // Education is the console's first tab, open by default.
  const section = page.getByRole("tabpanel", { name: "Education" });
  for (const entry of education) await expect(section.getByText(entry.program)).toBeVisible();
  await page.goto("/credentials");
  await expect(page.getByRole("heading", { name: "Education" })).toHaveCount(0);
});

test("Spotify player: its own block below the About panel; track index rows load songs; hidden when there's nothing", async ({ page, request }) => {
  // Several reloads (on air, idle, long title, empty): give it the slow-test budget.
  test.slow();
  // The real route always answers with a valid shape (empty without keys).
  const live = await (await request.get("/api/now-playing")).json();
  expect(live).toHaveProperty("now");
  expect(Array.isArray(live.recent)).toBe(true);
  expect(live.recent.length).toBeLessThanOrEqual(5);

  // Mocked, so the test doesn't depend on what Neil is listening to.
  const track = (n: number) => ({ title: `Song ${n}`, artist: `Artist ${n}`, url: `https://open.spotify.com/track/abc${n}` });
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
  const recent = [5, 130, 60 * 30, 60 * 50, 60 * 80].map((m, i) => ({ ...track(i + 1), playedAt: minutesAgo(m) }));
  await page.route("**/api/now-playing", (route) => route.fulfill({ json: { now: track(0), recent } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  const spotify = page.getByRole("region", { name: "Spotify" });
  await expect(spotify).toBeVisible();

  // Outside the About panel, between it and the footer.
  await expect(page.locator("article").getByRole("region", { name: "Spotify" })).toHaveCount(0);
  const articleBottom = await page.locator("article").first().evaluate((el) => el.getBoundingClientRect().bottom);
  const box = (locator: ReturnType<typeof page.locator>) => locator.evaluate((el) => el.getBoundingClientRect().toJSON());
  const spotifyBox = await box(spotify);
  expect(spotifyBox.top).toBeGreaterThanOrEqual(articleBottom);
  expect((await box(page.locator("footer"))).top).toBeGreaterThan(spotifyBox.top);
  // Wide screens: song info on the left, the preview panel right next to it (no wide gap), no transport buttons.
  const info = await box(spotify.locator("[data-info]"));
  const slot = await box(spotify.locator("[data-preview-slot]"));
  expect(slot.left).toBeGreaterThan(info.right);
  expect(slot.left - info.right).toBeLessThanOrEqual(40);
  await expect(spotify.getByRole("group", { name: "Deck controls" })).toHaveCount(0);

  // Attribution: the official logo names the block (70px or wider), and "Open Spotify" links back.
  await expect(spotify.getByRole("heading", { name: "Spotify" }).locator("svg[data-spotify-logo]")).toBeVisible();
  expect((await spotify.locator("svg[data-spotify-logo]").boundingBox())!.width).toBeGreaterThanOrEqual(70);
  await expect(spotify.getByRole("link", { name: /^Open Spotify/ })).toHaveAttribute("href", "https://open.spotify.com");

  // On air: lamp and signal bars; the song playing is loaded.
  await expect(spotify.locator("[data-on-air]")).toHaveText(/On Air/);
  await expect(spotify.locator("[data-on-air] .eq-bar")).toHaveCount(4);
  const loaded = spotify.locator("[data-loaded]");
  await expect(loaded).toHaveAttribute("href", track(0).url);
  const rows = spotify.getByRole("listitem").getByRole("button");
  await expect(rows).toHaveCount(6);
  await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
  // Rows are labelled S1-S5 after the live one; the header has no tape counter.
  await expect(rows.nth(1)).toContainText("S1");
  await expect(rows.nth(5)).toContainText("S5");
  await expect(spotify.locator("[data-on-air]").locator("xpath=..").getByText(/^\d{4}$/)).toHaveCount(0);

  // A track index row cues its song.
  await rows.nth(3).click();
  await expect(rows.nth(3)).toHaveAttribute("aria-pressed", "true");
  await expect(loaded).toHaveAttribute("href", recent[2].url);
  // And back to the song playing now.
  await rows.first().click();
  await expect(loaded).toHaveAttribute("href", track(0).url);

  // Album art never animates (Spotify's rules): no animation on it or around it from the deck's effects.
  for (const img of await spotify.locator("[data-spotify-art]").all()) {
    expect(await img.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  }

  // Nothing playing: Off Air, no bars, the latest song loaded, five rows.
  await page.unroute("**/api/now-playing");
  await page.route("**/api/now-playing", (route) => route.fulfill({ json: { now: null, recent } }));
  await page.reload();
  await expect(spotify.locator("[data-on-air]")).toHaveText(/Off Air/);
  await expect(spotify.locator("[data-on-air] .eq-bar")).toHaveCount(0);
  await expect(rows).toHaveCount(5);
  await expect(loaded).toHaveAttribute("href", recent[0].url);

  // A long title playing doesn't make a phone screen scroll sideways.
  const long = { ...track(9), title: "Magkunwari ('Di Man Tayo) (TODA One I Love Official Soundtrack)" };
  await page.unroute("**/api/now-playing");
  await page.route("**/api/now-playing", (route) => route.fulfill({ json: { now: long, recent } }));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.reload();
  await expect(loaded).toContainText("Magkunwari");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 1440, height: 900 });

  // Not set up: no block at all.
  await page.unroute("**/api/now-playing");
  await page.route("**/api/now-playing", (route) => route.fulfill({ json: { now: null, recent: [] } }));
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("region", { name: "Spotify" })).toHaveCount(0);
});

test("Spotify preview: Spotify's player loads only after Preview, in a fixed slot that moves nothing, and Close removes it", async ({ page }) => {
  const track = (n: number) => ({ title: `Song ${n}`, artist: `Artist ${n}`, url: `https://open.spotify.com/track/abc${n}` });
  const recent = [1, 2].map((n) => ({ ...track(n), playedAt: new Date(Date.now() - n * 600_000).toISOString() }));
  await page.route("**/api/now-playing", (route) => route.fulfill({ json: { now: track(0), recent } }));
  // Keep the test offline: the embed gets an empty page instead of Spotify's player.
  let embedRequests = 0;
  await page.route("https://open.spotify.com/embed/**", (route) => {
    embedRequests++;
    return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>embed</title>" });
  });
  await page.goto("/about");
  const spotify = page.getByRole("region", { name: "Spotify" });
  await expect(spotify).toBeVisible();
  const frame = spotify.locator("iframe");
  await expect(frame).toHaveCount(0);
  expect(embedRequests).toBe(0);

  // Opening and closing the preview moves nothing: same track index position, same info height.
  const layout = () =>
    page.evaluate(() => ({
      // Relative to the block, so scrolling doesn't count.
      index:
        document.querySelector("[data-spotify] ol")!.getBoundingClientRect().top -
        document.querySelector("[data-spotify]")!.getBoundingClientRect().top,
      info: document.querySelector("[data-info]")!.getBoundingClientRect().height,
    }));
  const before = await layout();

  // The Preview button, in the slot.
  await spotify.getByRole("button", { name: /^Preview on Spotify/ }).click();
  await expect(frame).toHaveAttribute("height", "152");
  expect(await layout()).toEqual(before);
  await expect(frame).toHaveAttribute("src", /^https:\/\/open\.spotify\.com\/embed\/track\/abc0\b/);
  await expect(frame).toHaveAttribute("title", "Spotify preview: Song 0 by Artist 0");
  await spotify.getByRole("button", { name: "Close Preview" }).click();
  await expect(frame).toHaveCount(0);
  expect(await layout()).toEqual(before);

  // Same on a phone, where everything stacks.
  await page.setViewportSize({ width: 375, height: 800 });
  const phoneBefore = await layout();
  await spotify.getByRole("button", { name: /^Preview on Spotify/ }).click();
  await expect(frame).toBeVisible();
  expect(await layout()).toEqual(phoneBefore);
  await spotify.getByRole("button", { name: "Close Preview" }).click();
  await expect(frame).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 800 });

  // After loading another song from the track index, the preview follows it.
  const rows = spotify.getByRole("listitem").getByRole("button");
  await rows.nth(1).click();
  await spotify.getByRole("button", { name: /^Preview on Spotify/ }).click();
  await expect(frame).toHaveAttribute("src", /\/embed\/track\/abc1\b/);
  // Loading another song closes the player.
  await rows.nth(2).click();
  await expect(frame).toHaveCount(0);
});

test("About console: tabs switch by click and arrow keys, follow the hash, and hide the other panels", async ({ page }) => {
  await page.goto("/about");
  const tablist = page.getByRole("tablist", { name: "About sections" });
  const tab = (name: string) => tablist.getByRole("tab", { name });
  const panel = (name: string) => page.getByRole("tabpanel", { name });

  // Education first; one visible panel at a time.
  await expect(tab("Education")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveCount(1);

  await tab("GitHub Activity").click();
  await expect(tab("GitHub Activity")).toHaveAttribute("aria-selected", "true");
  await expect(panel("GitHub Activity")).toBeVisible();
  await expect(panel("Education")).toBeHidden();
  await expect(page).toHaveURL(/#github$/);

  // Arrow keys move and select (wrapping); only the active tab is tabbable.
  await page.keyboard.press("ArrowRight");
  await expect(tab("Education")).toBeFocused();
  await expect(tab("Education")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tab("Career Timeline")).toHaveAttribute("aria-selected", "true");
  await expect(chartFigure(page)).toBeVisible();
  await expect(tablist.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press("End");
  await expect(tab("GitHub Activity")).toHaveAttribute("aria-selected", "true");

  // Back returns to the previous tab; a direct link opens its tab.
  await page.goBack();
  await expect(tab("Career Timeline")).toHaveAttribute("aria-selected", "true");
  await page.goto("/about#github");
  await expect(panel("GitHub Activity")).toBeVisible();
});

/* ---------- Behaviour: home landing and "Let's Build" ---------- */

test("landing headline lines fit their column at every width", async ({ page }) => {
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const clipped = await page.locator("[data-landing-line]").evaluateAll((lines) =>
      lines.filter((line) => {
        const column = line.closest("[data-landing-column]")!.getBoundingClientRect();
        const box = line.firstElementChild!.getBoundingClientRect();
        return box.right > column.right + 1;
      }).length,
    );
    expect(clipped, `headline lines wider than their column at ${width}px`).toBe(0);
  }
});

test("Let's Build: Email Me is a plain email link", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#contact").getByRole("link", { name: "Email Me" })).toHaveAttribute(
    "href",
    "mailto:neilpatrick.dev@gmail.com",
  );
});

test("Copy Email copies the address and says so", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const section = page.locator("#contact");
  await section.getByRole("button", { name: "Copy Email" }).click();
  await expect(section.getByRole("button", { name: "Copied" })).toBeVisible();
  await expect(section.getByTestId("copy-status")).toHaveText("Email address copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("neilpatrick.dev@gmail.com");
});

/* ---------- Behaviour: loading screen and 3D welcome ---------- */

/** A page without the "intro seen" mark, so the loading screen may play. */
async function freshPage(context: BrowserContext, reducedMotion: "reduce" | "no-preference") {
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion });
  await page.setViewportSize({ width: 1440, height: 900 });
  return page;
}

const introState = (page: Page) => page.evaluate(() => document.documentElement.dataset.intro ?? null);

test("loading screen: plays on the first home visit with the real counts, preloads, continues on a click, and plays again on a reload", async ({ context }) => {
  const page = await freshPage(context, "no-preference");
  const errors = collectErrors(page);
  // Watch from the first byte: the loader is decided before first paint and lasts about 5s.
  await page.goto("/", { waitUntil: "commit" });
  const overlay = page.locator("[data-intro-overlay]");
  await expect(page.locator("html")).toHaveAttribute("data-intro", "play");
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText(site.name);
  await expect(overlay).toContainText(site.availability);

  // The numbers count up in CSS (drawn by ::after), so check the values they count to.
  const { projects } = await import("../../src/content/projects");
  const { certifications, featuredCertification } = await import("../../src/content/credentials");
  const { skillGroups } = await import("../../src/content/skills");
  const targets = await overlay
    .locator(".boot-count")
    .evaluateAll((counts) => counts.map((count) => (count as HTMLElement).style.getPropertyValue("--to")));
  expect(targets).toEqual([
    "100",
    String(projects.length),
    String([featuredCertification, ...certifications].filter((c) => c.url).length),
    String(skillGroups.flatMap((g) => g.skills).length),
  ]);

  // Meanwhile it preloads the heavy parts, then says so.
  await expect(overlay.locator("[data-intro-assets]")).toHaveText("Ready", { timeout: 6000 });

  // Once the page is interactive (the controller then holds the page still), a click anywhere continues.
  await page.waitForFunction(
    () => document.documentElement.style.overflow === "hidden" || document.documentElement.dataset.intro === "done",
  );
  if ((await introState(page)) === "play") {
    await page.mouse.click(720, 450);
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done", { timeout: 1500 });
  } else {
    test.info().annotations.push({
      type: "note",
      description: "The loader finished before the page was interactive, so skipping wasn't exercised.",
    });
  }
  // Either way it ends, and the page scrolls again.
  await expect(page.locator("html")).toHaveAttribute("data-intro", "done", { timeout: 8000 });
  await expect(overlay).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(900);
  expect(await page.evaluate(() => window.scrollY), "page scrolls after the loader").toBeGreaterThan(100);

  // A refresh plays it again.
  await page.reload({ waitUntil: "commit" });
  await expect(page.locator("html")).toHaveAttribute("data-intro", "play");
  expect(errors, "console errors").toEqual([]);
});

test("loading screen: stays about 5 seconds, clears on its own, then the landing headline decodes into place", async ({ context }) => {
  const page = await freshPage(context, "no-preference");
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.locator("html")).toHaveAttribute("data-intro", "play");
  await page.waitForTimeout(3000);
  expect(await introState(page), "still on screen after 3 seconds").toBe("play");
  await expect(page.locator("html")).toHaveAttribute("data-intro", "done", { timeout: 6000 });
  await expect(page.locator("[data-intro-overlay]")).toBeHidden();
  const firstLine = page.locator("[data-landing-line] span[aria-hidden]").first();
  await expect(firstLine).toHaveText(site.landing.headline[0], { timeout: 3000 });
});

test("loading screen: never shows with reduced motion", async ({ context }) => {
  const page = await freshPage(context, "reduce");
  for (const path of ["/", "/?intro"]) {
    await page.goto(path);
    expect(await introState(page)).toBeNull();
    await expect(page.locator("[data-intro-overlay]")).toBeHidden();
  }
});

/* ---------- Behaviour: hologram card, compass touch, photo, badges ---------- */

/** Rotation of an element's computed transform, rounded, so tilts can be compared. */
const transformOf = (locator: ReturnType<Page["locator"]>) =>
  locator.evaluate((el) => getComputedStyle(el).transform);
/** How far a layer floats in front of the card (the translateZ in its computed matrix). */
const depthOf = (locator: ReturnType<Page["locator"]>) =>
  locator.evaluate((el) => {
    const m = getComputedStyle(el).transform;
    return m.startsWith("matrix3d(") ? Number(m.slice(9, -1).split(",")[14]) : 0;
  });

test("hologram card: holds the page's h1 and a labeled photo placeholder, and stays flat and still with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const card = page.locator("[data-hologram]");
  await expect(card.getByRole("heading", { level: 1 })).toHaveText(site.name);
  await expect(card.getByRole("img", { name: "Photo placeholder" })).toBeVisible();
  await expect(card).toContainText(site.availability);
  const body = card.locator("> div");
  const before = await transformOf(body);
  const box = (await body.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.95, box.y + box.height * 0.1, { steps: 4 });
  await page.waitForTimeout(400);
  expect(await transformOf(body), "no tilt with reduced motion").toBe(before);
  expect(await depthOf(card.locator('[data-layer="status"]')), "no depth with reduced motion").toBe(0);
});

test("hologram card: pops into 3D, tilts toward the cursor and a dragging finger, and a tap folds it flat and back", async ({ page }) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const card = page.locator("[data-hologram]");
  const body = card.locator("> div");
  const status = card.locator('[data-layer="status"]');
  await expect.poll(() => depthOf(status), { message: "layers separate into depth" }).toBeGreaterThan(60);

  const box = (await body.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.95, box.y + box.height * 0.5, { steps: 5 });
  await page.waitForTimeout(600);
  const right = await transformOf(body);
  await page.mouse.move(box.x + box.width * 0.05, box.y + box.height * 0.5, { steps: 5 });
  await page.waitForTimeout(600);
  expect(await transformOf(body), "tilts toward the cursor").not.toBe(right);

  // A finger dragged across it (touch pointer events) tilts it too.
  await page.mouse.move(0, 0);
  const y = box.y + box.height * 0.5;
  await body.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 7, isPrimary: true, clientX: box.x + box.width * 0.5, clientY: y });
  for (const fx of [0.6, 0.75, 0.9, 0.98]) {
    await body.dispatchEvent("pointermove", { pointerType: "touch", pointerId: 7, isPrimary: true, clientX: box.x + box.width * fx, clientY: y });
  }
  await page.waitForTimeout(500);
  const dragged = await transformOf(body);
  await body.dispatchEvent("pointerup", { pointerType: "touch", pointerId: 7, isPrimary: true, clientX: box.x + box.width * 0.98, clientY: y });
  expect(dragged, "a dragging finger tilts it").not.toBe(right);

  // A tap folds it flat, then it pops back out. (Clicked by position: the card never
  // stops swaying, so Playwright's wait-until-still would never end.)
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.3);
  await expect.poll(() => depthOf(status), { message: "folds flat" }).toBeLessThan(30);
  await expect.poll(() => depthOf(status), { message: "pops back out" }).toBeGreaterThan(60);
  expect(errors, "console errors").toEqual([]);
});

test("compass menu: on touch, the needle follows a dragging finger and letting go opens that page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dial = page.locator("[data-compass-dial]");
  await expect(dial).toBeVisible();
  const box = (await dial.boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const r = box.width * 0.3;
  const at = (index: number) => {
    const rad = (bearing(index, sections.length) * Math.PI) / 180;
    return { clientX: cx + Math.sin(rad) * r, clientY: cy - Math.cos(rad) * r };
  };
  const target = sections.findIndex((section) => section.id === "projects");
  const touch = { pointerType: "touch", pointerId: 11, isPrimary: true };

  await dial.dispatchEvent("pointerdown", { ...touch, ...at(0) });
  await dial.dispatchEvent("pointermove", { ...touch, ...at((target + sections.length - 1) % sections.length) });
  await dial.dispatchEvent("pointermove", { ...touch, ...at(target) });
  await expect(page.getByTestId("compass-aim")).toHaveText(sections[target].label);
  await dial.dispatchEvent("pointerup", { ...touch, ...at(target) });
  await expect(page).toHaveURL(new RegExp(`${sections[target].href}$`));
});

test("about page shows a labeled photo placeholder until a photo is set", async ({ page }) => {
  test.skip(site.photo !== null, "a real photo is set");
  await page.goto("/about");
  await expect(page.getByRole("img", { name: "Photo placeholder" })).toBeVisible();
  await expect(page.getByText("Photo Placeholder", { exact: true })).toBeVisible();
});

test("every certification shows its real Credly badge in the details: saved locally, loaded, and named", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/credentials");
  await page.waitForLoadState("networkidle"); // clicks need the carousel to be interactive
  const { badgeImage, certifications, featuredCertification } = await import("../../src/content/credentials");
  const all = [featuredCertification, ...certifications].sort((a, b) => a.date.localeCompare(b.date));
  const tabs = page.getByRole("tablist", { name: "Credentials, oldest to newest" }).getByRole("tab");
  for (const [i, cert] of all.entries()) {
    const src = badgeImage(cert)!;
    expect(existsSync(`public${src}`), `${cert.name}: public${src}`).toBe(true);
    await tabs.nth(i).click();
    const image = page.getByRole("tabpanel").getByRole("img", { name: `${cert.name} badge` });
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { message: `${cert.name} loads` })
      .toBe(true);
  }
});

/* ---------- Behaviour: credential path and GitHub achievements ---------- */

test("credential carousel: chronological circle emblems that loop, no scrollbar or arrows, drag settles on a credential, click or keys center it", async ({ page }) => {
  const { certifications, featuredCertification, formatMonth } = await import("../../src/content/credentials");
  const all = [featuredCertification, ...certifications].sort((a, b) => a.date.localeCompare(b.date));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/credentials");
  const strip = page.locator("[data-credential-path]");
  const tabs = page.getByRole("tablist", { name: "Credentials, oldest to newest" }).getByRole("tab");
  // One real tab per credential, oldest first, each an emblem named for its credential.
  await expect(tabs).toHaveCount(all.length);
  for (const [i, cert] of all.entries()) {
    await expect(tabs.nth(i)).toHaveAccessibleName(`${cert.name}, ${formatMonth(cert.date)}`);
    await expect(tabs.nth(i).locator("[data-emblem]")).toHaveCount(1);
  }
  const x = (i: number) => tabs.nth(i).evaluate((el) => el.getBoundingClientRect().left);
  expect(await x(1)).toBeGreaterThan(await x(0));
  // It loops: copies of the set sit on either side (hidden from assistive tech).
  await expect(strip.locator("[data-emblem]")).toHaveCount(all.length * 3);
  // No visible scrollbar, and no arrow buttons.
  await expect(strip).toHaveCSS("scrollbar-width", "none");
  await expect(page.getByRole("button", { name: /previous credential|next credential/i })).toHaveCount(0);

  const stripCenter = await strip.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return box.left + box.width / 2;
  });
  /** Distance from the strip's center to the nearest copy of credential i. */
  const offCenter = (i: number) =>
    strip.evaluate(
      (el, { i, n, mid }) => {
        const nodes = [...el.querySelectorAll("[role=tablist] > *")];
        return Math.min(
          ...[i, i + n, i + 2 * n].map((g) => {
            const box = nodes[g].getBoundingClientRect();
            return Math.abs(box.left + box.width / 2 - mid);
          }),
        );
      },
      { i, n: all.length, mid: stripCenter },
    );

  // The newest starts selected and centered.
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  expect(await offCenter(all.length - 1)).toBeLessThan(4);

  // Dragging past the newest loops round to the oldest and settles on (and selects) a credential.
  const box = (await strip.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 60);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + box.width / 2 - i * 30, box.y + 60);
  await page.mouse.up();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "false");
  const selectedIndex = Number((await page.getByRole("tab", { selected: true }).getAttribute("id"))!.split("-").at(-1));
  expect(selectedIndex, "wrapped past the newest").toBeLessThan(all.length - 1);
  await expect.poll(() => offCenter(selectedIndex)).toBeLessThan(4);

  // Clicking an emblem selects it and brings it to the center.
  await tabs.nth(5).click({ force: true });
  await expect(tabs.nth(5)).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => offCenter(5)).toBeLessThan(4);
  await expect(page.getByRole("tabpanel").getByRole("heading", { level: 2 })).toHaveText(all[5].name);

  // Keyboard: arrows (wrapping round) and Home/End; only the selected tab is in the tab order.
  await tabs.nth(5).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(6)).toBeFocused();
  await expect(tabs.nth(6)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await expect(tabs.first()).toHaveAttribute("tabindex", "-1");

  // Phones: the same carousel, swiped; the page itself never scrolls sideways.
  await page.setViewportSize({ width: 320, height: 800 });
  await page.reload();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("the GitHub section lists the saved achievements as circle nodes linking to GitHub", async ({ page }) => {
  const { achievements, ACHIEVEMENTS_URL } = await import("../../src/content/achievements");
  await page.goto("/about#github");
  const list = page.getByRole("tabpanel", { name: "GitHub Activity" }).getByRole("region", { name: "Achievements" });
  for (const achievement of achievements) {
    const link = list.getByRole("link", { name: new RegExp(achievement.name) });
    await expect(link).toHaveAttribute("href", ACHIEVEMENTS_URL);
    await expect(link.locator("[data-badge-tile]").getByRole("img", { name: `${achievement.name} achievement badge` })).toBeVisible();
    expect(existsSync(`public${achievement.image}`), achievement.image).toBe(true);
  }
});

/* ---------- Behaviour: back to top, footer ---------- */

test("back-to-top button appears past the middle of the page and returns to the top", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  const button = page.getByRole("button", { name: "Back to Top" });
  // Hidden at the top: invisible, and out of the tab order.
  await expect(button).toHaveCSS("opacity", "0");
  await expect(button).toHaveJSProperty("inert", true);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(button).toHaveCSS("opacity", "1");
  await expect(button).toHaveJSProperty("inert", false);
  await button.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(button).toHaveJSProperty("inert", true);
});

test("footer draws every contact logo in one ink, LinkedIn included", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.locator('[data-tech-icon="color"]')).toHaveCount(0);
  await expect(footer.locator('[data-tech-icon="mono"]')).toHaveCount(3); // LinkedIn (Let's Build), GitHub and LinkedIn (links)
});

/* ---------- Behaviour: contact form ---------- */

/** The form renders only when NEXT_PUBLIC_WEB3FORMS_KEY is set on the server under test. */
async function openContactForm(page: Page) {
  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Send a message" });
  test.skip((await form.count()) === 0, "NEXT_PUBLIC_WEB3FORMS_KEY is not set on this server");
  return form;
}

test("contact form: empty submit shows field errors and sends nothing", async ({ page }) => {
  const form = await openContactForm(page);
  let sent = 0;
  await page.route("https://api.web3forms.com/**", (route) => {
    sent++;
    return route.fulfill({ json: { success: true } });
  });
  await form.getByRole("button", { name: "Send Message" }).click();
  await expect(form.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByLabel("Name")).toBeFocused();
  await expect(form.getByLabel("Email")).toHaveAccessibleDescription(/Enter your email/);
  await expect(form.getByLabel("Message")).toHaveAccessibleDescription(/Write a message/);

  await form.getByLabel("Email").fill("not-an-email");
  await form.getByRole("button", { name: "Send Message" }).click();
  await expect(form.getByLabel("Email")).toHaveAccessibleDescription(/name@example\.com/);
  expect(sent).toBe(0);
});

test("contact form: a valid message posts to Web3Forms, confirms, and resets", async ({ page }) => {
  const form = await openContactForm(page);
  let payload: Record<string, unknown> = {};
  await page.route("https://api.web3forms.com/submit", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ json: { success: true, message: "Email sent successfully!" } });
  });
  await form.getByLabel("Name").fill("  Test Visitor ");
  await form.getByLabel("Email").fill("visitor@example.com");
  await form.getByLabel("Message").fill("Hello Neil, I'd like to talk about an internship.");
  await form.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByTestId("contact-status")).toContainText("Message sent");
  expect(payload).toMatchObject({
    name: "Test Visitor",
    email: "visitor@example.com",
    message: "Hello Neil, I'd like to talk about an internship.",
    subject: "Portfolio message from Test Visitor",
    botcheck: false,
  });
  expect(typeof payload.access_key).toBe("string");
  await expect(form.getByLabel("Message")).toHaveValue("");
});

test("contact form: a rejected send explains it and offers the email address", async ({ page }) => {
  const form = await openContactForm(page);
  await page.route("https://api.web3forms.com/submit", (route) =>
    route.fulfill({ status: 400, json: { success: false, message: "Invalid access key" } }),
  );
  await form.getByLabel("Name").fill("Test Visitor");
  await form.getByLabel("Email").fill("visitor@example.com");
  await form.getByLabel("Message").fill("This one should fail on purpose.");
  await form.getByRole("button", { name: "Send Message" }).click();

  const status = page.getByTestId("contact-status");
  await expect(status).toContainText("didn't go through");
  await expect(status.getByRole("link", { name: "neilpatrick.dev@gmail.com" })).toHaveAttribute(
    "href",
    "mailto:neilpatrick.dev@gmail.com",
  );
  // The visitor's text is kept so they can retry.
  await expect(form.getByLabel("Message")).toHaveValue("This one should fail on purpose.");
});

/* ---------- Contact links, footer location, cursor ---------- */

test("Contact page and footer list Email, LinkedIn and GitHub, without a Credly profile link", async ({ page }) => {
  await page.goto("/contact");
  const main = page.locator("main");
  const footer = page.locator("footer");
  for (const scope of [main, footer]) {
    for (const label of ["Email", "LinkedIn", "GitHub"]) {
      await expect(scope.getByRole("link", { name: new RegExp(`^${label}`) }).first()).toBeVisible();
    }
    await expect(scope.locator('a[href*="credly.com/users"]')).toHaveCount(0);
  }
});

test("footer shows the location with a pin icon", async ({ page }) => {
  await page.goto("/");
  const location = page.locator("footer p", { hasText: "San Pablo City" });
  await expect(location.locator("svg")).toHaveCount(1);
});

test("mouse pointers get the glowing cursors: the dart on the page, the pointing hand on links, the open hand on the carousel, the I-beam in text fields", async ({ page }) => {
  await page.goto("/contact");
  const cursor = (selector: string) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).cursor);
  expect(await cursor("main p")).toContain("cursors/arrow");
  expect(await cursor("main a[href]")).toContain("cursors/hand-point");
  expect(await cursor("header button")).toContain("cursors/hand-point");
  const form = page.getByRole("form", { name: "Send a message" });
  if (await form.count()) expect(await form.getByLabel("Name").evaluate((el) => getComputedStyle(el).cursor)).toContain("cursors/text");
  // No crosshair or reticle any more.
  expect(await cursor("main a[href]")).not.toContain("reticle");
  // Draggable: the credential carousel gets the open hand, and the closed hand while held.
  await page.goto("/credentials");
  expect(await page.locator("[data-credential-path]").evaluate((el) => getComputedStyle(el).cursor)).toContain("cursors/hand-open");
  for (const file of ["arrow", "hand-point", "hand-open", "hand-grab", "text"]) {
    for (const suffix of ["", "@2x"]) {
      expect((await page.request.get(`/cursors/${file}${suffix}.png`)).ok(), file + suffix).toBe(true);
    }
  }
});
