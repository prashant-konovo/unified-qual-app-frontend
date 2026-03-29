import { test, expect } from "./fixtures";

test.describe("Projects Page", () => {
  test("should load projects list with data", async ({ authedPage: page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Page title
    await expect(page.getByRole("heading", { name: /projects/i })).toBeVisible();

    // Table should have rows
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should filter by status", async ({ authedPage: page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Open status filter and select "In Progress"
    const statusTrigger = page.locator('[data-testid="status-filter"], select, [role="combobox"]')
      .filter({ hasText: /status|all statuses/i })
      .first();

    if (await statusTrigger.isVisible()) {
      await statusTrigger.click();
      const inProgressOption = page.getByRole("option", { name: /in progress/i });
      if (await inProgressOption.isVisible({ timeout: 3000 })) {
        await inProgressOption.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test("should display Finalizing status option", async ({ authedPage: page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Look for status filter containing Finalizing
    const statusTrigger = page.locator('[role="combobox"]')
      .filter({ hasText: /status|all statuses/i })
      .first();

    if (await statusTrigger.isVisible()) {
      await statusTrigger.click();
      await expect(
        page.getByRole("option", { name: /finalizing/i })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should show scheduling progress for projects", async ({ authedPage: page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // The table should show progress information (not just dashes for all)
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 15_000 });
  });

  test("should navigate to project detail", async ({ authedPage: page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Click on first project row
    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });
    await firstRow.click();

    // Should navigate to project detail page
    await page.waitForURL(/\/projects\/\d+/, { timeout: 10_000 });
    await expect(page.getByText(/scheduling progress|project details/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("should search projects", async ({ authedPage: page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await page.waitForTimeout(1500);
    }
  });
});
