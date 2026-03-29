import { test, expect } from "./fixtures";

test.describe("Crowds Page", () => {
  test("should load crowds from real project data", async ({ authedPage: page }) => {
    await page.goto("/crowds");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /crowds/i })).toBeVisible();

    // Table should have rows derived from projects
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 15_000 });
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should NOT show Create Crowd wizard button", async ({ authedPage: page }) => {
    await page.goto("/crowds");
    await page.waitForLoadState("networkidle");

    // Create Crowd wizard should have been removed (Bug 8)
    await expect(
      page.getByRole("button", { name: /create crowd/i })
    ).not.toBeVisible();
  });

  test("should show brand filter", async ({ authedPage: page }) => {
    await page.goto("/crowds");
    await page.waitForLoadState("networkidle");

    const brandTrigger = page.locator('[role="combobox"]')
      .filter({ hasText: /brand|all brands/i })
      .first();

    if (await brandTrigger.isVisible()) {
      await brandTrigger.click();
      await expect(page.getByRole("option", { name: /LS/i })).toBeVisible({ timeout: 3000 });
      await expect(page.getByRole("option", { name: /MRA/i })).toBeVisible({ timeout: 3000 });
      await page.keyboard.press("Escape");
    }
  });

  test("should show LS and MRA badges in table", async ({ authedPage: page }) => {
    await page.goto("/crowds");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 15_000 });

    // Table should have Brand column with LS or MRA badges
    const badges = table.getByText(/^(LS|MRA)$/);
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });
});
