import { expect, test } from '@playwright/test';

test('combines swipe controls with styles and restores and clears the filters', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./#/');
  await page.getByRole('button', { name: /^Sem pressa/ }).click();
  const swipe = page.getByRole('checkbox', { name: 'Somente jogos com deslize na tela' });
  await swipe.check();
  await expect(page.locator('[data-catalog-game="2048"]')).toBeVisible();
  await expect(page.locator('[data-catalog-game="xadrez"]')).toHaveCount(0);
  await page.reload();
  await expect(swipe).toBeChecked();
  await expect(page.getByRole('button', { name: /^Sem pressa/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Zerar filtros', exact: true }).click();
  await expect(swipe).not.toBeChecked();
  await expect(page.locator('[data-catalog-game="xadrez"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('memory exposes round settings and adapts the hard board to landscape', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('./#/jogar/memoria');
  await page.getByLabel('Dificuldade da memória', { exact: true }).selectOption('12');
  const observation = page.getByLabel('Tempo para observar cartas diferentes');
  await expect(page.locator('.board-column > .session-options')).toContainText('Tempo para observar');
  await observation.selectOption('1500');
  await expect(page.locator('.memory-card')).toHaveCount(24);
  expect(await page.locator('.memory-board').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(6);
  await page.locator('.memory-card').first().click();
  await expect(observation).toBeDisabled();
  await page.getByRole('button', { name: 'Nova partida' }).click();
  await expect(observation).toBeEnabled();
  await expect(observation).toHaveValue('1500');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
