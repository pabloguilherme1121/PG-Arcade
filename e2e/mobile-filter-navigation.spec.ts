import { expect, test } from '@playwright/test';
test.use({ hasTouch: true });

for (const width of [320, 360, 390, 430]) {
  test(`mobile search and selected filters remain reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('pg-arcade-catalog-v1'))
        sessionStorage.setItem('pg-arcade-catalog-v1', JSON.stringify({ query: 'xadrez', category: 'Estratégia', mode: 'Dupla local' }));
    });
    await page.goto('./');
    const search = page.getByRole('textbox', { name: 'Buscar jogo', exact: true });
    await expect(search).toHaveValue('xadrez');
    await expect(page.locator('.game-grid .game-card')).toHaveCount(1);
    const selected = page.getByRole('group', { name: 'Categorias', exact: true }).locator('[aria-pressed="true"]');
    await expect(selected).toHaveText(/Estratégia/);
    await expect.poll(() => selected.evaluate(el => {
      const chip = el.getBoundingClientRect(), row = el.parentElement!.getBoundingClientRect();
      return chip.left >= row.left - 1 && chip.right <= row.right + 1;
    })).toBe(true);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(() => selected.evaluate(el => {
      const chip=el.getBoundingClientRect(), row=el.parentElement!.getBoundingClientRect();
      return chip.left>=row.left-1 && chip.right<=row.right+1;
    })).toBe(true);
    await expect(search).toHaveValue('xadrez');
    const edit = page.getByRole('button', { name: 'Editar busca', exact: true });
    await edit.tap();
    await expect(search).toBeFocused();
    await expect(search).toHaveValue('xadrez');
    await expect(page.getByLabel('Filtrar por modo', { exact: true })).toHaveValue('Dupla local');
    await search.press('Enter');
    await expect(search).not.toBeFocused();
    await expect(search).toHaveValue('xadrez');
    await expect(page.locator('.game-grid .game-card')).toHaveCount(1);
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    const nav = page.getByRole('navigation', { name: 'Navegação principal' });
    for (const link of await nav.getByRole('link').all()) {
      const box = (await link.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
