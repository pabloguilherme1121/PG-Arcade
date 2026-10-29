import { test, expect } from "@playwright/test";
test.use({ hasTouch: true });

for (const width of [320, 390]) {
  test(`PG Bot atende no Arcade em ${width}px sem rolagem horizontal`, async ({ page }) => {
    await page.setViewportSize({ width, height: 760 });
    await page.goto("./");
    const launcher = page.getByRole("button", { name: "Abrir ajuda PG Bot" });
    await expect(launcher).toBeVisible();
    await launcher.tap();
    await expect(page.locator("#pg-bot-panel")).toBeVisible();
    await page.getByRole("button", { name: "150 jogos?" }).click();
    await expect(page.getByRole("log")).toContainText("150 missões em 6 sistemas");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("textbox", { name: "Pergunta para o PG Bot" }).press("Escape");
    await expect(page.locator("#pg-bot-panel")).toBeHidden();
    await expect(launcher).toBeFocused();
  });
}
test("PG Bot identifica missão no PG Estratégia e responde sem rede", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("./estrategia/");
  await page.getByRole("button", { name: "Abrir ajuda PG Bot" }).click();
  await page.getByRole("textbox", { name: "Pergunta para o PG Bot" }).fill("Como salvo meu progresso?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByRole("log")).toContainText("próprio navegador");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
