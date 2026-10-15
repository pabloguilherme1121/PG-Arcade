import { expect, test } from "@playwright/test";
for (const width of [320, 390]) {
  test(`mines supports enlarged touch targets without page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./#/jogar/minas");
    await page.getByRole("button", { name: "Ampliar casas", exact: true }).click();
    const scroll = page.getByRole("region", { name: "Tabuleiro ampliado, deslize para os lados" });
    expect(await scroll.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
    const cell = page.locator(".mines-board button").first();
    expect((await cell.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    await page.getByRole("button", { name: "Modo revelar", exact: true }).click();
    await cell.click();
    await expect(cell).toHaveAttribute("aria-label", "Casa 1: marcada");
    await expect(page.getByLabel("Dificuldade do Campo Minado")).toBeDisabled();
    await expect(page.locator("[data-mines-safe]")).toHaveText("0/54");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
test("solo mode keeps bot games and resolves incompatible local-duel styles", async ({ page }) => {
  await page.goto("./");
  await page.getByLabel("Filtrar por modo").selectOption("Solo");
  await page.getByLabel("Buscar jogo", { exact: true }).fill("xadrez");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Zerar filtros", exact: true }).click();
  await page.getByRole("button", { name: "Sobrevivência", exact: true }).click();
  await page.getByLabel("Filtrar por modo").selectOption("Dupla local");
  await expect(page.locator(".game-card")).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Sobrevivência", exact: true })).toBeDisabled();
});
test("puzzle exposes real swipe handling and configuration-specific records", async ({ page }) => {
  await page.goto("./#/jogar/puzzle");
  await expect(page.locator(".sliding-board")).toHaveAttribute("data-touch-swipe", "true");
  await page.getByLabel("Dificuldade do Quebra-cabeça").selectOption("12");
  await expect(page.locator(".scores")).toContainText("—");
  const tile = page.locator(".sliding-board button:not(:disabled)").first();
  const from = (await tile.boundingBox())!;
  const to = (await page.locator(".sliding-board [role=img]").boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator(".scores strong").first()).toHaveText("1");
  await expect(page.locator(".session-options")).toContainText("reinicia a partida");
});
