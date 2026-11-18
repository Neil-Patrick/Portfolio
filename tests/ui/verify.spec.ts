import AxeBuilder from "@axe-core/playwright";
import { devices, expect, test, type Page } from "@playwright/test";
import { sections } from "../../src/content/site";

const WIDTHS = [320, 768, 1024, 1440];
const SCHEMES = ["light", "dark"] as const;
const SCREENSHOT_DIR = "test-results/screenshots";

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

const wheelTrigger = (page: Page) => page.getByRole("button", { name: "Open navigation" });
const wheel = (page: Page) => page.getByRole("dialog", { name: "Navigation" });

/* ---------- Layout, console, and accessibility ---------- */

// Home: every width × scheme.
for (const width of WIDTHS) {
  for (const scheme of SCHEMES) {
    test(`layout home ${width}px ${scheme}`, async ({ page }) => {
      const errors = collectErrors(page);
      await openPage(page, "/", width, scheme);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/home-${width}-${scheme}.png`, fullPage: true });
      await checkPage(page, errors);
    });
  }
}

// Section pages: smallest and largest width × scheme.
for (const section of sections.filter((s) => s.href !== "/")) {
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

// Wheel open: smallest and largest width × scheme.
for (const width of [320, 1440]) {
  for (const scheme of SCHEMES) {
    test(`layout wheel open ${width}px ${scheme}`, async ({ page }) => {
      const errors = collectErrors(page);
      await openPage(page, "/", width, scheme);
      await wheelTrigger(page).click();
      await expect(wheel(page)).toBeVisible();
      // Let the open transition finish before measuring and capturing.
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/wheel-${width}-${scheme}.png` });

      // Every ring item must be fully inside the viewport.
      for (const link of await wheel(page).getByRole("link").all()) {
        const box = (await link.boundingBox())!;
        expect(box.x, "item off the left edge").toBeGreaterThanOrEqual(0);
        expect(box.y, "item off the top edge").toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, "item off the right edge").toBeLessThanOrEqual(width);
        expect(box.width, "touch target").toBeGreaterThanOrEqual(44);
      }

      // The arrow must never cover the center text, whichever item it points at.
      const arrow = page.getByTestId("wheel-arrow");
      const readout = page.getByTestId("wheel-readout");
      for (let i = 0; i < sections.length; i++) {
        await page.waitForTimeout(300); // let the arrow finish turning
        const a = (await arrow.boundingBox())!;
        const r = (await readout.boundingBox())!;
        const overlaps =
          a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
        expect(overlaps, `arrow covers text when aiming at ${sections[i].label}`).toBe(false);
        await page.keyboard.press("ArrowRight");
      }
      await checkPage(page, errors);
    });
  }
}

/* ---------- Behaviour ---------- */

test("every section in site.ts exists on the home page", async ({ page }) => {
  await page.goto("/");
  for (const section of sections) {
    await expect(page.locator(`#${section.id}`), `#${section.id}`).toHaveCount(1);
  }
});

test("each home section's View all link opens its page", async ({ page }) => {
  for (const section of sections.filter((s) => s.href !== "/")) {
    await page.goto("/");
    await page.getByRole("link", { name: `View all ${section.label}` }).click();
    await expect(page).toHaveURL(new RegExp(`${section.href}$`));
    await expect(page.getByRole("heading", { level: 1, name: section.label })).toBeVisible();
    await expect(page).toHaveTitle(new RegExp(`^${section.label} \|`));
  }
});

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

test("wheel opens, moves with arrow keys, closes with Escape, and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/");
  const trigger = wheelTrigger(page);
  const item = (name: string) => wheel(page).getByRole("link", { name, exact: true });

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(wheel(page)).toBeVisible();
  // Focus starts on the current page's item.
  await expect(item("Home")).toBeFocused();
  await expect(item("Home")).toHaveAttribute("aria-current", "page");

  await page.keyboard.press("ArrowRight");
  await expect(item("About")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(item("Contact")).toBeFocused(); // wraps around

  await page.keyboard.press("Escape");
  await expect(wheel(page)).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(page.getByTestId("wheel-readout")).toContainText("Home");
  await item("Projects").hover();
  await expect(page.getByTestId("wheel-readout")).toContainText("Things I've built.");
  await item("Projects").click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(wheel(page)).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();

  await trigger.click();
  await expect(item("Projects")).toHaveAttribute("aria-current", "page");
  await expect(item("Projects")).toBeFocused();
});

test("mouse aims the arrow by direction and click opens the aimed section", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await wheelTrigger(page).click();
  await page.waitForTimeout(300);
  const ring = (await page.locator(".wheel-ring").boundingBox())!;
  const cx = ring.x + ring.width / 2;
  const cy = ring.y + ring.height / 2;
  const readout = page.getByTestId("wheel-readout");

  // Point down-right at 120° (Credentials), inside the hub, not on any icon.
  const angle = (sections.findIndex((s) => s.id === "credentials") * 360) / sections.length;
  const rad = (angle * Math.PI) / 180;
  const x = cx + 60 * Math.sin(rad);
  const y = cy - 60 * Math.cos(rad);
  await page.mouse.move(x, y);
  await expect(readout).toContainText("Credentials");
  await expect(readout).toContainText("Degrees and certifications.");

  await page.mouse.click(x, y);
  await expect(page).toHaveURL(/\/credentials$/);
  await expect(wheel(page)).toBeHidden();
});

test.describe("on a touch phone", () => {
  // Phone viewport with touch (no hover), so the hover: none captions apply.
  const { viewport, userAgent, deviceScaleFactor } = devices["Pixel 7"];
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile: true, hasTouch: true });

  test("wheel items show captions", async ({ page }) => {
    await page.goto("/");
    await wheelTrigger(page).tap();
    const caption = wheel(page).locator(".wheel-caption", { hasText: "Projects" });
    await expect(caption).toBeVisible();
  });
});

test("clicking outside the ring closes the wheel", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await wheelTrigger(page).click();
  await expect(wheel(page)).toBeVisible();
  await page.mouse.click(10, 890);
  await expect(wheel(page)).toBeHidden();
});
