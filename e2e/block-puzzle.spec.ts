import { expect, test } from "@playwright/test";

for (const viewport of [{width: 320, height: 740}, {width: 844, height: 390}]) {
  test(`Blocos Infinito playable with touch-sized targets and no overflow at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/blocos");
    await expect(page.getByRole("heading", { name: "Blocos Infinito" })).toBeVisible();
    await expect(page.locator("[data-blocks-board] button")).toHaveCount(64);
    await page.getByRole("button", { name: /Peça 1 com/ }).click();
    await page.getByRole("button", { name: "Linha 1, coluna 1, livre" }).click();
    await expect.poll(async () => Number(await page.locator("[data-blocks-score]").textContent())).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "Desfazer" })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.reload();
    await expect.poll(async () => Number(await page.locator(".scores strong").nth(1).textContent())).toBeGreaterThan(0);
  });
}
test("Blocos Infinito accepts keyboard arrows and recovers after undo", async ({page}) => {
  await page.goto("./#/jogar/blocos");
  const first = page.getByRole("button", { name: "Linha 1, coluna 1, livre" });
  await first.focus();
  await expect(page.locator('[data-blocks-board] button[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-blocks-board] [data-cell="1"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(async () => Number(await page.locator("[data-blocks-score]").textContent())).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(page.locator("[data-blocks-score]")).toHaveText("0");
});

test("game-specific help remains keyboard-accessible on the player route", async ({ page }) => {
  await page.goto("./#/jogar/blocos");
  const help = page.locator(".experience-tools details");
  await help.locator("summary").click();
  await expect(help).toContainText("Preencha linhas ou colunas para limpá-las");
});

for (const width of [320, 390, 844]) {
  test(`drag preview commits once and cancellation never places a piece at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    await page.goto('./#/jogar/blocos');
    const tray = page.getByRole('button', { name: /Peça 1 com/ });
    await tray.scrollIntoViewIfNeeded();
    const target = page.locator('[data-blocks-board] [data-cell="0"]');
    // Keep both the tray and top of the board visible for a real pointer gesture.
    await page.evaluate(() => document.querySelector('[data-blocks-board]')?.scrollIntoView({ block: 'start' }));
    const start = await tray.boundingBox(), end = await target.boundingBox();
    expect(start).not.toBeNull(); expect(end).not.toBeNull();
    await page.mouse.move(start!.x + start!.width / 2, start!.y + 15);
    await page.mouse.down();
    await page.mouse.move(end!.x + end!.width / 2, end!.y + end!.height / 2, { steps: 8 });
    await expect(page.locator('.blocks-board .is-preview-valid').first()).toBeVisible();
    await page.mouse.up();
    await expect(page.locator('[data-blocks-moves]')).toHaveText('1');
    await expect(page.locator('.blocks-board .is-preview-valid')).toHaveCount(0);
    await page.getByRole('button', { name: 'Desfazer', exact: true }).click();
    await expect(page.locator('[data-blocks-moves]')).toHaveText('0');
    await page.evaluate(() => document.querySelector('[data-blocks-board]')?.scrollIntoView({ block: 'start' }));
    const cancelStart = (await tray.boundingBox())!, cancelEnd = (await target.boundingBox())!;
    await page.mouse.move(cancelStart.x + cancelStart.width / 2, cancelStart.y + 15);
    await page.mouse.down();
    await page.mouse.move(cancelEnd.x + cancelEnd.width / 2, cancelEnd.y + cancelEnd.height / 2, { steps: 8 });
    await expect(page.locator('.blocks-board .is-preview-valid').first()).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.locator('.blocks-board .is-preview-valid')).toHaveCount(0);
    await page.mouse.up();
    await expect(page.locator('[data-blocks-moves]')).toHaveText('0');
  });
}
