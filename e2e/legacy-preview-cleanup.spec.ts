import { CATALOG_SIZE } from "../src/lib/catalogRelease";
import { expect, test } from "@playwright/test";

test("the 100 current covers render without legacy preview wrappers", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".game-grid [data-game-cover]")).toHaveCount(CATALOG_SIZE);
  await expect(page.locator(".mechanic-preview, .expanded-preview, .illustrated-preview")).toHaveCount(0);
  await page.goto("./#/jogar/2048");
  await expect(page.locator('[data-game-cover="2048"]')).toBeVisible();
  await expect(page.locator(".mechanic-preview, .expanded-preview, .illustrated-preview")).toHaveCount(0);
});
