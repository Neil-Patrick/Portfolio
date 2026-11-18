import { defineConfig, devices } from "@playwright/test";

/**
 * UI verification (npm run test:ui). Chromium only.
 * Runs against the dev server on purpose: React reports hydration warnings
 * to the console only in development. `npm run build` covers production.
 */
export default defineConfig({
  testDir: "tests/ui",
  outputDir: "test-results",
  reporter: "list",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
    // Checks see the settled page (no half-faded text, still 3D frame). The
    // "full motion" tests in verify.spec.ts switch this back on.
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    // Reuse a dev server that is already running instead of starting a second one.
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
