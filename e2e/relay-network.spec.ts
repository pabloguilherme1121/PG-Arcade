import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
 test(`Rede de Relés instala, conecta e desfaz no mobile ${viewport.width}`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("./#/jogar/reles");
  const game=page.locator("[data-relay-network]");
  await expect(game).toBeVisible();
  await expect(game.locator("[data-relay-slot]")).toHaveCount(8);
  await game.locator('[data-relay-slot="2"]').click();
  await expect(game.locator('[data-relay-slot="2"]')).toHaveAttribute("aria-pressed","true");
  await expect(game.locator('[data-relay-slot="2"]')).toHaveAttribute("data-relay-online","true");
  await game.getByRole("button",{name:"Desfazer antena"}).click();
  await expect(game.locator('[data-relay-slot="2"]')).toHaveAttribute("aria-pressed","false");
  await game.getByLabel("Dificuldade de Rede de Relés").selectOption("2");
  await expect(game.locator("[data-relay-slot]")).toHaveCount(10);
  await expect(game).toContainText("0/4");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole("button",{name:"Nova região"}).click();
  await expect(game.locator("[data-relay-slot]")).toHaveCount(10);
 });
}