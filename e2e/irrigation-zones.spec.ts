import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Irrigação conecta dois lotes, reporta vazamentos e respeita ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/irrigacao");
  const game=page.locator("[data-irrigation-zones]");
  await expect(game).toBeVisible();
  await expect(game.locator("[data-irrigation-cell]")).toHaveCount(16);
  await game.locator('[data-irrigation-cell="0"]').click();
  await expect(game.locator('[data-irrigation-cell="0"]')).toHaveAttribute("data-irrigation-selected","true");
  await game.locator('[data-irrigation-cell="1"]').click();
  await expect(game).toContainText("Canais");
  await expect(game.locator('[data-irrigation-cell="0"]')).toHaveAttribute("data-irrigation-right","true");
  await game.getByRole("button",{name:"Desfazer canal"}).click();
  await expect(game.locator('[data-irrigation-cell="0"]')).toHaveAttribute("data-irrigation-right","false");
  await game.getByLabel("Dificuldade de Zonas de Irrigação").selectOption("2");
  await expect(game.locator("[data-irrigation-cell]")).toHaveCount(36);
  await expect(game).toContainText("0/4");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novo terreno"}).click();
  await expect(game.locator("[data-irrigation-cell]")).toHaveCount(36);
 });
}