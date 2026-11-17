import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
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

/* ---------- Layout, console, and accessibility at every width × color scheme ---------- */

for (const width of WIDTHS) {
  for (const scheme of SCHEMES) {
    test(`layout ${width}px ${scheme}`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.screenshot({ path: `${SCREENSHOT_DIR}/${width}-${scheme}.png`, fullPage: true });

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
    });
  }
}

/* ---------- Behaviour ---------- */

test("every section in site.ts exists on the page", async ({ page }) => {
  await page.goto("/");
  for (const section of sections) {
    await expect(page.locator(`#${section.id}`), `#${section.id}`).toHaveCount(1);
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

test("mobile menu opens, closes with Escape, and closes on link click", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /menu/i });
  const panelLink = page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Contact" });

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(panelLink).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();

  await toggle.click();
  await panelLink.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#contact$/);
});
