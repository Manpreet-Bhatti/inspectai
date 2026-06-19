import { chromium } from "@playwright/test";
import path from "path";

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "password123";
const AUTH_FILE = path.join(__dirname, ".auth/user.json");

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/login");

  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard after login
  await page.waitForURL("**/dashboard", { timeout: 10_000 });

  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
}
