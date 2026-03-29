import { test, expect } from "./fixtures";

test.describe("Participants Page", () => {
  test("should load participants list", async ({ authedPage: page }) => {
    await page.goto("/participants");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /participants/i })).toBeVisible();

    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should NOT show Add Participant button", async ({ authedPage: page }) => {
    await page.goto("/participants");
    await page.waitForLoadState("networkidle");

    // Add Participant button should have been removed (Bug 8)
    await expect(
      page.getByRole("button", { name: /add participant/i })
    ).not.toBeVisible();
  });

  test("should filter by project", async ({ authedPage: page }) => {
    await page.goto("/participants");
    await page.waitForLoadState("networkidle");

    const projectTrigger = page.locator('[role="combobox"]')
      .filter({ hasText: /project|all projects/i })
      .first();

    if (await projectTrigger.isVisible()) {
      await projectTrigger.click();
      await page.waitForTimeout(1000);
      // Should show project options
      const options = page.locator('[role="option"]');
      const count = await options.count();
      expect(count).toBeGreaterThan(0);
      await page.keyboard.press("Escape");
    }
  });
});
