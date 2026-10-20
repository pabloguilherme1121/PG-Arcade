import { test, expect } from "@playwright/test";

for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test("Neon survives, upgrades, pauses and restarts at " + viewport.width + "x" + viewport.height, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/neon");
    const arena = page.locator("[data-neon-survival]");
    await expect(arena).toBeVisible();
    await page.getByLabel("Dificuldade de Sobrevivência Neon").selectOption("easy");
    await page.getByRole("button", { name: "Começar sobrevivência" }).click();
    await expect(arena.getByRole("img", { name: /Arena 9 por 9/ })).toBeVisible();
    await page.getByRole("button", { name: "Pulso neon" }).click();
    await expect(arena.getByRole("button", { name: "Pulso neon" })).toBeDisabled();
    for (let i = 0; i < 5; i++) await page.keyboard.press(i % 2 ? "ArrowRight" : "ArrowLeft");
    await expect(arena.getByRole("group", { name: "Melhoria da próxima onda" })).toBeVisible();
    await page.getByRole("button", { name: "Reforçar escudo (+1)", exact: true }).click();
    await expect(arena.getByRole("status")).toHaveText("Partida em andamento.");
    await page.evaluate(() => window.dispatchEvent(new Event("pg-arcade-pause")));
    await expect(arena.getByRole("status")).toContainText("Partida pausada");
    const frozen = await arena.getByRole("progressbar", { name: "Movimentos do desafio" }).getAttribute("aria-valuenow");
    await page.keyboard.press("ArrowDown");
    await expect(arena.getByRole("progressbar", { name: "Movimentos do desafio" })).toHaveAttribute("aria-valuenow", frozen!);
    await arena.getByRole("button", { name: "Continuar", exact: true }).click();
    await arena.getByRole("button", { name: "Reiniciar", exact: true }).click();
    await expect(page.getByLabel("Dificuldade de Sobrevivência Neon")).toHaveValue("easy");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
