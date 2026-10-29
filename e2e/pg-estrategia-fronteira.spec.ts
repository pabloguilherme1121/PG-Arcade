import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("PG Estratégia: Fronteira Orbital tem exploração, colônias e controle touch "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/#fronteira-orbital");
  await expect(page.getByRole("heading",{name:"Fronteira Orbital"})).toBeVisible();
  await expect(page.locator("#board .frontier-cell")).toHaveCount(16);
  await expect(page.getByLabel("Objetivo orbital")).toHaveValue("expansao");
  await expect(page.getByLabel("Ação orbital")).toHaveValue("scout");
  const sector=page.locator('#board [data-frontier="1"]');
  await expect(sector).toBeEnabled();
  await sector.tap();
  await expect(sector).toHaveAttribute("data-visible","true");
  await expect(page.locator("#metrics")).toContainText("1 / 24");
  await page.getByLabel("Ação orbital").selectOption("colonize");
  await expect(sector).toBeEnabled();
  await sector.tap();
  await expect(sector).toHaveAttribute("data-owner","1");
  await expect(page.locator("#metrics")).toContainText("2 / 24");
  await page.getByRole("button",{name:"Pausar operação"}).click();
  await expect(page.getByRole("button",{name:"Pesquisar (+3 ciência)"})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar operação"}).click();
  await expect(page.getByRole("button",{name:"Pesquisar (+3 ciência)"})).toBeEnabled();
  await page.getByRole("button",{name:/Reiniciar partida/}).click();
  await expect(page.locator("#metrics")).toContainText("0 / 24");
  await expect(page.locator('#board [data-frontier="1"]')).toHaveAttribute("data-owner","0");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("PG Estratégia: pesquisa e adversário mudam com dificuldade sem alterar links",async({page})=>{
 await page.goto("./estrategia/independentes/#fronteira-orbital");
 await page.getByLabel("Objetivo orbital").selectOption("pesquisa");
 await page.getByLabel("Dificuldade").selectOption("veterano");
 await expect(page.locator("#metrics")).toContainText("0 / 18");
 for(let i=0;i<4;i++)await page.getByRole("button",{name:"Pesquisar (+3 ciência)"}).click();
 await expect(page.locator("#message")).toHaveAttribute("data-phase","won");
 await expect(page.locator("#record")).toContainText("Vitória");
 await expect(page.getByRole("navigation",{name:"Navegação entre os sites"}).getByRole("link",{name:"PG Arcade"})).toHaveAttribute("href","../../");
});
