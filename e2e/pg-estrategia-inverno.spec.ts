import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("PG Estratégia: Refúgio do Inverno com ações por toque "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/#refugio-do-inverno");
  await expect(page.getByRole("heading",{name:"Refúgio do Inverno"})).toBeVisible();
  await expect(page.getByLabel("Missão de inverno")).toHaveValue("resistencia");
  await expect(page.locator("#board .winter-sector")).toHaveCount(4);
  await expect(page.locator("#metrics")).toContainText("0 / 7");
  await page.getByRole("button",{name:"Coletar alimentos (+5)"}).tap();
  await expect(page.locator("#metrics")).toContainText("1 / 7");
  await page.getByRole("button",{name:"Reforçar fogueira (2 lenhas)"}).tap();
  await expect(page.locator("#metrics")).toContainText("2 / 7");
  await page.getByRole("button",{name:"Pausar abrigo"}).click();
  await expect(page.getByRole("button",{name:"Coletar alimentos (+5)"})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar abrigo"}).click();
  await page.getByRole("button",{name:/Reiniciar partida/}).click();
  await expect(page.locator("#metrics")).toContainText("0 / 7");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("PG Estratégia: evacuação pode ser concluída e registra pontuação",async({page})=>{
 await page.goto("./estrategia/independentes/#refugio-do-inverno");
 await page.getByLabel("Missão de inverno").selectOption("evacuacao");
 for(const label of ["Coletar alimentos (+5)","Construir sinal (2 lenhas e 1 alimento)",
    "Construir sinal (2 lenhas e 1 alimento)","Coletar alimentos (+5)","Construir sinal (2 lenhas e 1 alimento)"]){
  await page.getByRole("button",{name:label}).click();
 }
 await expect(page.locator("#message")).toHaveAttribute("data-phase","won");
 await expect(page.locator("#metrics")).toContainText("3 / 3");
 await expect(page.locator("#record")).toContainText("Vitória");
 await expect(page.getByRole("navigation",{name:"Navegação entre os sites"}).getByRole("link",{name:"PG Arcade"})).toHaveAttribute("href","../../");
});
