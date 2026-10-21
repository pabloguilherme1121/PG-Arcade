import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Ponteiros em Fase: intervalos reais e layout sem overflow em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/ponteiros");
  const game=page.locator("[data-clock-phases]");await expect(game).toBeVisible();
  await expect(game.locator(".clock-item")).toHaveCount(3);
  await game.getByRole("button",{name:"Avançar 5 minutos"}).click();
  await expect(game).toContainText("5 minutos");
  await game.getByRole("button",{name:"Voltar 1 minuto"}).click();
  await expect(game).toContainText("4 minutos");
  await game.getByRole("button",{name:"Desfazer"}).click();
  await expect(game).toContainText("5 minutos");
  await game.getByRole("button",{name:"Reiniciar"}).click();
  await expect(game).toContainText("0 minutos");
  await game.getByLabel("Dificuldade de Ponteiros em Fase").selectOption("2");
  await expect(game.locator(".clock-item")).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}
