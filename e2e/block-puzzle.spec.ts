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
    await expect(page.locator("[data-player-record]")).toContainText("Sua melhor marca");
  });
}
test("Blocos Infinito accepts keyboard arrows and recovers after undo", async ({page}) => {
  await page.goto("./#/jogar/blocos");
  const first = page.getByRole("button", { name: "Linha 1, coluna 1, livre" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-blocks-board] [data-cell="1"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(async () => Number(await page.locator("[data-blocks-score]").textContent())).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(page.locator("[data-blocks-score]")).toHaveText("0");
});

test("game-specific help loads lazily without losing keyboard accessibility", async ({ page }) => {
  await page.goto("./#/jogar/blocos");
  const help = page.locator(".experience-tools details");
  await help.locator("summary").click();
  await expect(help).toContainText("Preencha linhas ou colunas para limpá-las");
});
