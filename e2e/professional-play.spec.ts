import { test, expect } from "@playwright/test";

test("Liga 4 bot plays, undo restores the human turn, and pause cancels pending moves", async ({ page }) => {
  await page.goto("./#/jogar/liga4");
  await page.getByLabel("Adversário do Liga 4").selectOption("bot");
  await page.getByLabel("Dificuldade do Liga 4").selectOption("hard");
  await page.getByRole("button", { name: "Jogar na coluna 4", exact: true }).click();
  await expect(page.locator(".disc-2")).toHaveCount(1);
  await page.getByRole("button", { name: "Desfazer jogada", exact: true }).click();
  await expect(page.locator(".disc-1,.disc-2")).toHaveCount(0);
  await page.clock.install();
  await page.getByRole("button", { name: "Jogar na coluna 1", exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("pg-arcade-pause")));
  await page.clock.runFor(1000);
  await expect(page.locator(".disc-2")).toHaveCount(0);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.clock.runFor(400);
  await expect(page.locator(".disc-2")).toHaveCount(1);
});

test("visual preferences persist across games and still work with storage blocked", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/liga4");
  await page.getByText("Conforto visual", { exact: true }).click();
  await page.getByLabel("Alto contraste", { exact: true }).check();
  await page.getByLabel("Movimento da interface").selectOption("reduced");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-arcade-contrast", "true");
  await expect(page.locator("html")).toHaveAttribute("data-arcade-motion", "reduced");
  await page.goto("./#/jogar/snake");
  await expect(page.locator(".snake-board")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-arcade-contrast", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw Error("blocked"); };
    Storage.prototype.setItem = () => { throw Error("blocked"); };
  });
  await page.reload();
  await page.getByText("Conforto visual", { exact: true }).click();
  await page.getByLabel("Alto contraste", { exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-arcade-contrast", "true");
});

test("Campo Minado changes density and protects the first reveal at all difficulties", async ({ page }) => {
  await page.goto("./#/jogar/minas");
  for (const count of [6, 10, 16]) {
    await page.getByRole("button", { name: "Novo campo", exact: true }).click();
    await page.getByLabel("Dificuldade do Campo Minado").selectOption(String(count));
    await page.getByRole("button", { name: "Casa 28: fechada", exact: true }).click();
    await expect(page.getByRole("button", { name: "Casa 28: 0 minas vizinhas", exact: true })).toBeDisabled();
    await expect(page.locator(".game-status")).not.toContainText("Uma mina");
    await expect(page.getByLabel("Dificuldade do Campo Minado")).toBeDisabled();
  }
});
