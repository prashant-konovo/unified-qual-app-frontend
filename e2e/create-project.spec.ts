import { test, expect } from "./fixtures";

test.describe("Create Project Wizard", () => {
  test("should open create project page", async ({ authedPage: page }) => {
    await page.goto("/projects/new");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /create new project/i })).toBeVisible();
  });

  test("should show correct step indicators", async ({ authedPage: page }) => {
    await page.goto("/projects/new");
    await page.waitForLoadState("networkidle");

    // Step 1 elements should be visible
    await expect(page.getByLabel(/project name/i)).toBeVisible();
    await expect(page.getByText(/interview length/i)).toBeVisible();
    await expect(page.getByText(/salesforce job number/i)).toBeVisible();
  });

  test("should show real subscriptions (not dummy data)", async ({ authedPage: page }) => {
    await page.goto("/projects/new");
    await page.waitForLoadState("networkidle");

    // Find subscription dropdown
    const subTrigger = page.locator('[role="combobox"]')
      .filter({ hasText: /subscription|select subscription|none/i })
      .first();

    if (await subTrigger.isVisible({ timeout: 5000 })) {
      await subTrigger.click();
      await page.waitForTimeout(2000);

      // Should NOT show dummy "Konovo Health" or "Apollo Research"
      const konovoOption = page.getByRole("option", { name: /konovo health/i });
      const apolloOption = page.getByRole("option", { name: /apollo research/i });

      expect(await konovoOption.isVisible().catch(() => false)).toBeFalsy();
      expect(await apolloOption.isVisible().catch(() => false)).toBeFalsy();

      await page.keyboard.press("Escape");
    }
  });

  test("should show healthcare professions in Step 2", async ({ authedPage: page }) => {
    await page.goto("/projects/new");
    await page.waitForLoadState("networkidle");

    // Fill step 1 to proceed
    await page.getByLabel(/project name/i).fill("E2E Test Project");

    // Select interview length
    const lengthTrigger = page.locator('[role="combobox"]')
      .filter({ hasText: /select duration/i })
      .first();
    if (await lengthTrigger.isVisible()) {
      await lengthTrigger.click();
      await page.getByRole("option", { name: /60 minutes/i }).click();
    }

    // Fill salesforce job number (now a text field, not dropdown)
    const sfInput = page.getByPlaceholder(/SF-JOB/i);
    if (await sfInput.isVisible()) {
      await sfInput.fill("SF-JOB-TEST");
    }

    // Click continue
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(1000);

    // Step 2 - check profession dropdown has healthcare options
    const profTrigger = page.locator('[role="combobox"]')
      .filter({ hasText: /select profession|profession/i })
      .first();

    if (await profTrigger.isVisible({ timeout: 5000 })) {
      await profTrigger.click();
      await page.waitForTimeout(500);

      // Should show healthcare professions (Bug 4)
      await expect(page.getByRole("option", { name: /physician/i })).toBeVisible();
      await expect(page.getByRole("option", { name: /pharmacist/i })).toBeVisible();

      // Should NOT show old dummy values
      const engOption = page.getByRole("option", { name: /^engineering$/i });
      expect(await engOption.isVisible().catch(() => false)).toBeFalsy();

      await page.keyboard.press("Escape");
    }
  });
});
