import { expect, test } from '@playwright/test';

for (const width of [320, 1280]) {
  test(`popular names and local groups remain usable at ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height: 844});
    await page.goto('./');
    const search = page.getByLabel('Buscar jogo', {exact: true});
    await search.fill('cobrinha');
    await expect(page.locator('.game-card')).toHaveCount(1);
    await expect(page.locator('.game-card')).toHaveAttribute('data-catalog-game', 'snake');
    await search.fill('');
    await page.getByLabel('Filtrar por modo').selectOption('Grupo local (3–4)');
    await expect(page.locator('.game-card')).toHaveCount(5);
    await page.reload();
    await expect(page.getByLabel('Filtrar por modo')).toHaveValue('Grupo local (3–4)');
    await expect(page.locator('.game-card')).toHaveCount(5);
    await expect(page.getByRole('status').filter({hasText: '5 jogos encontrados'})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.getByRole('button', {name: 'Remover modo: Grupo local (3–4)', exact: true}).click();
    await expect(page.locator('.game-card')).toHaveCount(108);
  });
}

test('holding space pauses Snake once and browser shortcuts do not steer', async ({page}) => {
  await page.goto('./#/jogar/snake');
  const board = page.locator('.snake-board');
  await expect(board).toHaveAttribute('data-play-status', 'ready');
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await board.focus();
  await page.keyboard.press('Space');
  await expect(board).toHaveAttribute('data-play-status', 'running');
  await page.keyboard.down('Space');
  await expect(board).toHaveAttribute('data-play-status', 'paused');
  await page.keyboard.down('Space');
  await expect(board).toHaveAttribute('data-play-status', 'paused');
  await page.keyboard.up('Space');
  await page.keyboard.press('Space');
  await expect(board).toHaveAttribute('data-play-status', 'running');
  await page.keyboard.press('Control+ArrowUp');
  await expect(page.locator('[data-snake-queued]')).toHaveText('Livre');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('[data-snake-queued]')).toHaveText('↑');
  await page.clock.runFor(160);
  await expect(board).toHaveAttribute('data-facing', 'up');
  await expect(board.locator('.snake-head')).toHaveCount(1);
  await expect(board.locator('.snake-body')).toHaveCount(2);
});
