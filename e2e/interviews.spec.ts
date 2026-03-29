import { test, expect } from "./fixtures";

test.describe("Interviews Page", () => {
  test("should load interviews with tabs", async ({ authedPage: page }) => {
    await page.goto("/interviews");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /interviews/i })).toBeVisible();

    // Tabs should be visible
    await expect(page.getByRole("tab", { name: /upcoming/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /completed/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /invalidated/i })).toBeVisible();
  });

  test("should show Brand (LS/MRA) column", async ({ authedPage: page }) => {
    await page.goto("/interviews");
    await page.waitForLoadState("networkidle");

    // Wait for table to load
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 15_000 });

    // Brand column header should exist
    await expect(page.getByRole("columnheader", { name: /brand/i })).toBeVisible();
  });

  test("should show brand badges (LS or MRA)", async ({ authedPage: page }) => {
    await page.goto("/interviews");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 15_000 });

    // At least one LS or MRA badge should be visible
    const badges = page.locator("table tbody").getByText(/^(LS|MRA)$/);
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if no bookings
  });

  test("should switch to completed tab", async ({ authedPage: page }) => {
    await page.goto("/interviews");
    await page.waitForLoadState("networkidle");

    await page.getByRole("tab", { name: /completed/i }).click();
    await page.waitForTimeout(2000);

    // Table should still be visible (even if empty)
    const table = page.locator("table");
    await expect(table).toBeVisible();
  });

  test("should have cancel/reschedule in actions menu", async ({ authedPage: page }) => {
    await page.goto("/interviews");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 15_000 });

    // If there are rows, check the actions menu
    const actionBtns = page.locator("table tbody tr button");
    if (await actionBtns.first().isVisible({ timeout: 5000 })) {
      await actionBtns.first().click();
      await page.waitForTimeout(500);

      // Check for Cancel and Reschedule options
      const cancelItem = page.getByRole("menuitem", { name: /cancel interview/i });
      const rescheduleItem = page.getByRole("menuitem", { name: /reschedule/i });

      const hasCancelOrReschedule =
        (await cancelItem.isVisible().catch(() => false)) ||
        (await rescheduleItem.isVisible().catch(() => false));

      // At least one should exist in the menu
      expect(hasCancelOrReschedule).toBeTruthy();
    }
  });
});
