import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Mercadores negocia com preço e combustível reais em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/mercadores");
  const game=page.locator("[data-trade-routes]");
  await expect(game).toBeVisible();
  await expect(game).toContainText("Cidade atual: Porto");
  await game.getByRole("button",{name:"Comprar 2 cargas"}).click();
  await expect(game).toContainText("Carga: 2/3");
  await game.locator('[data-trade-city="3"]').click();
  await expect(game).toContainText("Cidade atual: Capital");
  await game.getByRole("button",{name:"Vender tudo na Capital"}).click();
  await expect(game).toContainText("Carga: 0/3");
  await game.getByLabel("Dificuldade de Mercadores de Rotas").selectOption("2");
  await expect(game).toContainText("0/25");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Nova expedição"}).click();
  await expect(game).toContainText("Cidade atual: Porto");
 });
}