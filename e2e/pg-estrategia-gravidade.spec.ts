import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/gravidade-cristais/?seed=11";
const buttons:{[key:string]:string}={cima:"Inclinar para cima",baixo:"Inclinar para baixo",direita:"Inclinar para a direita",esquerda:"Inclinar para a esquerda"};
async function takeHint(page:any){
 await page.getByRole("button",{name:"Pedir dica"}).click();
 const text=await page.locator("#hint-text").textContent();
 const direction=text?.match(/incline para (cima|baixo|direita|esquerda)/)?.[1];
 expect(direction).toBeTruthy();
 await page.getByRole("button",{name:buttons[direction!]}).click();
}
for(const width of [320,390,1200]){
 test("Gravidade: direção, pausa, desfazer e PG Bot acessíveis em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:800});await page.goto(route);
  await expect(page.getByRole("heading",{name:"Gravidade dos Cristais"})).toBeVisible();
  await expect(page.locator("#board .tile")).toHaveCount(16);
  await expect(page.locator('[data-dir]')).toHaveCount(4);
  await takeHint(page);
  await expect(page.locator("#moves")).toHaveText("1/16");
  await page.getByRole("button",{name:"Desfazer"}).click();
  await expect(page.locator("#moves")).toHaveText("2/16");
  await page.getByRole("button",{name:"Pausar"}).click();
  await expect(page.getByRole("button",{name:"Pedir dica"})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await page.locator("#pg-bot summary").click();await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("inclinações restantes");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Gravidade: dois modos de física, teclado e tabuleiro veterano",async({page})=>{
 await page.goto(route);await page.locator("#mode").selectOption("passo");
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator("#board .tile")).toHaveCount(36);
 await expect(page.locator("#goal")).toContainText("uma casa");
 await page.getByRole("button",{name:"Pedir dica"}).click();
 const direction=(await page.locator("#hint-text").textContent())?.match(/incline para (cima|baixo|direita|esquerda)/)?.[1];
 expect(direction).toBeTruthy();
 const keys:Record<string,string>={cima:"ArrowUp",baixo:"ArrowDown",direita:"ArrowRight",esquerda:"ArrowLeft"};
 await page.locator("#board").focus();
 await page.keyboard.press(keys[direction!]);
 await expect(page.locator("#board")).toBeFocused();
 await expect(page.locator("#moves")).toHaveText("1/26");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test("Gravidade: dicas resolvem jogo no modo Passo e recorde persiste",async({page})=>{
 await page.goto(route);await page.locator("#mode").selectOption("passo");
 await page.locator("#difficulty").selectOption("veterano");
 for(let step=0;step<26;step++){
  if(await page.locator("#phase").textContent()==="Vitória")break;
  await takeHint(page);
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#placed")).toHaveText("2/2");
 await expect(page.locator("#record")).toContainText("pontos");
 const record=await page.locator("#record").textContent();
 await page.reload();await expect(page.locator("#record")).toHaveText(record!);
});
test("Gravidade: dados inválidos não impedem partida nem alteram a dificuldade",async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem("pg-gravidade-recordes-v1","not json");localStorage.setItem("pg-gravidade-config-v1","corrupted");});
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(route);await expect(page.locator("#board .tile")).toHaveCount(16);
 await takeHint(page);await expect(page.locator("#moves")).toHaveText("1/16");
 expect(errors).toEqual([]);
});
test("Gravidade: mantém jogo offline e escopo próprio",async({page,context})=>{
 await page.goto(route);
 await page.waitForFunction(()=>navigator.serviceWorker?.controller?.scriptURL.endsWith("/gravidade-cristais/sw.js"));
 await page.reload();await context.setOffline(true);await page.reload();
 await expect(page.getByRole("heading",{name:"Gravidade dos Cristais"})).toBeVisible();
 await takeHint(page);await expect(page.locator("#moves")).toHaveText("1/16");
 await context.setOffline(false);
});
test.describe("toque móvel real",()=>{
 test.use({hasTouch:true});
 test("Gravidade: toque inclina tabuleiro, pausa e desfaz em 390px",async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto(route);
  await page.getByRole("button",{name:"Pedir dica"}).tap();
  const direction=(await page.locator("#hint-text").textContent())?.match(/incline para (cima|baixo|direita|esquerda)/)?.[1];
  expect(direction).toBeTruthy();
  await page.getByRole("button",{name:buttons[direction!]}).tap();
  await expect(page.locator("#moves")).toHaveText("1/16");
  await page.getByRole("button",{name:"Pausar"}).tap();
  await expect(page.getByRole("button",{name:"Desfazer"})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).tap();
  await page.getByRole("button",{name:"Desfazer"}).tap();
  await expect(page.locator("#moves")).toHaveText("2/16");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
});