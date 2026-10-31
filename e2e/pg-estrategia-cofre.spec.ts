import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/cofre-codigos/";
for(const width of [320,390,1200]){
 test("Cofre: visual, controles, pausa, PG Bot e overflow em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:820});await page.goto(route);
  await expect(page.getByRole("heading",{name:"Cofre de Códigos"})).toBeVisible();
  await expect(page.locator(".slot")).toHaveCount(4);
  await page.getByRole("button",{name:"Usar símbolo 0"}).click();
  await expect(page.locator(".slot").first()).toContainText("◆");
  await page.getByRole("button",{name:"Pausar"}).click();
  await expect(page.locator("#submit")).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Estratégia"}).click();
  await expect(page.locator("#bot-answer")).toContainText("exatos");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Cofre: feedback de tentativa, desfazer e vitória real com dicas",async({page})=>{
 await page.goto(route);
 for(let i=0;i<4;i++){
  await page.getByRole("button",{name:"Revelar posição"}).click();
 }
 await expect(page.locator("#reveals")).toHaveText("4/4");
 await page.getByRole("button",{name:"Testar combinação"}).click();
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#history .attempt")).toHaveCount(1);
 await expect(page.locator("#history")).toContainText("Exatos: 4");
 await expect(page.locator("#record")).toContainText("pontos");
 await page.reload();await expect(page.locator("#record")).toContainText("pontos");
});
test("Cofre: recusa repetir símbolos, muda modalidade e volta ao Arcade",async({page})=>{
 await page.goto(route);
 await page.getByRole("button",{name:"Usar símbolo 1"}).click();
 await page.getByRole("button",{name:/Posição 2/}).click();
 await page.getByRole("button",{name:"Usar símbolo 1"}).click();
 await expect(page.getByRole("button",{name:"Posição 1: vazia"})).toBeVisible();
 await page.locator("#mode").selectOption("com-repeticao");
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator(".slot")).toHaveCount(6);
 await page.getByRole("link",{name:"PG Arcade"}).first().click();
 await expect(page).toHaveURL(/\/(?:PG-Arcade\/)?$/);
 await expect(page.locator(".game-grid .game-card").first()).toBeVisible();
});
test("Cofre: dados locais inválidos não quebram partida",async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem("pg-estrategia-cofre-recordes-v1",'7');localStorage.setItem("pg-estrategia-cofre-config-v1","invalido");});
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto(route);
 for(let i=0;i<4;i++)await page.getByRole("button",{name:"Revelar posição"}).click();
 await page.getByRole("button",{name:"Testar combinação"}).click();
 await expect(page.locator("#phase")).toHaveText("Vitória");
 expect(errors).toEqual([]);
});

test("Cofre: botão + seleciona símbolo válido em posição vazia no mobile",async({page})=>{
 await page.setViewportSize({width:320,height:780});
 await page.goto(route);
 await page.getByRole("button",{name:"Próximo símbolo da posição 1"}).click();
 await expect(page.getByRole("button",{name:"Posição 1: símbolo 0"})).toBeVisible();
 await expect(page.locator(".slot").first()).toContainText("◆");
});