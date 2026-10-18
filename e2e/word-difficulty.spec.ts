import { expect, test } from '@playwright/test';
import { question } from '../src/lib/quizExpansion';

for (const width of [320, 390]) for (const id of ['hangman', 'anagram']) {
  test(`${id} offers understandable playable difficulty bands at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./#/jogar/${id}`);
    const game = page.locator('.quiz-expansion');
    for (const level of [0, 1, 2]) {
      await game.getByLabel('Dificuldade', { exact: true }).selectOption(String(level));
      const q = question(id, level, 1, 0);
      const [min, max] = [[5, 6], [7, 8], [9, 11]][level];
      await expect(page.locator('#quiz-difficulty-description')).toContainText(`${min} a ${max}`);
      if (id === 'hangman') {
        const letters = game.locator('.hangman-word span');
        const keyBounds = await game.locator('.letter-picker button').first().boundingBox();
        expect(keyBounds!.width).toBeGreaterThanOrEqual(44);
        expect(keyBounds!.height).toBeGreaterThanOrEqual(44);
        expect(await letters.count()).toBeGreaterThanOrEqual(min);
        expect(await letters.count()).toBeLessThanOrEqual(max);
        const limit = [8, 6, 5][level];
        await expect(game).toContainText(`Erros: 0 / ${limit}`);
        const wrong = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(letter => !q.answer.includes(letter)).slice(0, limit);
        for (const letter of wrong) await game.getByRole('button', { name: letter, exact: true }).click();
        await expect(game.locator('.new-status')).toContainText('Tentativas encerradas.');
        await expect(game.getByRole('heading', { name: 'Palavra não descoberta', exact: true })).toBeVisible();
        await expect(game.locator('.letter-picker button:enabled')).toHaveCount(0);
        await expect(game).toContainText(`Erros: ${limit} / ${limit}`);
      } else {
        await game.getByRole('textbox').fill(q.answer);
        await game.getByRole('button', { name: 'Confirmar resposta', exact: true }).click();
        await expect(game.locator('.new-status')).toContainText('Resposta certa!');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
    await page.locator('.quiz-stage').scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`${id}-${width}.png`) });
  });
}
