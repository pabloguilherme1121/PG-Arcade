import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Arquipélago: jogar, desfazer, trocar dificuldade em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/arquipelago");
  const game=page.locator("[data-archipelago]");
  await expect(game).toBeVisible();
  await expect(game.locator("[data-island]")).toHaveCount(6);
  const bridge=game.locator("[data-bridge='0']");
  await expect(bridge).toContainText("0 pontes");
  await bridge.click();await expect(bridge).toContainText("1 ponte");
  await bridge.click();await expect(bridge).toContainText("2 pontes");
  await game.getByRole("button",{name:"Desfazer"}).click();
  await expect(bridge).toContainText("1 ponte");
  await game.getByLabel("Dificuldade de Pontes do Arquipélago").selectOption("2");
  await expect(game.locator("[data-island]")).toHaveCount(9);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novas ilhas"}).click();
  await expect(game.locator("[data-island]")).toHaveCount(9);
 });
}