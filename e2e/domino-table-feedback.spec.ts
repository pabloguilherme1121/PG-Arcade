import { test, expect } from "@playwright/test";

test("dominó exibe pedras com pontos, pontas abertas e última jogada em mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/domino");
  const game = page.locator('[data-domino-game="true"]');
  await game.locator('[data-domino-mode="local"]').click();
  const chain = game.locator('[data-domino-chain="true"]');
  const hand = game.locator('[data-domino-hand="true"]');
  const ends = game.locator('[data-domino-ends="true"]');
  const status = game.locator('[data-domino-last-move="true"]');

  await expect(chain.locator("[data-domino-face]")).toHaveCount(0);
  await expect(ends).toContainText("Mesa livre");
  await expect(status).toContainText("Escolha uma pedra");
  const first = hand.locator('[data-domino-tile]:not([disabled])').first();
  await expect(first).toHaveAttribute("aria-description", /esquerda.*direita/i);
  await first.click();

  const placed = chain.locator('[data-domino-face="true"]');
  await expect(placed).toHaveCount(1);
  await expect(chain.locator('[data-domino-latest="true"]')).toHaveCount(1);
  const half = placed.locator("[data-domino-half]");
  for (let i = 0; i < 2; i++) {
    const n = Number(await half.nth(i).getAttribute("data-domino-value"));
    await expect(half.nth(i).locator("[data-domino-pip]")).toHaveCount(n);
  }
  const left = await half.first().getAttribute("data-domino-value");
  const right = await half.last().getAttribute("data-domino-value");
  await expect(game.locator('[data-domino-end="left"]')).toContainText(left!);
  await expect(game.locator('[data-domino-end="right"]')).toContainText(right!);
  await expect(status).toContainText(/jogador 1 jogou/i);
  await expect(game.locator('[data-domino-handoff="true"]')).toBeVisible();

  await game.getByRole("button", { name: /reiniciar rodada/i }).click();
  await expect(chain.locator('[data-domino-face="true"]')).toHaveCount(0);
  await expect(status).toContainText("Escolha uma pedra");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("dominó registra a jogada do bot sem perder estado de turno", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/domino");
  const game = page.locator('[data-domino-game="true"]');
  const hand = game.locator('[data-domino-hand="true"]');
  await hand.locator('[data-domino-tile]:not([disabled])').first().click();
  await expect(game.locator('[data-domino-last-move="true"]')).toContainText(/você jogou/i);
  await expect(game.locator('[data-domino-last-move="true"]')).toContainText(/PG Bot (jogou|passou)/i);
  await expect(game.locator('[data-domino-chain="true"] [data-domino-face="true"]')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
