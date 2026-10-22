import { test, expect } from "@playwright/test";
import { newFortressGame } from "../src/games/turnFortress/rules";
for (const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]) {
  test(`Fortalezas de Turnos vence ondas com defesa real em ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/fortalezas");
    const game = page.locator("[data-turn-fortress]");
    await expect(game).toBeVisible();
    await expect(game.locator("[data-fortress-lane]")).toHaveCount(3);
    const plan = newFortressGame().waves.slice(0, 3);
    for (const wave of plan) await game.getByRole("button", { name: `Defender linha ${wave.lane + 1}` }).click();
    for (let i = 0; i < 15; i++) {
      if (await game.getByText(/Vitória!/).count()) break;
      await game.getByRole("button", { name: "Avançar turno" }).click();
    }
    await expect(game).toContainText("Vitória!");
    await expect(game).toContainText("4/4");
    await game.getByRole("button", { name: "Desfazer turno" }).click();
    await expect(game).not.toContainText("Vitória!");
    await game.getByRole("button", { name: "Reiniciar" }).click();
    await expect(game).toContainText("0/6");
    await game.getByLabel("Dificuldade de Fortalezas de Turnos").selectOption("2");
    await expect(game).toContainText("0/10");
    await game.getByRole("button", { name: "Nova batalha" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
