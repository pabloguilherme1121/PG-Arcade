import { test, expect } from "@playwright/test";

// Issue #79: portable offline contract without assuming identical service-worker lifecycles.
test("the catalog keeps its navigation usable after reconnecting", async ({ page, context }) => {
  await page.goto("./");
  await expect(page.locator(".game-card")).toHaveCount(101);
  await context.setOffline(true);
  try {
    // The already-rendered catalog must remain interactive without a network.
    await page.getByLabel("Buscar jogo").fill("2048");
    await expect(page.locator(".game-card")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Jogar 2048", exact: true })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
  await page.getByLabel("Buscar jogo").fill("");
  await expect(page.locator(".game-card")).toHaveCount(101);
  await page.getByRole("link", { name: "Jogar 2048", exact: true }).click();
  await expect(page.locator(".board2048")).toBeVisible();
});
