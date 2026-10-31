import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/relogios-mare/";
for(const width of [320,390,1200]){
 test("Relógios: interface, movimento, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:820});await page.goto(route);
  await expect(page.getByRole("heading",{name:"Relógios da Maré"})).toBeVisible();
  await expect(page.locator(".clock")).toHaveCount(4);
  await page.locator(".clock").first().click();await expect(page.locator("#moves")).toHaveText("1/48");
  await page.getByRole("button",{name:"Desfazer"}).click();await expect(page.locator("#moves")).toHaveText("0/48");
  await page.getByRole("button",{name:"Pausar"}).click();await expect(page.locator(".clock").first()).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await page.getByRole("button",{name:"Pedir dica"}).click();await expect(page.locator("#hint-text")).toContainText("Dica:");
  await page.locator("#pg-bot summary").click();await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("relógios");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Relógios: dicas conduzem vitória por toque real, recorde persiste",async({page})=>{
 await page.goto(route+"?seed=11");
 for(let i=0;i<48;i++){
  if(await page.locator("#phase").textContent()==="Vitória")break;
  await page.getByRole("button",{name:"Pedir dica"}).click();
  const hint=await page.locator("#hint-text").textContent(),match=hint?.match(/relógio (\d+)/);
  expect(match).toBeTruthy();
  await page.locator(".clock").nth(Number(match![1])-1).click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#record")).toContainText("pontos");
 await page.reload();await expect(page.locator("#record")).toContainText("pontos");
});
test("Relógios: alterna modos e níveis, navega para PG Arcade",async({page})=>{
 await page.goto(route);
 await page.locator("#mode").selectOption("anel");
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator(".clock")).toHaveCount(6);
 await page.getByRole("link",{name:"PG Arcade"}).first().click();
 await expect(page).toHaveURL(/\/(?:PG-Arcade\/)?$/);
 await expect(page.locator(".game-grid .game-card").first()).toBeVisible();
});
test("Relógios: recorde inválido no storage não provoca erro na vitória",async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem("pg-estrategia-relogios-recordes-v1","7");});
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto(route);
 for(let i=0;i<48;i++){
  if(await page.locator("#phase").textContent()==="Vitória")break;
  await page.getByRole("button",{name:"Pedir dica"}).click();
  const hint=await page.locator("#hint-text").textContent(),m=hint?.match(/relógio (\d+)/);
  expect(m).toBeTruthy();await page.locator(".clock").nth(Number(m![1])-1).click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");expect(errors).toEqual([]);
});