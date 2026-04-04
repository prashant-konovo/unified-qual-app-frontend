// E2E tests planned — test directory: e2e/
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: "html",
  timeout: 60_000,
  use: {
    baseURL: "https://data-qa.d2ejnrofktz23t.amplifyapp.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
