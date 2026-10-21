import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Cofre de Sombras: máscaras reais e controles em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/sombras");
  const game=page.locator("[data-shadow-vault]");await expect(game).toBeVisible();
  await expect(game.locator(".shadow-panel")).toHaveCount(2);
  await expect(game.locator("[data-shutter]")).toHaveCount(3);
  const before=await game.locator(".shadow-panel").nth(1).locator("[data-shadow-state]").evaluateAll(els=>els.map(el=>el.getAttribute("data-shadow-state")));
  await game.getByRole("button",{name:/Girar veneziana 1/}).click();
  const after=await game.locator(".shadow-panel").nth(1).locator("[data-shadow-state]").evaluateAll(els=>els.map(el=>el.getAttribute("data-shadow-state")));
  expect(after).not.toEqual(before);
  await game.getByRole("button",{name:"Desfazer"}).click();
  const undone=await game.locator(".shadow-panel").nth(1).locator("[data-shadow-state]").evaluateAll(els=>els.map(el=>el.getAttribute("data-shadow-state")));
  expect(undone).toEqual(before);
  await game.getByLabel("Dificuldade de Cofre de Sombras").selectOption("2");
  await expect(game.locator("[data-shutter]")).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}