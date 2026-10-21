import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Barcos de Resgate: navegar, resgatar e entregar em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/resgate");
  const game=page.locator("[data-rescue-boats]");
  await expect(game).toBeVisible();
  await expect(game).toContainText("Local atual: Base Costeira");
  const island=game.locator('[data-rescue-active="true"]').first();
  const islandName=await island.locator("strong").innerText();
  await island.click();
  await expect(game).toContainText("Local atual: "+islandName);
  await game.getByRole("button",{name:"Resgatar pessoa"}).click();
  await expect(game).toContainText("A bordo: 1/2");
  await game.locator('[data-rescue-destination="0"]').click();
  await game.getByRole("button",{name:"Desembarcar na base"}).click();
  await expect(game).toContainText("Resgatados");
  await game.getByLabel("Dificuldade de Barcos de Resgate").selectOption("2");
  await expect(game).toContainText("0/4");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Nova missão"}).click();
  await expect(game).toContainText("Local atual: Base Costeira");
 });
}