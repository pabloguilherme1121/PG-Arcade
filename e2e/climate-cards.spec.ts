import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Climas alterna cartas secretas entre 2 jogadores em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/climas");
  const game=page.locator("[data-climate-cards]");
  await expect(game).toBeVisible();
  await expect(game.getByRole("group",{name:"Cartas do Jogador 1"})).toBeVisible();
  await expect(game.locator("[data-climate-card]")).toHaveCount(6);
  await game.locator('[data-climate-card="0"]').click();
  await expect(game.locator("[data-climate-card]")).toHaveCount(0);
  await expect(game).toContainText("Entregue o aparelho ao Jogador 2");
  await game.getByRole("button",{name:"Estou pronto — revelar minhas cartas"}).click();
  await expect(game.getByRole("group",{name:"Cartas do Jogador 2"})).toBeVisible();
  await expect(game.locator("[data-climate-card]")).toHaveCount(6);
  await game.locator('[data-climate-card="0"]').click();
  await expect(game.locator(".climate-results li")).toHaveCount(1);
  await game.getByLabel("Dificuldade de Cartas de Climas").selectOption("2");
  await expect(game).toContainText("0/5");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novo baralho"}).click();
  await expect(game.locator("[data-climate-card]")).toHaveCount(6);
 });
}