import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Faróis cobre trechos, desfaz e mantém mapa acessível em ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/farois");
  const game=page.locator("[data-lighthouse-defense]");
  await expect(game).toBeVisible();
  await expect(game.getByRole("group",{name:"Posicionamento de faróis"})).toBeVisible();
  await expect(game.getByRole("button",{name:/Ponto 1/})).toBeVisible();
  await expect(game.locator("[data-beacon-slot]")).toHaveCount(9);
  const first=game.locator('[data-beacon-slot="0"]');
  await first.click();
  await expect(first).toHaveAttribute("data-selected","true");
  await game.getByRole("button",{name:"Desfazer"}).click();
  await expect(first).toHaveAttribute("data-selected","false");
  await game.getByLabel("Dificuldade de Defesa de Faróis").selectOption("2");
  await expect(game.locator("[data-beacon-slot]")).toHaveCount(9);
  await expect(game).toContainText("0/4");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Novo arquipélago"}).click();
  await expect(game.locator("[data-beacon-slot]")).toHaveCount(9);
 });
}