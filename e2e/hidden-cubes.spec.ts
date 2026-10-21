import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Cubos Ocultos edita alturas, desfaz e cabe em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto("./#/jogar/cubos");
  const game=page.locator("[data-hidden-cubes]");
  await expect(game).toBeVisible();
  await expect(game.locator("[data-cube-cell]")).toHaveCount(9);
  await game.locator('[data-cube-cell="0"]').click();
  await expect(game.locator('[data-cube-cell="0"]')).toHaveAttribute("data-cube-height","1");
  await game.locator('[data-cube-cell="0"]').click();
  await expect(game.locator('[data-cube-cell="0"]')).toHaveAttribute("data-cube-height","2");
  await game.getByRole("button",{name:"Desfazer"}).click();
  await expect(game.locator('[data-cube-cell="0"]')).toHaveAttribute("data-cube-height","1");
  await game.getByRole("button",{name:"Reiniciar"}).click();
  await expect(game.locator('[data-cube-cell="0"]')).toHaveAttribute("data-cube-height","0");
  await game.getByLabel("Dificuldade de Cubos Ocultos").selectOption("2");
  await expect(game.locator("[data-cube-cell]")).toHaveCount(25);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Nova escultura"}).click();
  await expect(game.locator("[data-cube-cell]")).toHaveCount(25);
 });
}