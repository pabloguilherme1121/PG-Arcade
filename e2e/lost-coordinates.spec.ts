import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Coordenadas: marcar posição, confirmar e rolar mapa em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto("./#/jogar/coordenadas");
  const game=page.locator("[data-lost-coordinates]");
  await expect(game).toBeVisible();
  await expect(game.getByRole("group",{name:"Selecione uma coordenada"})).toBeVisible();
  await expect(game.getByRole("button",{name:/Linha 1, coluna 1/})).toBeVisible();
  await expect(game.locator("[data-coord-cell]")).toHaveCount(25);
  const confirm=game.getByRole("button",{name:"Confirmar coordenada"});
  await expect(confirm).toBeDisabled();
  await game.locator('[data-coord-cell="0"]').click();
  await expect(game.locator('[data-coord-cell="0"]')).toHaveAttribute("data-coord-selected","true");
  await confirm.click();
  await expect(game).toContainText("1/3");
  await game.getByLabel("Dificuldade de Coordenadas Perdidas").selectOption("2");
  await expect(game.locator("[data-coord-cell]")).toHaveCount(81);
  await expect(game.getByRole("button",{name:"Revelar outra pista"})).toBeEnabled();
  await game.getByRole("button",{name:"Revelar outra pista"}).click();
  await expect(game).toContainText("Possíveis");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}