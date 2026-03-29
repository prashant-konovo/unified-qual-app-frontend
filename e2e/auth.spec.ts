import { test, expect } from "./fixtures";

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|log in|login/i })
    ).toBeVisible();
  });

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("wrong@test.com");
    await page.getByPlaceholder(/password/i).fill("wrongpass");
    await page.getByRole("button", { name: /sign in|log in|login/i }).click();
    // Should stay on login or show error
    await expect(page).toHaveURL(/login/);
  });

  test("should login with valid admin credentials", async ({ authedPage }) => {
    await expect(authedPage).toHaveURL(/\/(projects|dashboard)/);
  });
});
