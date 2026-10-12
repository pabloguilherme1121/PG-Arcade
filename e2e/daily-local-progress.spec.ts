import { readFile } from "node:fs/promises";
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

test("backup preserves dated visits and old records when restored into a fresh local calendar", async ({ page }) => {
  await page.goto("./#/jogar/2048");
  await expect(page.locator(".board2048")).toBeVisible();
  await page.goto("./#/progresso");
  await expect(page.getByLabel("Atividade de hoje")).toContainText("Hoje: 1 visita em 1 jogo.");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Salvar cópia do progresso" }).click();
  const download = await downloadEvent;
  const copy = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(copy.dailyActivity?.version).toBe(1);
  expect(Object.values(copy.dailyActivity.days).some((visits: unknown) =>
    !!visits && typeof visits === "object" && "2048" in visits && visits["2048"] === 1
  )).toBe(true);

  await page.evaluate(() => localStorage.removeItem("pg-arcade-daily-v1"));
  await page.reload();
  await expect(page.getByLabel("Atividade de hoje")).toContainText("Hoje: 0 visitas em 0 jogos.");
  await page.getByLabel("Restaurar cópia do progresso").setInputFiles({
    name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(copy)),
  });
  await expect(page.getByLabel("Atividade de hoje")).toContainText("Hoje: 1 visita em 1 jogo.");
  const legacy = await page.evaluate(() => JSON.parse(localStorage.getItem("pg-arcade-progress-v1") ?? "null"));
  expect(legacy?.visits?.["2048"]).toBe(1);
});
