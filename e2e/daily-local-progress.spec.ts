import { test, expect } from "@playwright/test";

test("daily progress counts actual visits, persists across reload, and preserves legacy totals", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/snake");
  await expect(page.locator(".snake-board")).toBeVisible();
  await page.goto("./#/progresso");
  const today = page.getByLabel("Atividade de hoje");
  await expect(today).toContainText("Hoje: 1 visita em 1 jogo.");
  const first = await page.evaluate(() => ({
    daily: JSON.parse(localStorage.getItem("pg-arcade-daily-v1") || "null"),
    legacy: JSON.parse(localStorage.getItem("pg-arcade-progress-v1") || "null"),
  }));
  expect(first.daily?.version).toBe(1);
  expect(Object.values(first.daily.days).some((counts: unknown) => typeof counts === "object" && counts !== null && "snake" in counts && counts.snake === 1)).toBe(true);
  expect(first.legacy?.visits?.snake).toBe(1);

  await page.reload();
  await expect(page.getByLabel("Atividade de hoje")).toContainText("Hoje: 1 visita em 1 jogo.");
  await page.goto("./#/jogar/snake");
  await expect(page.locator(".snake-board")).toBeVisible();
  await page.goto("./#/progresso");
  await expect(page.getByLabel("Atividade de hoje")).toContainText("Hoje: 2 visitas em 1 jogo.");
  const legacy = await page.evaluate(() => JSON.parse(localStorage.getItem("pg-arcade-progress-v1") || "null"));
  expect(legacy?.visits?.snake).toBe(2);
  await page.goto("./#/");
  await page.getByRole("button", { name: /^Já joguei/ }).click();
  await expect(page.locator(".game-card")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Jogar Snake", exact: true })).toBeVisible();
});
