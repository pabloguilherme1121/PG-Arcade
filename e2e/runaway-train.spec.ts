import { test, expect } from "@playwright/test";
import { advanceTrain, newTrainGame, toggleRailSwitch } from "../src/games/runawayTrain/rules";
for (const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]) {
  test(`Trem Sem Freio entrega todas as cargas e permite desfazer em ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/trem");
    const panel = page.locator("[data-runaway-train]");
    await expect(panel).toBeVisible();
    await expect(panel.locator("[data-train-position]")).toHaveCount(12);
    let model = newTrainGame();
    for (let tick = 0; tick < 28 && model.phase === "playing"; tick++) {
      const entering = model.trains.find(t => t.position === 1);
      if (entering) {
        const needsSwitch = entering.lane !== entering.destination;
        if (model.switches[0] !== needsSwitch) {
          await panel.getByRole("button", { name: /Desvio 1:/ }).click();
          model = toggleRailSwitch(model, 0);
        }
      }
      await panel.getByRole("button", { name: "Avançar tráfego" }).click();
      model = advanceTrain(model);
    }
    expect(model.phase).toBe("won");
    await expect(panel).toContainText("Vitória!");
    await expect(panel).toContainText("3/3");
    await panel.getByRole("button", { name: "Desfazer ação" }).click();
    await expect(panel).not.toContainText("Vitória!");
    await panel.getByRole("button", { name: "Reiniciar" }).click();
    await expect(panel).toContainText("0/3");
    await panel.getByLabel("Dificuldade do Trem Sem Freio").selectOption("2");
    await expect(panel).toContainText("0/5");
    await panel.getByRole("button", { name: "Nova rota" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
