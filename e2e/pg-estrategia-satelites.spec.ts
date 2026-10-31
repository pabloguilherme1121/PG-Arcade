import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/satelites-orbitais/";
for(const width of [320,390,1200]){
 test("Satélites: controles, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:820});
  await page.goto(route);
  await expect(page.getByRole("heading",{name:"Satélites Orbitais"})).toBeVisible();
  await expect(page.locator(".target")).toHaveCount(3);
  await page.getByRole("button",{name:"Transmitir: Floresta"}).click();
  await expect(page.locator("#captured")).toHaveText("1/3");
  await page.getByRole("button",{name:"Desfazer"}).click();
  await expect(page.locator("#captured")).toHaveText("0/3");
  await page.getByRole("button",{name:"Pausar"}).click();
  await expect(page.getByRole("button",{name:/Avançar órbita/})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await page.getByRole("button",{name:"Pedir dica"}).click();
  await expect(page.locator("#hint-text")).toContainText("Dica:");
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("energia");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Satélites: dicas concluem partida por comandos reais, com recorde",async({page})=>{
 await page.goto(route+"?seed=13");
 for(let i=0;i<12;i++){
  if(await page.locator("#phase").textContent()==="Vitória")break;
  await page.getByRole("button",{name:"Pedir dica"}).click();
  const hint=await page.locator("#hint-text").textContent();
  if(hint?.includes("aguarde"))await page.getByRole("button",{name:/Avançar órbita/}).click();
  else {
   const name=hint?.match(/transmita (.+?) nesta janela/);
   expect(name).toBeTruthy();
   await page.getByRole("button",{name:"Transmitir: "+name![1]}).click();
  }
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#record")).toContainText("pontos");
 await page.reload();
 await expect(page.locator("#record")).toContainText("pontos");
});
test("Satélites: nova missão e volta ao PG Arcade",async({page})=>{
 await page.goto(route);
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator(".target")).toHaveCount(5);
 await page.locator("#mode").selectOption("economia");
 await expect(page.locator("#mission")).toContainText("pontos");
 await page.getByRole("link",{name:"PG Arcade"}).first().click();
 await expect(page).toHaveURL(/\/(?:PG-Arcade\/)?$/);
 await expect(page.locator(".game-grid .game-card").first()).toBeVisible();
});