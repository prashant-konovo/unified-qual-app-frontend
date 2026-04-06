import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders login form with all elements", async ({ page }) => {
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in with SSO" }),
    ).toBeVisible();
    await expect(page.getByText("Sign in")).toBeVisible();
    await expect(
      page.getByText("Enter your credentials to access Unified Qual"),
    ).toBeVisible();
  });

  test("shows logo", async ({ page }) => {
    await expect(page.getByAlt("Konovo logo")).toBeVisible();
  });

  test("email field validates input type", async ({ page }) => {
    const emailInput = page.locator("#email");
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("password field is masked", async ({ page }) => {
    const passwordInput = page.locator("#password");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(passwordInput).toHaveAttribute("required", "");
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.locator("#email").fill("bad@example.com");
    await page.locator("#password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for error message
    await expect(page.locator(".text-destructive")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows loading state during submission", async ({ page }) => {
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Button should show spinner briefly
    await expect(page.getByText("Signing in…")).toBeVisible();
  });

  test("preserves redirect path in URL", async ({ page }) => {
    await page.goto("/projects");
    // Middleware should redirect to login with ?from=/projects
    await expect(page).toHaveURL(/\/login\?from=%2Fprojects/);
  });
});
