import { expect, test } from "@playwright/test";

test("landing page links to signup and login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /start building/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /log in/i }).first()).toBeVisible();
});

test("login and signup pages render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByRole("button", { name: /create my account/i })).toBeVisible();
});

test("dashboard requires authentication", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

