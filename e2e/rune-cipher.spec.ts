import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Runas: decifração real, pistas e responsividade ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto("./#/jogar/runas");
  const game=page.locator("[data-rune-cipher]");
  await expect(game).toBeVisible();
  const mappings=game.locator(".rune-mapping select");
  expect(await mappings.count()).toBeGreaterThan(4);
  await game.getByRole("button",{name:"Verificar tradução"}).click();
  await expect(game.getByRole("status")).toContainText("associações corretas");
  await game.getByRole("button",{name:"Revelar uma letra"}).click();
  await expect(game.locator(".rune-mapping select:disabled")).toHaveCount(1);
  await game.getByRole("button",{name:"Reiniciar"}).click();
  await expect(game.locator(".rune-mapping select:disabled")).toHaveCount(0);
  await game.getByLabel("Dificuldade de Código de Runas").selectOption("2");
  expect(await game.locator(".rune-mapping").count()).toBeGreaterThan(8);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}