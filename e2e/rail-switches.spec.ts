import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Trilhos Cruzados altera desvios, avalia trens e não faz overflow em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/trilhos");
  const game=page.locator("[data-rail-switches]");await expect(game).toBeVisible();
  await expect(game.locator("[data-rail-switch]")).toHaveCount(3);
  await game.getByRole("button",{name:/Alterar desvio 1/}).click();
  await expect(game.getByRole("button",{name:/Alterar desvio 1/})).toContainText("Trocar trilhos 1 e 2");
  await game.getByRole("button",{name:"Testar percurso"}).click();
  await expect(game.getByRole("status")).toBeVisible();
  await game.getByRole("button",{name:"Reiniciar desvios"}).click();
  await expect(game.getByRole("button",{name:/Alterar desvio 1/})).toContainText("Reto");
  await game.getByLabel("Dificuldade de Trilhos Cruzados").selectOption("2");
  await expect(game.locator("[data-rail-switch]")).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}
