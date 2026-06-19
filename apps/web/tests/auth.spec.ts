import { test, expect } from "@playwright/test";

test.describe("authentication", () => {
  test("unauthenticated user redirected to login", async ({ browser }) => {
    // Fresh context = no stored auth state
    const ctx = await browser.newContext({ storageState: undefined });
    const page = await ctx.newPage();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await ctx.close();
  });

  test("login page renders", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined });
    const page = await ctx.newPage();

    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await ctx.close();
  });

  test("authenticated user sees dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    // Dashboard has heading or nav — not login form
    await expect(page.locator('input[type="email"]')).not.toBeVisible();
  });

  test("authenticated user redirected away from login", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
