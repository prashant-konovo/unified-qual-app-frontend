import { test as base, type Page } from "@playwright/test";

const ADMIN_EMAIL = "subsdataqa+3@gmail.com";
const ADMIN_PASS = "TestQual@2026!";

/**
 * Fixture that logs in once and reuses storage state across tests in a spec.
 */
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Fill login form
    await page.getByPlaceholder(/email/i).fill(ADMIN_EMAIL);
    await page.getByPlaceholder(/password/i).fill(ADMIN_PASS);
    await page.getByRole("button", { name: /sign in|log in|login/i }).click();

    // Wait for redirect to dashboard / projects
    await page.waitForURL(/\/(projects|dashboard)/, { timeout: 30_000 });

    await use(page);
  },
});

export { expect } from "@playwright/test";
