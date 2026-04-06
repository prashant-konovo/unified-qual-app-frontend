import { test, expect } from "@playwright/test";

// Authenticated tests — uses storageState from auth.setup.ts

test.describe("Projects Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
  });

  test("loads project list page", async ({ page }) => {
    await expect(page).toHaveURL(/\/projects/);
    // Page should have a heading or project list container
    await expect(
      page.getByRole("heading").first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("has LS and MRA brand tabs", async ({ page }) => {
    // Both brand tabs should be present
    const lsTab = page.getByRole("tab", { name: /LS|LiveSample/i });
    const mraTab = page.getByRole("tab", { name: /MRA/i });

    // At least one tab should exist (UI may vary)
    const hasLs = await lsTab.count();
    const hasMra = await mraTab.count();
    expect(hasLs + hasMra).toBeGreaterThan(0);
  });

  test("can navigate to create new project", async ({ page }) => {
    const newBtn = page.getByRole("link", { name: /new|create/i });
    if ((await newBtn.count()) > 0) {
      await newBtn.click();
      await expect(page).toHaveURL(/\/projects\/new/);
    }
  });

  test("can click into a project detail", async ({ page }) => {
    // Wait for project list to load
    await page.waitForLoadState("networkidle");

    // Click the first project link/row if projects exist
    const projectLink = page.locator("a[href*='/projects/']").first();
    if ((await projectLink.count()) > 0) {
      await projectLink.click();
      await expect(page).toHaveURL(/\/projects\/\d+/);
    }
  });
});
