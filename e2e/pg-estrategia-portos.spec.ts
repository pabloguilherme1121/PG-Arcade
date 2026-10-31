import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/portos-em-turnos/";
for(const width of [320,390,1200]){
 test("Portos: distribuição paralela, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:830});await page.goto(route+"?seed=2");
  await expect(page.getByRole("heading",{name:/Portos em Turnos/})).toBeVisible();
  await expect(page.locator("#fleet .ship")).toHaveCount(4);
  await expect(page.locator("#berths .berth")).toHaveCount(2);
  await expect(page.getByRole("button",{name:"Despachar N1 no cais Costeiro"})).toHaveCount(0);
  await page.getByRole("button",{name:"Despachar N1 no cais Profundo"}).click();
  await page.getByRole("button",{name:"Despachar N2 no cais Costeiro"}).click();
  await expect(page.locator('#berths [data-busy="true"]')).toHaveCount(2);
  await expect(page.locator("#clock")).toHaveText("0h");
  await page.getByRole("button",{name:"Pausar"}).click();
  await expect(page.getByRole("button",{name:"Aguardar 1 hora"})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await page.getByRole("button",{name:"Aguardar 1 hora"}).click();
  await expect(page.locator("#clock")).toHaveText("1h");
  await page.getByRole("button",{name:"Desfazer"}).click();
  await expect(page.locator("#clock")).toHaveText("0h");
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Estratégia"}).click();
  await expect(page.locator("#bot-answer")).toContainText("dois cais");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Portos: dicas do próprio motor conduzem vitória real e recorde persiste",async({page})=>{
 await page.goto(route+"?seed=17");
 for(let i=0;i<60;i++){
  if((await page.locator("#phase").textContent())==="Vitória")break;
  await page.getByRole("button",{name:"Pedir dica"}).click();
  const hint=await page.locator("#hint-text").textContent();
  if(hint?.includes("avance uma hora"))await page.getByRole("button",{name:"Aguardar 1 hora"}).click();
  else {
   const parts=hint?.match(/Dica: envie (N\d+) ao cais (Profundo|Costeiro)/);
   expect(parts, hint??"sem dica").toBeTruthy();
   await page.getByRole("button",{name:"Despachar "+parts![1]+" no cais "+parts![2]}).click();
  }
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#count")).toHaveText("4/4");
 await expect(page.locator("#record")).toContainText("pontos");
 await page.reload();
 await expect(page.locator("#record")).toContainText("pontos");
});
test("Portos: modo Economia, dificuldade veterano e dados de sessão inválidos",async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem("pg-estrategia-portos-record-v1","not-json");
  localStorage.setItem("pg-estrategia-portos-config-v1","broken");
 });
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(route);
 await page.locator("#mode").selectOption("economia");
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator("#fleet .ship")).toHaveCount(8);
 await page.getByRole("button",{name:"Aguardar 1 hora"}).click();
 await expect(page.locator("#phase")).toHaveText("Derrota");
 await page.getByRole("button",{name:"Desfazer"}).click();
 await expect(page.locator("#phase")).toHaveText("Em andamento");
 expect(errors).toEqual([]);
});
test("Portos: acesso offline após registrar service worker",async({page,context})=>{
 await page.goto(route);
 await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller));
 await page.reload();await context.setOffline(true);await page.reload();
 await expect(page.getByRole("heading",{name:/Portos em Turnos/})).toBeVisible();
 await page.getByRole("button",{name:"Pedir dica"}).click();
 await expect(page.locator("#hint-text")).toContainText("Dica:");
 await context.setOffline(false);
});
