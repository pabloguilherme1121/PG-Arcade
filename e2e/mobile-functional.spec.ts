import { expect, test } from "@playwright/test";
for (const width of [320, 360, 390, 430]) {
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
// Independent journeys retain all assertions without carrying a full-catalog
// rerender/trace capture into the next action's deadline on Firefox.
test("solo mode keeps bot games", async ({ page }) => {
  await page.goto("./");
  await page.getByLabel("Buscar jogo", { exact: true }).fill("xadrez");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await page.getByLabel("Filtrar por modo").selectOption("Solo");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await expect(page.getByRole("link", {name:/^Jogar Xadrez/})).toBeVisible();
});
test("incompatible local-duel styles reset without hiding supported games", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Sobrevivência", exact: true }).click();
  await page.getByLabel("Filtrar por modo").selectOption("Dupla local");
  await expect(page.locator(".game-card")).toHaveCount(10);
  const visibleIds = await page.locator(".game-card").evaluateAll(cards =>
    cards.map(card => card.getAttribute("data-catalog-game")).sort()
  );
  expect(visibleIds).toEqual(["cofre","comum","contrato","damas","domino","leilao","liga4","passagem","velha","xadrez"]);
  await expect(page.getByRole("button", { name: "Sobrevivência", exact: true })).toBeDisabled();
});
test("puzzle exposes real swipe handling and configuration-specific records", async ({ page }) => {
  await page.goto("./#/jogar/puzzle");
  await expect(page.locator(".sliding-board")).toHaveAttribute("data-touch-swipe", "true");
  await page.getByLabel("Dificuldade do Quebra-cabeça").selectOption("12");
  await expect(page.locator(".scores")).toContainText("—");
  await page.locator(".sliding-board").scrollIntoViewIfNeeded();
  const tile = page.locator(".sliding-board button:not(:disabled)").first();
  const from = (await tile.boundingBox())!;
  const to = (await page.locator(".sliding-board [role=img]").boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator(".scores strong").first()).toHaveText("1");
  await expect(page.locator(".board-column > .session-options")).toContainText("reinicia a partida");
});

test("word keyboard choice avoids duplicate virtual keyboards and retains the draft", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/palavra");
  const input = page.getByLabel("Sua palavra", { exact: true });
  await expect(input).toHaveAttribute("inputmode", "none");
  await page.getByRole("button", { name: "Letra C", exact: true }).click();
  await expect(input).toHaveValue("C");
  await page.getByLabel("Teclado da Palavra Secreta").selectOption("device");
  await expect(input).toHaveAttribute("inputmode", "text");
  await expect(page.getByRole("group", { name: "Teclado de letras na tela" })).toHaveCount(0);
  await expect(input).toHaveValue("C");
  await input.fill("CASAS");
  await page.getByLabel("Teclado da Palavra Secreta").selectOption("screen");
  await expect(input).toHaveValue("CASAS");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("Liga 4 offers a broad touch control that plays exactly one selected column", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/liga4");
  await page.getByLabel("Coluna do Liga 4", { exact: true }).selectOption("3");
  const drop = page.getByRole("button", { name: "Soltar peça", exact: true });
  expect((await drop.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await drop.click();
  await expect(page.locator(".connect-board .disc-1")).toHaveCount(1);
  await expect(page.locator('.connect-board [data-cell="38"]')).toHaveClass(/disc-1/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("fullscreen allows changing session mode without hiding its only selector", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => { Element.prototype.requestFullscreen = () => Promise.reject(Error("viewport")); });
  await page.goto("./#/jogar/snake");
  await page.locator(".player-utilities summary").click();
  await page.getByRole("button", { name: "Tela cheia", exact: true }).click();
  await expect(page.locator(".player-utilities")).not.toHaveAttribute("open", "");
  await page.locator(".session-mode-cards").getByRole("button", { name: /Sprint/ }).click();
  await expect(page.getByLabel("Dificuldade do desafio de tempo")).toBeVisible();
  await expect(page.locator(".session-challenge")).toHaveAttribute("data-session-mode", "sprint");
  await page.keyboard.press("Escape");
  await expect(page.locator(".player")).toHaveAttribute("data-immersive", "false");
});
