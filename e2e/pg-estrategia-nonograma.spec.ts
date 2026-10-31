import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/nonograma-tatico/";
for(const width of [320,390]){
 test("Nonograma navegação, touch, PG Bot e controles em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto(route);
  await expect(page.getByRole("heading",{name:"Nonograma Tático"})).toBeVisible();
  await expect(page.locator(".tile")).toHaveCount(25);
  const cells=page.locator(".tile");
  await cells.first().click();
  await expect(cells.first()).toHaveAttribute("data-mark","fill");
  await page.getByRole("button",{name:"Desfazer"}).click();
  await expect(cells.first()).toHaveAttribute("data-mark","unknown");
  await page.getByRole("button",{name:"Pausar"}).click();
  await expect(cells.first()).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await page.getByRole("button",{name:"Pedir dica"}).click();
  await expect(page.locator("#hint-text")).toContainText("Sugestão:");
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Estratégia"}).click();
  await expect(page.locator("#bot-answer")).toContainText("pistas");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  expect(overflow).toBe(false);
 });
}
test("Nonograma precisão perde após quatro erros reais e reinicia",async({page})=>{
 await page.goto(route+"?seed=0");
 await page.locator("#mode").selectOption("precisao");
 const cells=page.locator(".tile");
 // Sem testar a implementação da solução na UI: erro identificado pelo placar após marcação.
 for(let i=0;i<25;i++){
  if(await page.locator("#phase").textContent()==="Derrota")break;
  await cells.nth(i).click();
  const errors=Number((await page.locator("#errors").textContent())?.split("/")[0]);
  if(errors<4&&await cells.nth(i).getAttribute("data-mark")==="fill"){
   await page.getByRole("button",{name:/Descartar/}).click();
   await cells.nth(i).click();
   await page.getByRole("button",{name:/Preencher/}).click();
  }
 }
 await expect(page.locator("#phase")).toHaveText("Derrota");
 await page.getByRole("button",{name:"Reiniciar",exact:true}).click();
 await expect(page.locator("#phase")).toHaveText("Em andamento");
 await expect(page.locator("#moves")).toContainText("0/");
});

test("Nonograma conclui vitória por pistas e comandos reais",async({page})=>{
 await page.goto(route+"?seed=1");
 for(let i=0;i<25;i++){
  await page.getByRole("button",{name:"Pedir dica"}).click();
  const text=await page.locator("#hint-text").textContent();
  const match=text?.match(/linha (\d+), coluna (\d+), (preencher|descartar)/);
  expect(match).toBeTruthy();
  const index=(Number(match![1])-1)*5+Number(match![2])-1;
  await page.getByRole("button",{name:match![3]==="preencher"?/Preencher/:/Descartar/}).click();
  await page.locator(".tile").nth(index).click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#correct")).toHaveText("25/25");
 await expect(page.locator(".tile").first()).toBeDisabled();
});
