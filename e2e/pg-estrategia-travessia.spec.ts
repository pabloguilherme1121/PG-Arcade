import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/travessia-vale/";
for(const width of [320,390,1200]){
 test("Travessia: jogabilidade, pausa, desfazer e bot em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:820});await page.goto(route);
  await expect(page.getByRole("heading",{name:"Travessia do Vale"})).toBeVisible();
  await page.getByRole("button",{name:"Cabra",exact:true}).click();
  await page.locator("#cross").click();await expect(page.locator("#delivered")).toHaveText("1/3");
  await page.locator("#pause").click();await expect(page.locator("#cross")).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();await page.locator("#undo").click();
  await expect(page.locator("#delivered")).toHaveText("0/3");
  await page.locator("#pg-bot summary").click();await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("transportados");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Travessia: dicas resolvem partida com cliques reais",async({page})=>{
 await page.goto(route);
 for(let turn=0;turn<35;turn++){
  if(await page.locator("#phase").textContent()==="Vitória")break;
  await page.locator("#hint").click();await expect(page.locator("#hint-text")).toContainText("Dica:");
  await page.locator("#cross").click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#record")).toContainText("pontos");
 await page.reload();await expect(page.locator("#record")).toContainText("pontos");
});
test("Travessia: mudança de dificuldade, modo e retorno ao Arcade",async({page})=>{
 await page.goto(route);await page.locator("#mode").selectOption("expedicao");
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator("#left button")).toHaveCount(5);
 await page.getByRole("link",{name:"PG Arcade"}).first().click();
 await expect(page).toHaveURL(/\/(?:PG-Arcade\/)?$/);
 await expect(page.locator(".game-grid .game-card").first()).toBeVisible();
});
test("Travessia: armazenamento local corrompido não impede vitória ou recorde",async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem("pg-estrategia-vale-recordes-v1","42");});
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto(route);
 for(let turn=0;turn<35;turn++){
  if(await page.locator("#phase").textContent()==="Vitória")break;
  await page.locator("#hint").click();await page.locator("#cross").click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#record")).toContainText("pontos");
 expect(errors).toEqual([]);
});
