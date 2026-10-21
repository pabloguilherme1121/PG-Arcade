import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Bordas Encantadas gira, desfaz, troca tamanho sem overflow em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/bordas");
  const game=page.locator("[data-enchanted-edges]");
  await expect(game).toBeVisible();await expect(game.locator("[data-edge-tile]")).toHaveCount(9);
  const tile=game.locator('[data-edge-tile="0"]');
  const before=await tile.getAttribute("data-rotation");
  await tile.click();
  expect(await tile.getAttribute("data-rotation")).not.toBe(before);
  await game.getByRole("button",{name:"Desfazer"}).click();
  await expect(tile).toHaveAttribute("data-rotation",before!);
  await game.getByLabel("Dificuldade de Bordas Encantadas").selectOption("2");
  await expect(game.locator("[data-edge-tile]")).toHaveCount(25);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novo mosaico"}).click();
  await expect(game.locator("[data-edge-tile]")).toHaveCount(25);
 });
}