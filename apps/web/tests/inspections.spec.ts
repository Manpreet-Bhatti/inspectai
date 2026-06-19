import { test, expect } from "@playwright/test";

const TEST_INSPECTION = {
  title: `E2E Test ${Date.now()}`,
  address: "123 Test Street",
  city: "San Francisco",
  state: "CA",
  zipCode: "94105",
};

test.describe("inspections", () => {
  test("inspections list loads", async ({ page }) => {
    await page.goto("/inspections");
    await expect(page).toHaveURL(/\/inspections/);
    // Page renders (not an error page)
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("new inspection form renders all required fields", async ({ page }) => {
    await page.goto("/inspections/new");
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('input[name="address"]')).toBeVisible();
    await expect(page.locator('input[name="city"]')).toBeVisible();
    await expect(page.locator('input[name="state"]')).toBeVisible();
    await expect(page.locator('input[name="zipCode"]')).toBeVisible();
  });

  test("creates inspection and redirects to detail", async ({ page }) => {
    await page.goto("/inspections/new");

    await page.fill('input[name="title"]', TEST_INSPECTION.title);
    await page.fill('input[name="address"]', TEST_INSPECTION.address);
    await page.fill('input[name="city"]', TEST_INSPECTION.city);
    await page.fill('input[name="state"]', TEST_INSPECTION.state);
    await page.fill('input[name="zipCode"]', TEST_INSPECTION.zipCode);

    // Radio inputs are visually hidden; click the containing label
    await page.locator('label:has(input[name="propertyType"])').first().click();

    await page.click('button[type="submit"]');

    // Should redirect to inspection detail page
    await page.waitForURL(/\/inspections\/[a-f0-9-]{36}/, { timeout: 10_000 });
    await expect(page.locator("body")).toContainText(TEST_INSPECTION.title);
  });

  test("inspection appears in list after creation", async ({ page }) => {
    await page.goto("/inspections");
    await expect(page.locator("body")).toContainText(TEST_INSPECTION.title);
  });

  test("inspection detail shows address", async ({ page }) => {
    // Navigate to inspections list and click the test inspection
    await page.goto("/inspections");
    const link = page.locator(`text=${TEST_INSPECTION.title}`).first();
    await link.click();

    await page.waitForURL(/\/inspections\/[a-f0-9-]{36}/);
    await expect(page.locator("body")).toContainText(TEST_INSPECTION.address);
  });

  test("validation: submit empty form shows errors", async ({ page }) => {
    await page.goto("/inspections/new");
    await page.click('button[type="submit"]');

    // Browser native validation prevents submission — URL stays on /new
    await expect(page).toHaveURL(/\/inspections\/new/);
  });
});
