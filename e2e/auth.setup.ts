import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_USER_EMAIL and E2E_USER_PASSWORD env vars are required.\n" +
        "Set them before running: export E2E_USER_EMAIL=... E2E_USER_PASSWORD=...",
    );
  }

  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for redirect away from login (auth_active cookie set by client)
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

  // Save signed-in state
  await page.context().storageState({ path: authFile });
});
