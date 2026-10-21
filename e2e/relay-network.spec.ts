import { expect, test } from "@playwright/test";
import { newRelayGame, relaySolution } from "../src/games/relayNetwork/rules";

for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`Rede de Relés conecta toda a rede, desfaz e reinicia em ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/reles");
    const game = page.locator("[data-relay-network]");
    await expect(game).toBeVisible();
    await expect(game.locator("[data-relay-cell]")).toHaveCount(25);
    await expect(game).toContainText("0/3");
    const initial = newRelayGame();
    for (const relay of relaySolution(initial)) {
      await game.locator(`[data-relay-cell="${relay}"]`).click();
    }
    await expect(game).toContainText("Vitória");
    await expect(game).toContainText("3/3");
    await game.getByRole("button", { name: "Desfazer" }).click();
    await expect(game).not.toContainText("Vitória");
    await game.getByRole("button", { name: "Reiniciar" }).click();
    await expect(game).toContainText("0/3");
    await game.getByLabel("Dificuldade da Rede de Relés").selectOption("2");
    await expect(game.locator("[data-relay-cell]")).toHaveCount(49);
    await expect(game).toContainText("0/5");
    await game.getByRole("button", { name: "Nova rede" }).click();
    await expect(game.locator("[data-relay-cell]")).toHaveCount(49);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
