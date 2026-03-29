import { test, expect } from "./fixtures";

test.describe("Calendar / My Schedule Page", () => {
  test("should load calendar page", async ({ authedPage: page }) => {
    await page.goto("/my-schedule");
    await page.waitForLoadState("networkidle");

    // Calendar should be visible
    await expect(page.getByText(/schedule|calendar/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("should show week navigation", async ({ authedPage: page }) => {
    await page.goto("/my-schedule");
    await page.waitForLoadState("networkidle");

    // Navigation buttons should exist
    const prevBtn = page.getByRole("button", { name: /previous|prev|back|←/i }).or(
      page.locator("button").filter({ hasText: /←|‹|prev/i })
    );
    const nextBtn = page.getByRole("button", { name: /next|forward|→/i }).or(
      page.locator("button").filter({ hasText: /→|›|next/i })
    );

    // At least one navigation element should be visible
    const hasNav = (await prevBtn.first().isVisible().catch(() => false)) ||
                   (await nextBtn.first().isVisible().catch(() => false));
    expect(hasNav).toBeTruthy();
  });

  test("should show legend with availability and interview colors", async ({ authedPage: page }) => {
    await page.goto("/my-schedule");
    await page.waitForLoadState("networkidle");

    // Legend should show Availability and Interview
    await expect(page.getByText(/availability/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/interview/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
