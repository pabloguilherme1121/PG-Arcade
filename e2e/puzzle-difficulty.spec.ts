import { expect, test } from '@playwright/test';
import { solveKnight, solveMagic, solveQueens } from './puzzle-solvers';
test.use({ hasTouch: true });

for (const id of ['queens', 'magic', 'knight']) for (const width of [320, 390, 844]) for (const difficulty of [0, 1, 2]) {
  if (width === 844 && difficulty !== 2) continue;
  test(`${id} completes real level ${difficulty} by touch at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./#/jogar/${id}`);
    const game = page.locator('.board-expansion'), grid = game.locator('.new-grid');
    await game.getByLabel('Dificuldade', { exact: true }).selectOption(String(difficulty));
    await expect(page.locator('#board-difficulty-description')).toBeVisible();
    const values = await grid.locator('button').evaluateAll(nodes => nodes.map(node => Number(node.getAttribute('data-value'))));
    if (id === 'knight') {
      expect(values).toHaveLength(difficulty === 2 ? 36 : 25);
      expect(values.filter(Boolean)).toHaveLength(difficulty === 0 ? 5 : 1);
      await expect(grid.locator('.selected')).toHaveAttribute('tabindex', '0');
    } else await expect(grid.locator('.fixed')).toHaveCount(id === 'queens' ? [3,1,0][difficulty] : [4,2,0][difficulty]);
    const wrap = game.locator('.new-board-wrap');
    await wrap.scrollIntoViewIfNeeded();
    expect(await grid.evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
    if (width === 844) expect((await wrap.boundingBox())!.height).toBeLessThanOrEqual(390);
    if (id === 'magic') {
      const solution = solveMagic(values), picker = game.locator('.magic-value-picker');
      const key = (await picker.locator('button').first().boundingBox())!;
      // Firefox reports 44 CSS px as 43.99998474121094 after scrolling.
      expect(Math.round(key.width * 100) / 100).toBeGreaterThanOrEqual(44);
      expect(Math.round(key.height * 100) / 100).toBeGreaterThanOrEqual(44);
      for (let cell = 0; cell < 9; cell++) if (!values[cell]) {
        await picker.getByRole('button', { name: String(solution[cell]), exact: true }).tap();
        await grid.locator(`[data-index="${cell}"]`).tap();
      }
    } else for (const cell of id === 'queens' ? solveQueens(values) : solveKnight(values)) await grid.locator(`[data-index="${cell}"]`).tap();
    await expect(game.locator('.new-status')).toHaveText('Desafio concluído!');
    await expect(grid.locator('button:enabled')).toHaveCount(0);
    await expect(game.locator('.new-hud strong').nth(1)).not.toHaveText('0');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (difficulty === 2) {
      await wrap.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`${id}-${width}.png`) });
    }
  });
}

for (const width of [320, 390]) test(`queens explains attacks and undo clears feedback at ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('./#/jogar/queens');
  const game = page.locator('.board-expansion');
  await game.getByLabel('Dificuldade', { exact: true }).selectOption('2');
  await game.locator('[data-index="0"]').tap(); await game.locator('[data-index="9"]').tap();
  await expect(game.locator('.new-status')).toContainText('2 rainhas em conflito');
  await expect(game.locator('[data-conflict="true"]')).toHaveCount(2);
  await expect(game.locator('.queen-conflict-mark')).toHaveCount(2);
  await expect(game.locator('[data-index="9"]')).toHaveAccessibleName(/em conflito/);
  await expect(game.locator('[data-index="0"]')).toHaveCSS('background-color', 'rgb(83, 44, 54)');
  await game.locator('.new-board-wrap').scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath(`queen-conflicts-${width}.png`) });
  await game.getByRole('button', { name: 'Desfazer', exact: true }).tap();
  await expect(game.locator('[data-conflict="true"]')).toHaveCount(0);
  await expect(game.locator('.new-status')).toContainText('1 de 8 rainhas, sem conflitos');
});

test('magic number keys keep native keyboard activation and pause disables them', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('./#/jogar/magic');
  const game = page.locator('.board-expansion'), picker = game.locator('.magic-value-picker');
  const seven = picker.getByRole('button', { name: '7', exact: true });
  await seven.focus(); await seven.press('Enter');
  await expect(seven).toHaveAttribute('aria-pressed', 'true');
  await expect(game.locator('[data-index="1"]')).toHaveAttribute('data-value', '0');
  await game.getByRole('button', { name: 'Pausar', exact: true }).tap();
  await expect(picker.locator('button:disabled')).toHaveCount(10);
  await game.locator('.new-pause').getByRole('button', { name: 'Continuar', exact: true }).tap();
  await expect(seven).toBeEnabled();
  await expect(seven).toHaveAttribute('aria-pressed', 'true');
});

test('board records keep legacy marks and separate solved levels across reload', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('pg-arcade-progress-v1')) localStorage.setItem('pg-arcade-progress-v1', JSON.stringify({ records: { queens: 9999 } }));
  });
  await page.goto('./#/jogar/queens');
  const game = page.locator('.board-expansion'), level = game.getByLabel('Dificuldade', { exact: true });
  await expect(game.locator('.new-hud strong').nth(1)).toHaveText('0');
  const values = await game.locator('.new-grid button').evaluateAll(nodes => nodes.map(node => Number(node.getAttribute('data-value'))));
  for (const cell of solveQueens(values)) await game.locator(`[data-index="${cell}"]`).tap();
  await expect(game.locator('.new-status')).toHaveText('Desafio concluído!');
  await expect(game.locator('.new-hud strong').nth(1)).not.toHaveText('0');
  const record = await game.locator('.new-hud strong').nth(1).innerText();
  expect(Number(record)).toBeGreaterThan(0);
  await level.selectOption('2');
  await expect(game.locator('.new-hud strong').nth(1)).toHaveText('0');
  await page.reload();
  await expect(game.locator('.new-hud strong').nth(1)).toHaveText(record);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!));
  expect(saved.records.queens).toBe(9999);
  expect(saved.recordsV2['queens|free|1']).toBe(Number(record));
});
