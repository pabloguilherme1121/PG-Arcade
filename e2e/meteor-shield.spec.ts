import { test, expect } from "@playwright/test";
import { advanceMeteor, moveShield, newMeteorGame } from "../src/games/meteorShield/rules";

test("Meteoros aceita setas e Espaço sem gastar dois movimentos no mesmo turno", async ({ page }) => {
  await page.goto("./#/jogar/meteoros");
  const arena = page.getByRole("group", { name: "Campo de meteoros e escudo" });
  await arena.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-shield-active="true"]')).toHaveAttribute("data-shield-column", "2");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-shield-active="true"]')).toHaveAttribute("data-shield-column", "2");
  await page.keyboard.press("Space");
  await expect(page.locator(".meteor-radar")).toContainText("Turno 1.");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-shield-active="true"]')).toHaveAttribute("data-shield-column", "3");
  await expect(arena).toBeFocused();
  await expect(page.locator('[data-meteor-path="true"]')).toHaveCount(6);
});

for (const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]) {
  test(`Defensor de Meteoros responde ao toque sem overflow em ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/meteoros");
    const panel = page.locator("[data-meteor-shield]");
    await expect(panel).toBeVisible();
    await expect(panel.locator(".meteor-cell")).toHaveCount(42);
    await panel.getByRole("button", { name: "Mover escudo à esquerda" }).click();
    await expect(panel.getByRole("button", { name: "Mover escudo à direita" })).toBeDisabled();
    await panel.getByRole("button", { name: "Avançar tempo" }).click();
    await expect(panel.getByRole("button", { name: "Mover escudo à direita" })).toBeEnabled();
    await panel.getByRole("button", { name: "Desfazer ação" }).click();
    await panel.getByRole("button", { name: "Reiniciar" }).click();
    await panel.getByLabel("Dificuldade de Defensor de Meteoros").selectOption("2");
    await expect(panel).toContainText("0/6");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("Defensor de Meteoros reflete toda a chuva e permite undo da vitória", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/meteoros");
  const panel = page.locator("[data-meteor-shield]");
  let game = newMeteorGame();
  for (let t = 0; t < 50 && game.phase === "playing"; t++) {
    const target = game.schedule[Math.min(Math.floor(game.tick / 7), game.schedule.length - 1)];
    if (game.shield !== target) {
      const direction = game.shield < target ? 1 : -1;
      await panel.getByRole("button", { name: direction === 1 ? "Mover escudo à direita" : "Mover escudo à esquerda" }).click();
      game = moveShield(game, direction);
    }
    await panel.getByRole("button", { name: "Avançar tempo" }).click();
    game = advanceMeteor(game);
    if (await panel.getByText(/Vitória!/).count()) break;
  }
  await expect(panel).toContainText("Vitória!");
  await expect(panel).toContainText("4/4");
  await panel.getByRole("button", { name: "Desfazer ação" }).click();
  await expect(panel).not.toContainText("Vitória!");
});

test("Defensor de Meteoros conclui a campanha com vida restante após um impacto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/meteoros");
  const panel = page.locator("[data-meteor-shield]");
  let game = newMeteorGame(0, 23);
  for (let step = 0; step < 60 && game.phase === "playing"; step++) {
    if (game.tick >= 5) {
      const target = game.schedule[Math.min(Math.floor((game.tick + 2) / 7), game.schedule.length - 1)];
      if (game.shield !== target) {
        const direction = game.shield < target ? 1 : -1;
        await panel.getByRole("button", { name: direction === 1 ? "Mover escudo à direita" : "Mover escudo à esquerda" }).click();
        game = moveShield(game, direction);
      }
    }
    await panel.getByRole("button", { name: "Avançar tempo" }).click();
    game = advanceMeteor(game);
  }
  expect(game.phase).toBe("won");
  await expect(panel).toContainText("3/4");
  await expect(panel).toContainText("2/3");
  await expect(panel).toContainText("Vitória!");
  await panel.getByRole("button", { name: "Desfazer ação" }).click();
  await expect(panel).not.toContainText("Vitória!");
});
