import { expect, test } from "@playwright/test";

test("serves the login page", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});
