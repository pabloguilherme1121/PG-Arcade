import { expect, test } from '@playwright/test';

test('Blocos completes a deterministic round, saves the result and recovers with undo', async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript(() => { Date.now = () => 42; });
  await page.goto('./#/jogar/blocos');
  await expect(page.locator('[data-blocks-board] button')).toHaveCount(64);
  for (let turn = 0; turn < 40; turn++) {
    const placement = await page.evaluate(() => {
      const board = Array.from(document.querySelectorAll('[data-blocks-board] button'), b => b.classList.contains('is-filled'));
      const trays = Array.from(document.querySelectorAll<HTMLButtonElement>('.blocks-tray button'));
      for (let piece = 0; piece < trays.length; piece++) {
        if (trays[piece].disabled) continue;
        const cells = Array.from(trays[piece].querySelectorAll('.blocks-piece-grid span')).flatMap((cell, i) => cell.classList.contains('is-filled') ? [[Math.floor(i / 4), i % 4]] : []);
        for (let anchor = 0; anchor < 64; anchor++) {
          if (cells.every(([r, c]) => Math.floor(anchor / 8) + r < 8 && anchor % 8 + c < 8 && !board[(Math.floor(anchor / 8) + r) * 8 + anchor % 8 + c])) return { piece, anchor };
        }
      }
      return null;
    });
    if (!placement) break;
    await page.locator('.blocks-tray button').nth(placement.piece).click();
    await page.locator(`[data-blocks-board] [data-cell="${placement.anchor}"]`).click();
    await expect(page.locator('[data-blocks-moves]')).toHaveText(String(turn + 1));
  }
  await expect(page.locator('.blocks-layout .game-status')).toContainText('Fim de jogo');
  await expect(page.locator('[data-blocks-moves]')).toHaveText('31');
  await expect(page.locator('[data-blocks-score]')).toHaveText('1860');
  await expect(page.locator('[data-blocks-board] button:disabled')).toHaveCount(64);
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click();
  await expect(page.locator('[data-blocks-moves]')).toHaveText('30');
  await expect(page.locator('[data-blocks-board] button:disabled')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!).recordsV2['blocos|free|1'])).toBe(1860);
});

test('touch drag previews collisions, cancels safely and commits exactly once', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native touch input uses Chromium CDP; pointer and keyboard tests run across browsers.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/jogar/blocos');
  await page.locator('[data-blocks-board]').scrollIntoViewIfNeeded();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const client = await page.context().newCDPSession(page);
  const tray = page.locator('.blocks-tray button');
  const cell = page.locator('[data-blocks-board] [data-cell="0"]');
  await expect(tray.nth(0)).toHaveAccessibleDescription(/linha 1, coluna 1/);
  async function gesture(piece: number, cancel = false) {
    const start = (await tray.nth(piece).boundingBox())!, end = (await cell.boundingBox())!;
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x + 20, y: start.y + 20, id: 1 }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: end.x + end.width / 2, y: end.y + end.height / 2, id: 1 }] });
    await expect(page.locator(`.blocks-board .is-preview-${piece === 0 ? 'valid' : 'invalid'}`).first()).toBeVisible();
    await client.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  }
  await gesture(0, true);
  await expect(page.locator('[data-blocks-moves]')).toHaveText('0');
  await expect(page.locator('.blocks-board .is-preview-valid')).toHaveCount(0);
  await gesture(0);
  await expect(page.locator('[data-blocks-moves]')).toHaveText('1');
  await gesture(1);
  await expect(page.locator('[data-blocks-moves]')).toHaveText('1');
  await expect(page.locator('.blocks-layout .game-status')).toContainText('não cabe');
  await tray.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(tray.nth(2)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});
