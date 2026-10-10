import { expect, test } from "@playwright/test";

test("damas destaca a última jogada e permite cancelar uma seleção comum", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/damas");
  const game = page.locator('[data-checkers-game="true"]');
  await game.getByRole("button", { name: /1 × 1 local/i }).click();
  const board = game.locator('[data-checkers-board="true"]');
  const source = board.getByRole("gridcell", { name: /Peça azul/i }).first();

  await source.click();
  await expect(source).toHaveAttribute("aria-selected", "true");
  await expect(board.locator('[data-legal-destination="true"]').first()).toBeVisible();
  await source.click();
  await expect(source).toHaveAttribute("aria-selected", "false");
  await expect(board.locator('[data-legal-destination="true"]')).toHaveCount(0);

  await source.click();
  const destination = board.locator('[data-legal-destination="true"]').first();
  await destination.click();
  await expect(source).toHaveAttribute("data-last-move", "from");
  await expect(destination).toHaveAttribute("data-last-move", "to");
  await expect(game.locator('[data-checkers-status="true"]')).toContainText(/jogador 2|vermelho/i);

  await game.getByRole("button", { name: "reiniciar", exact: true }).click();
  await expect(board.locator("[data-last-move]")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("xadrez evidencia movimentos e limpa o destaque ao desfazer e reiniciar", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/xadrez");
  const game = page.locator('[data-chess-game="true"]');
  await game.getByRole("button", { name: /1 × 1 local/i }).click();
  const board = game.locator('[data-chess-board="true"]');
  const from = board.getByRole("gridcell", { name: /e2 · peão branco/i });
  const to = board.getByRole("gridcell", { name: /e4 · vazia/i });

  await from.click();
  await to.click();
  await expect(from).toHaveAttribute("data-last-move", "from");
  await expect(to).toHaveAttribute("data-last-move", "to");
  await expect(board.locator("[data-last-move]")).toHaveCount(2);

  await game.getByRole("button", { name: /Desfazer jogada/i }).click();
  await expect(board.locator("[data-last-move]")).toHaveCount(0);
  await expect(board.getByRole("gridcell", { name: /e2 · peão branco/i })).toBeVisible();

  await board.getByRole("gridcell", { name: /e2 · peão branco/i }).click();
  await board.getByRole("gridcell", { name: /e4 · vazia/i }).click();
  await game.getByRole("button", { name: /nova partida/i }).click();
  await expect(board.locator("[data-last-move]")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
