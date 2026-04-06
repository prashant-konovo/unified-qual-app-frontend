import { test, expect } from "@playwright/test";

test.describe("Navigation — Unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects protected routes to /login", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/login\?from=%2Fprojects/);
  });

  test("redirects /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?from=%2Fdashboard/);
  });

  test("login page is accessible without redirect", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("#email")).toBeVisible();
  });
});

test.describe("Navigation — Authenticated", () => {
  // Uses storageState from auth.setup.ts (chromium project)
  test("sidebar shows navigation items", async ({ page }) => {
    await page.goto("/projects");

    // Core nav items visible (admin/manager role)
    await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Interviews" })).toBeVisible();
  });

  test("can navigate between pages via sidebar", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "Interviews" }).click();
    await expect(page).toHaveURL(/\/interviews/);
  });

  test("root path redirects to /projects", async ({ page }) => {
    await page.goto("/");
    // Root typically redirects to projects for authenticated users
    await expect(page).toHaveURL(/\/(projects|dashboard)/);
  });
});
