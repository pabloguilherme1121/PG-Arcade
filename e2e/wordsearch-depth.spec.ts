import { expect, test } from '@playwright/test';
import { visibleWordPaths } from './wordsearch-helpers';
test.use({ hasTouch: true });

for (const width of [320, 390, 844]) test(`wordsearch has distinct playable levels and fair records at ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/jogar/wordsearch');
  const level = page.locator('.quiz-expansion').getByLabel('Dificuldade', { exact: true });
  const cells = page.locator('.wordsearch-grid button');
  for (const difficulty of [0, 1, 2]) {
    await level.selectOption(String(difficulty));
    await expect(page.locator('.wordsearch-list li')).toHaveCount(4 + difficulty);
    await expect(page.locator('.new-hud strong').nth(1)).toHaveText('0');
    const originalLetters = await cells.allTextContents();
    const paths = await visibleWordPaths(page);
    await page.locator('.wordsearch-grid').scrollIntoViewIfNeeded();
    expect((await cells.first().boundingBox())!.height).toBeGreaterThanOrEqual(40);
    if (width === 844) expect((await page.locator('.wordsearch-grid').boundingBox())!.height).toBeLessThanOrEqual(390);
    for (const { from, to } of paths) {
      await cells.nth(from).tap(); await cells.nth(to).tap();
    }
    await expect(page.locator('.new-status')).toHaveText('Todas as palavras encontradas!');
    await expect(page.getByRole('heading', { name: 'Grade concluída!', exact: true })).toBeVisible();
    await expect(page.locator('.wordsearch-list [data-found=true]')).toHaveCount(4 + difficulty);
    await expect(page.locator('.new-hud strong').nth(1)).toHaveText(String((4 + difficulty) * 250 * (difficulty + 1)));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (difficulty === 2) {
      await page.locator('.wordsearch-grid').scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`wordsearch-${width}.png`) });
    }
    await page.getByRole('button', { name: 'Novo desafio', exact: true }).click();
    await expect(page.locator('.wordsearch-list [data-found=true]')).toHaveCount(0);
    expect(await cells.allTextContents()).not.toEqual(originalLetters);
  }
  await page.reload();
  await level.selectOption('0');
  await expect(page.locator('.new-hud strong').nth(1)).toHaveText('1000');
});
