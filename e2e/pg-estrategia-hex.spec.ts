import { test, expect } from "@playwright/test";

test.use({hasTouch: true});

for (const width of [320, 390]) {
  test("Hex Conexão: toque em tabuleiro hexagonal " + width + "px sem overflow", async ({page}) => {
    await page.setViewportSize({width,height:740});
    await page.goto("./estrategia/independentes/#hex-conexao");
    await expect(page.getByRole("heading",{name:"Hex Conexão"})).toBeVisible();
    await expect(page.locator(".hex-cell")).toHaveCount(49);
    await expect(page.locator(".hex-cell[data-owner='1']")).toHaveCount(0);
    await expect(page.locator(".hex-cell[data-owner='2']")).toHaveCount(0);
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.getByRole("button",{name:"Linha 1, coluna 1, livre"}).tap();
    await expect(page.locator(".hex-cell[data-owner='1']")).toHaveCount(1);
    await expect(page.locator(".hex-cell[data-owner='2']")).toHaveCount(1);
    await page.getByLabel("Dificuldade").selectOption("veterano");
    await expect(page.locator(".hex-cell[data-owner='1']")).toHaveCount(0);
    await page.getByRole("button",{name:"Reiniciar partida"}).tap();
    await expect(page.locator(".hex-cell[data-owner='1']")).toHaveCount(0);
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  });
}

test("Hex Conexão: integração com o portal e navegação bidirecional",async ({page}) => {
  await page.goto("./estrategia/");
  await page.getByRole("link",{name:/Hex Conexão · ligações táticas/}).click();
  await expect(page).toHaveURL(/\/estrategia\/independentes\/#hex-conexao$/);
  await expect(page.getByRole("heading",{name:"Hex Conexão"})).toBeVisible();
  await page.getByRole("navigation",{name:"Navegação entre os sites"}).getByRole("link",{name:"Missões Estratégia"}).click();
  await expect(page.getByRole("heading",{name:/O arsenal estratégico/})).toBeVisible();
});
