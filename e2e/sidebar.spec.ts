import { test, expect } from "./fixtures";

test.describe("Sidebar Navigation", () => {
  test("should NOT show Waiting Queue in sidebar", async ({ authedPage: page }) => {
    // Bug 8: Waiting Queue should have been removed
    await expect(
      page.getByRole("link", { name: /waiting queue/i })
    ).not.toBeVisible();
  });

  test("should show core navigation items", async ({ authedPage: page }) => {
    // Core navigation items that should be present
    await expect(page.getByRole("link", { name: /projects/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /interviews/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /participants/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /moderators/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /crowds/i }).first()).toBeVisible();
  });

  test("should navigate between pages via sidebar", async ({ authedPage: page }) => {
    // Navigate to moderators
    await page.getByRole("link", { name: /moderators/i }).first().click();
    await page.waitForURL(/\/moderators/);
    await expect(page.getByRole("heading", { name: /moderators/i })).toBeVisible();

    // Navigate to participants
    await page.getByRole("link", { name: /participants/i }).first().click();
    await page.waitForURL(/\/participants/);
    await expect(page.getByRole("heading", { name: /participants/i })).toBeVisible();

    // Navigate to interviews
    await page.getByRole("link", { name: /interviews/i }).first().click();
    await page.waitForURL(/\/interviews/);
    await expect(page.getByRole("heading", { name: /interviews/i })).toBeVisible();
  });
});
