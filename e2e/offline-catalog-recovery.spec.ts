import { CATALOG_SIZE } from "../src/lib/catalogRelease";
import { test, expect } from "@playwright/test";

// Issue #79: portable offline contract without assuming identical service-worker lifecycles.
test("the catalog keeps its navigation usable after reconnecting", async ({ page, context }) => {
  await page.goto("./");
  await expect(page.locator(".game-card")).toHaveCount(CATALOG_SIZE);
  await context.setOffline(true);
  try {
    // The already-rendered catalog must remain interactive without a network.
    await page.getByLabel("Buscar jogo").fill("2048");
    await expect(page.locator(".game-card")).toHaveCount(1);
    await expect(page.getByRole("link", { name: /^Jogar 2048/ })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
  await page.getByLabel("Buscar jogo").fill("");
  await expect(page.locator(".game-card")).toHaveCount(CATALOG_SIZE);
  await page.getByRole("link", { name: /^Jogar 2048/ }).click();
  await expect(page.locator(".board2048")).toBeVisible();
});
