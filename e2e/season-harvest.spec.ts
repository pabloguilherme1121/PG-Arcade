import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Colheita usa solo/água reais e respeita viewport ${viewport.width}`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto("./#/jogar/colheita");
  const game=page.locator("[data-season-harvest]");
  await expect(game).toBeVisible();
  await expect(game.locator("[data-harvest-plot]")).toHaveCount(4);
  await expect(game.locator("[data-harvest-crop]")).toHaveCount(3);
  const water=game.locator(".harvest-stats").getByText("Água");
  await expect(water).toContainText("12/12");
  await game.getByRole("button",{name:"Plantar e colher"}).click();
  await expect(game).toContainText("1/6");
  await expect(game.locator('[data-harvest-plot="0"]')).toContainText("Fertilidade: 0/3");
  await game.getByRole("button",{name:"Desfazer estação"}).click();
  await expect(game).toContainText("0/6");
  await game.getByLabel("Dificuldade de Colheita das Estações").selectOption("2");
  await expect(game).toContainText("0/38");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Nova fazenda"}).click();
  await expect(game.locator("[data-harvest-plot]")).toHaveCount(4);
 });
}