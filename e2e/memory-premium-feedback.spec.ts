import { expect, test } from "@playwright/test";

test("Memória exibe pares, sequência e precisão sem mudar a pontuação", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/memoria");
  await page.getByLabel("Dificuldade da memória").selectOption("4");
  const cards = page.locator(".memory-card");
  await expect(cards).toHaveCount(8);
  await expect(page.locator("[data-memory-pairs]")).toHaveText("0/4");
  await expect(page.locator("[data-memory-streak]")).toHaveText("0");
  await expect(page.locator("[data-memory-accuracy]")).toHaveText("0%");
  await cards.nth(0).click();
  await cards.nth(4).click();
  await expect(page.locator("[data-memory-pairs]")).toHaveText("1/4");
  await expect(page.locator("[data-memory-streak]")).toHaveText("1");
  await expect(page.locator("[data-memory-accuracy]")).toHaveText("100%");
  await expect(page.getByRole("progressbar", { name: "Pares encontrados" })).toHaveAttribute("aria-valuenow", "1");
  await cards.nth(1).click();
  await cards.nth(3).click();
  await expect(page.locator("[data-memory-streak]")).toHaveText("0");
  await expect(page.locator("[data-memory-accuracy]")).toHaveText("50%");
  await expect(page.locator(".scores strong").first()).toHaveText("2");
  await page.getByRole("button", { name: "Nova partida", exact: true }).click();
  await expect(page.locator("[data-memory-pairs]")).toHaveText("0/4");
  await expect(page.locator("[data-memory-streak]")).toHaveText("0");
  await expect(page.locator("[data-memory-accuracy]")).toHaveText("0%");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Memória permite percorrer a grade com setas sem selecionar cartas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/memoria");
  await page.getByLabel("Dificuldade da memória").selectOption("4");
  const cards = page.locator(".memory-card");
  await cards.nth(1).focus();
  await cards.nth(1).press("ArrowRight");
  await expect(cards.nth(2)).toBeFocused();
  await cards.nth(2).press("ArrowDown");
  await expect(cards.nth(6)).toBeFocused();
  await expect(cards.nth(6)).toHaveAttribute("aria-pressed", "false");
  await cards.nth(6).press("ArrowLeft");
  await expect(cards.nth(5)).toBeFocused();
  await cards.nth(5).press("ArrowUp");
  await expect(cards.nth(1)).toBeFocused();
  await cards.nth(1).press("Enter");
  await expect(cards.nth(1)).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
