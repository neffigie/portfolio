import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: "python3 scripts/serve-site.py",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: !process.env.CI,
    stderr: "ignore",
    timeout: 10_000,
  },
});
