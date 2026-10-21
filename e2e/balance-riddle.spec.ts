import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Balanças: pesos calculados e toque acessível em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto("./#/jogar/balancas");
  const game=page.locator("[data-balance-riddle]");
  await expect(game).toBeVisible();
  await expect(game.locator("[data-balance-coin]")).toHaveCount(4);
  const weigh=game.getByRole("button",{name:"Pesar moedas"});
  await expect(weigh).toBeDisabled();
  await game.locator('[data-balance-coin="0"]').click();
  await game.locator('[data-balance-coin="1"]').click();
  await game.locator('[data-balance-coin="1"]').click();
  await expect(weigh).toBeEnabled();
  await weigh.click();
  await expect(game.locator(".balance-history li")).toHaveCount(1);
  await game.getByLabel("Dificuldade de Enigma das Balanças").selectOption("2");
  await expect(game.locator("[data-balance-coin]")).toHaveCount(8);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novas moedas"}).click();
  await expect(game.locator("[data-balance-coin]")).toHaveCount(8);
 });
}