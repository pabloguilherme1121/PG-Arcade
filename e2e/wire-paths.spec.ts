import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Fio Condutor conecta casas adjacentes com undo sem overflow em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/fios");
  const game=page.locator("[data-wire-game]");
  await expect(game).toBeVisible();
  await expect(game.getByRole("gridcell")).toHaveCount(25);
  await game.locator('[data-wire-cell="0"]').click();
  await game.locator('[data-wire-cell="1"]').click();
  await expect(game.locator('[data-wire-cell="1"]')).toHaveAttribute("data-wire-type","path");
  await game.getByRole("button",{name:"Desfazer"}).click();
  await expect(game.locator('[data-wire-cell="1"]')).toHaveAttribute("data-wire-type","empty");
  await game.getByLabel("Dificuldade de Fio Condutor").selectOption("2");
  await expect(game.getByRole("gridcell")).toHaveCount(49);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novo circuito"}).click();
  await expect(game.getByRole("gridcell")).toHaveCount(49);
 });
}