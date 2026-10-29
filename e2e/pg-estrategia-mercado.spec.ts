import { test, expect } from "@playwright/test";
test.use({ hasTouch: true });

test("Mercado de Rotas: contratos completos, recorde local e reinício no celular",async ({page})=>{
 await page.setViewportSize({width:320,height:720});
 await page.goto("./estrategia/independentes/mercado-de-rotas/");
 await expect(page.getByRole("heading",{name:/Mercado de Rotas/i})).toBeVisible();
 await page.locator("#product").selectOption("graos");
 await page.locator("#units").selectOption("2");
 await page.locator("#buy").tap();
 await page.locator('[data-city="3"]').tap();
 await page.locator("#sell").tap();
 await page.locator('[data-city="2"]').tap();
 await page.locator("#product").selectOption("metal");
 await page.locator("#units").selectOption("1");
 await page.locator("#buy").tap();
 await page.locator('[data-city="3"]').tap();
 await page.locator('[data-city="0"]').tap();
 await page.locator("#sell").tap();
 await expect(page.locator("#game-status")).toContainText("Vitória");
 await expect(page.locator("#record")).toContainText("Recorde");
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator("#restart").click();
 await expect(page.locator("#game-status")).not.toContainText("Vitória");
});
test("Mercado de Rotas: modos, pausa, teclado e derrota por prazo",async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("./estrategia/independentes/mercado-de-rotas/");
 await page.locator("#trade-mode").selectOption("lucro");
 await page.locator("#trade-difficulty").selectOption("veterano");
 await page.locator("#pause").click();
 await expect(page.locator("#pause")).toHaveAttribute("aria-pressed","true");
 await page.locator("#pause").press("Enter");
 await expect(page.locator("#pause")).toHaveAttribute("aria-pressed","false");
 for(let i=0;i<11;i++) await page.locator("#rest").click();
 await expect(page.locator("#game-status")).toContainText("Fim do prazo");
 await expect(page.locator("#rest")).toBeDisabled();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
