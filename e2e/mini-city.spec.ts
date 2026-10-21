import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Cidade em Miniatura permite construir, desfazer e proteger ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto("./#/jogar/cidade");
  const game=page.locator("[data-mini-city]");
  await expect(game).toBeVisible();
  await expect(game.locator("[data-city-cell]")).toHaveCount(9);
  await expect(game.locator("[data-city-zone-choice]")).toHaveCount(5);
  const lot=game.locator('[data-city-cell="0"]');
  await lot.click();
  await expect(lot).toHaveAttribute("data-city-zone","1");
  await game.getByRole("button",{name:"Desfazer lote"}).click();
  await expect(lot).toHaveAttribute("data-city-zone","0");
  await expect(game.locator("[data-city-cell]:disabled")).toHaveCount(1);
  await game.getByLabel("Dificuldade de Cidade em Miniatura").selectOption("2");
  await expect(game.locator("[data-city-cell]")).toHaveCount(25);
  await expect(game).toContainText("Moradias: 0/4");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novo terreno"}).click();
  await expect(game.locator("[data-city-cell]")).toHaveCount(25);
 });
}