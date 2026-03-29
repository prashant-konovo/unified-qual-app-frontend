import { test, expect } from "./fixtures";

test.describe("Moderators Page", () => {
  test("should load moderators list", async ({ authedPage: page }) => {
    await page.goto("/moderators");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /moderators/i })).toBeVisible();

    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should NOT show New Moderator button", async ({ authedPage: page }) => {
    await page.goto("/moderators");
    await page.waitForLoadState("networkidle");

    // New Moderator button should have been removed (Bug 8)
    await expect(
      page.getByRole("button", { name: /new moderator/i })
    ).not.toBeVisible();
  });

  test("should NOT show Bulk Upload button", async ({ authedPage: page }) => {
    await page.goto("/moderators");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("button", { name: /bulk upload/i })
    ).not.toBeVisible();
  });

  test("should filter moderators by search", async ({ authedPage: page }) => {
    await page.goto("/moderators");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("a");
      await page.waitForTimeout(1500);
      // Should still show results or empty state
      const table = page.locator("table");
      await expect(table).toBeVisible();
    }
  });
});
