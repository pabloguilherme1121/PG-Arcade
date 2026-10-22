import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Portas Lógicas: simular tabela, desfazer e preservar mobile em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/portas");
  const game=page.locator("[data-logic-gates]");
  await expect(game).toBeVisible();
  await expect(game.locator("[data-logic-gate]")).toHaveCount(1);
  await expect(game.locator("[data-logic-row]")).toHaveCount(4);
  await game.getByRole("button",{name:/Alternar porta 1/}).click();
  await expect(game.getByRole("button",{name:/Alternar porta 1/})).toContainText("OU");
  await game.getByRole("button",{name:"Desfazer"}).click();
  await expect(game.getByRole("button",{name:/Alternar porta 1/})).toContainText("E");
  await game.getByLabel("Dificuldade de Portas Lógicas").selectOption("2");
  await expect(game.locator("[data-logic-gate]")).toHaveCount(3);
  await expect(game.locator("[data-logic-row]")).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novo circuito"}).click();
  await expect(game.locator("[data-logic-gate]")).toHaveCount(3);
 });
}