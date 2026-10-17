import { expect, test, type Page } from "@playwright/test";

// Physical Android remains a separate acceptance step. These scenarios use
// real Playwright touch input and exercise the viewport-fullscreen fallback.
test.use({ hasTouch: true });

async function openImmersiveFallback(page: Page) {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new Error("viewport fallback"));
  });
}

async function enterImmersive(page: Page) {
  const collapsed = page.locator(".player-utilities:not([open]) summary");
  if (await collapsed.count()) await collapsed.tap();
  await page.getByRole("button", { name: "Tela cheia", exact: true }).tap();
  await expect(page.locator(".player")).toHaveAttribute("data-viewport-fullscreen", "true");
  await expect(page.locator(".player")).toHaveAttribute("data-immersive", "true");
  const exit = page.getByRole("button", { name: "Sair da tela cheia", exact: true });
  await expect(exit).toBeVisible();
  expect(await exit.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return hit !== null && (hit === element || element.contains(hit));
  })).toBe(true);
}

async function leaveImmersiveAndReturn(page: Page) {
  await page.getByRole("button", { name: "Sair da tela cheia", exact: true }).tap();
  await expect(page.locator(".player")).toHaveAttribute("data-immersive", "false");
  await expect(page.locator(".site-header")).not.toHaveAttribute("inert");
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await page.getByRole("link", { name: "Voltar aos jogos", exact: true }).tap();
  await expect(page.locator(".game-card").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}

for (const width of [320, 390]) {
  test(`Snake retains touch controls through fullscreen, pause, restart and catalog at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 844 });
    await openImmersiveFallback(page);
    await page.goto("./#/jogar/snake");
    await expect(page.locator(".snake-board")).toBeVisible();
    await enterImmersive(page);
    await page.getByRole("button", { name: "Jogar", exact: true }).tap();
    await page.getByRole("button", { name: "Pausar", exact: true }).tap();
    await expect(page.locator(".game-status")).toContainText("Partida pausada");
    await page.getByRole("button", { name: "Continuar", exact: true }).tap();
    await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Nova partida", exact: true }).tap();
    await expect(page.getByRole("button", { name: "Jogar", exact: true })).toBeVisible();
    await leaveImmersiveAndReturn(page);
  });

  test(`Memória retains selected difficulty and touch cards through fullscreen pause and restart at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 844 });
    await openImmersiveFallback(page);
    await page.goto("./#/jogar/memoria");
    const difficulty = page.getByLabel("Dificuldade da memória", { exact: true });
    await difficulty.selectOption("4");
    const cards = page.locator(".memory-card");
    await expect(cards).toHaveCount(8);
    await enterImmersive(page);
    await cards.first().tap();
    await expect(cards.first()).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Pausar", exact: true }).tap();
    await expect(page.locator(".memory-card:disabled")).toHaveCount(8);
    await page.getByRole("button", { name: "Continuar", exact: true }).tap();
    await expect(cards.first()).toBeEnabled();
    await page.getByRole("button", { name: "Nova partida", exact: true }).tap();
    await expect(cards.first()).toHaveAttribute("aria-pressed", "false");
    await expect(difficulty).toHaveValue("4");
    await leaveImmersiveAndReturn(page);
  });
}
