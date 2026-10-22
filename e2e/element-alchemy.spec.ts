import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Alquimia: combina reagentes e desfaz sem overflow em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/alquimia");
  const game=page.locator("[data-element-alchemy]");
  await expect(game).toBeVisible();
  await expect(game.locator(".alchemy-item")).toHaveCount(9);
  await expect(game.locator("[data-alchemy-recipe]")).toHaveCount(6);
  await expect(game.locator('[data-alchemy-recipe="6"]')).toBeDisabled();
  const fire=game.locator('[data-alchemy-stock="0"]'),vapor=game.locator('[data-alchemy-stock="3"]');
  const before=Number(await fire.getAttribute("data-amount"));
  await game.locator('[data-alchemy-recipe="3"]').click();
  await expect(fire).toHaveAttribute("data-amount",String(before-1));
  await expect(vapor).toHaveAttribute("data-amount","1");
  await game.getByRole("button",{name:"Desfazer"}).click();
  await expect(fire).toHaveAttribute("data-amount",String(before));
  await game.getByLabel("Dificuldade de Alquimia de Elementos").selectOption("2");
  await expect(game).toContainText("Obra-prima");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Nova bancada"}).click();
  await expect(game.locator(".alchemy-item")).toHaveCount(9);
 });
}