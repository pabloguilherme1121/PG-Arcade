import { expect, test } from '@playwright/test';
import { solveSort } from './sort-solvers';
test.use({ hasTouch: true });
for (const id of ['colorsort', 'watersort']) for (const width of [320, 390, 844]) for (const difficulty of [0, 1, 2]) {
  if (width === 844 && difficulty !== 2) continue;
  test(`${id} completes level ${difficulty} by touch at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 844 ? 390 : width === 320 ? 740 : 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./#/jogar/${id}`);
    const game = page.locator('.board-expansion');
    await game.getByLabel('Dificuldade', { exact: true }).selectOption(String(difficulty));
    await expect(page.locator('#board-difficulty-description')).toContainText(`${difficulty + 2} cores`);
    const stacks = game.locator('.sort-board button');
    await expect(stacks).toHaveCount(difficulty + 4);
    const values = await stacks.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-stack')!.split(',').filter(Boolean).map(Number)));
    const route = solveSort(values, id === 'watersort');
    if (width === 844) {
      const board = game.locator('.sort-board');
      expect((await board.boundingBox())!.height).toBeLessThanOrEqual(366);
      await board.scrollIntoViewIfNeeded();
    }
    const target = (await stacks.first().boundingBox())!;
    expect(target.width).toBeGreaterThanOrEqual(44);
    expect(target.height).toBeGreaterThanOrEqual(44);
    for (const [from, to] of route) {
      await stacks.nth(from).tap();
      await expect(stacks.nth(from)).toHaveAttribute('aria-pressed', 'true');
      await stacks.nth(to).tap();
    }
    await expect(game.locator('.new-status')).toHaveText('Desafio concluído!');
    await expect(game.locator('.sort-board button:enabled')).toHaveCount(0);
    await expect(game.locator('.new-hud strong').nth(1)).not.toHaveText('0');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await game.getByRole('button', { name: 'Reiniciar', exact: true }).tap();
    await expect(stacks.first()).toBeEnabled();
    await expect(stacks.first()).toHaveAttribute('data-stack', values[0].join(','));
    if (difficulty === 2) {
      await game.locator('.sort-board').scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`${id}-${width}.png`) });
    }
  });
}
for (const id of ['colorsort', 'watersort']) test(`${id} preserves source on rejection and native keyboard activation`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(`./#/jogar/${id}`);
  const game = page.locator('.board-expansion'), stacks = game.locator('.sort-board button');
  await expect(stacks).toHaveCount(5);
  const statusHeight = (await game.locator('.new-status').boundingBox())!.height;
  await stacks.first().focus(); await page.keyboard.press('Enter');
  await expect(stacks.first()).toHaveAttribute('aria-pressed', 'true');
  expect(Math.abs((await game.locator('.new-status').boundingBox())!.height - statusHeight)).toBeLessThanOrEqual(1);
  const before = await stacks.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-stack')));
  await stacks.nth(1).tap();
  await expect(game.locator('.new-status')).toContainText('origem continua selecionada');
  await expect(stacks.first()).toHaveAttribute('aria-pressed', 'true');
  expect(await stacks.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-stack')))).toEqual(before);
  await expect(game.locator('.new-hud strong').first()).toHaveText('0');
  await game.getByRole('button', { name: 'Pausar', exact: true }).tap();
  await expect(game.locator('.sort-board')).toHaveCount(0);
  await game.locator('.new-pause').getByRole('button', { name: 'Continuar', exact: true }).tap();
  await expect(stacks.first()).toHaveAttribute('aria-pressed', 'true');
  await stacks.last().focus(); await page.keyboard.press('Space');
  await expect(game.locator('.new-hud strong').first()).toHaveText('1');
  await game.getByRole('button', { name: 'Desfazer', exact: true }).tap();
  expect(await stacks.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-stack')))).toEqual(before);
});
