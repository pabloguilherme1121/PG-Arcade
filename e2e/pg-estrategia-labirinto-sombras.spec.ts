import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/labirinto-sombras/";
for(const width of [320,390,1200]){
 test("Sombras: direção, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:830});await page.goto(route);
  await expect(page.getByRole("heading",{name:"Labirinto das Sombras"})).toBeVisible();
  await expect(page.locator("#board .tile")).toHaveCount(25);
  await page.getByRole("button",{name:"Leste",exact:true}).click();
  await expect(page.locator("#turn")).toHaveText("1/50");
  await page.getByRole("button",{name:"Desfazer"}).click();
  await expect(page.locator("#turn")).toHaveText("0/50");
  await page.getByRole("button",{name:"Pausar"}).click();
  await expect(page.getByRole("button",{name:"Leste",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await page.getByRole("button",{name:"Pedir dica"}).click();
  await expect(page.locator("#hint-text")).toContainText("Dica:");
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("patrulha");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Sombras: dicas conduzem vitória real com recordes após reload",async({page})=>{
 await page.goto(route+"?seed=17");
 for(let turn=0;turn<80;turn++){
  if(await page.locator("#phase").textContent()==="Vitória")break;
  await page.getByRole("button",{name:"Pedir dica"}).click();
  const text=await page.locator("#hint-text").textContent();
  const direction=text?.match(/Dica: (Norte|Leste|Sul|Oeste|Esperar)/);
  expect(direction).toBeTruthy();
  await page.getByRole("button",{name:direction![1],exact:true}).click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#intel")).toHaveText("Obtido");
 await expect(page.locator("#record")).toContainText("pontos");
 await page.reload();await expect(page.locator("#record")).toContainText("pontos");
});
test("Sombras: modos e níveis atualizam tabuleiro, teclado e retorno",async({page})=>{
 await page.goto(route);
 await page.locator("#mode").selectOption("alerta");
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator("#board .tile")).toHaveCount(81);
 await page.locator("#board").focus();await page.keyboard.press("ArrowRight");
 await expect(page.locator("#turn")).toHaveText("1/82");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole("link",{name:"PG Arcade"}).first().click();
 await expect(page).toHaveURL(/\/(?:PG-Arcade\/)?$/);
 await expect(page.locator(".game-grid .game-card").first()).toBeVisible();
});
test("Sombras: dados locais inválidos não interrompem a missão",async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem("pg-estrategia-sombras-record-v1","42");localStorage.setItem("pg-estrategia-sombras-config-v1","invalido");});
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto(route);
 for(let i=0;i<50;i++){
  if(await page.locator("#phase").textContent()==="Vitória")break;
  await page.getByRole("button",{name:"Pedir dica"}).click();
  const direction=(await page.locator("#hint-text").textContent())?.match(/Dica: (Norte|Leste|Sul|Oeste|Esperar)/);
  expect(direction).toBeTruthy();
  await page.getByRole("button",{name:direction![1],exact:true}).click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 expect(errors).toEqual([]);
});
test("Sombras: PWA mantém o próprio tabuleiro acessível offline",async({page,context})=>{
 await page.goto(route);await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller));
 await page.reload();await context.setOffline(true);await page.reload();
 await expect(page.getByRole("heading",{name:"Labirinto das Sombras"})).toBeVisible();
 await page.getByRole("button",{name:"Leste",exact:true}).click();
 await expect(page.locator("#turn")).toHaveText("1/50");
 await context.setOffline(false);
});