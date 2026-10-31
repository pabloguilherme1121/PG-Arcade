import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/";
for(const width of [320,390,1200]){
 test("busca independente filtra títulos e mostra contagem em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:800});await page.goto(route);
  const input=page.getByRole("searchbox",{name:"Buscar jogos independentes"});
  await expect(input).toBeVisible();
  const all=page.locator(".choices .choice");
  await expect(all).toHaveCount(34);
  await input.fill("NONOGRAMA");await expect(all.filter({visible:true})).toHaveCount(1);
  await expect(page.getByRole("link",{name:/Nonograma Tático/})).toBeVisible();
  await expect(page.locator("#independent-results")).toContainText("1 de 34");
  await input.fill("relogios");await expect(all.filter({visible:true})).toHaveCount(1);
  await expect(page.getByRole("link",{name:/Relógios da Maré/})).toBeVisible();
  await input.fill("labirinto");await expect(all.filter({visible:true})).toHaveCount(1);
  await expect(page.getByRole("link",{name:/Labirinto das Sombras/})).toBeVisible();
  await input.fill("portos");await expect(all.filter({visible:true})).toHaveCount(1);
  await expect(page.getByRole("link",{name:/Portos em Turnos/})).toBeVisible();

  await input.fill("não existe esse jogo");
  await expect(all.filter({visible:true})).toHaveCount(0);
  await expect(page.locator("#independent-empty")).toBeVisible();
  await input.press("Escape");
  await expect(input).toHaveValue("");
  await expect(all.filter({visible:true})).toHaveCount(34);
  await expect(page.locator("#independent-empty")).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("busca do catálogo continua acessível offline depois do cache inicial",async({page,context})=>{
 await page.goto(route);
 await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller));
 await page.reload();
 await context.setOffline(true);
 await page.reload();
 const search=page.getByRole("searchbox",{name:"Buscar jogos independentes"});
 await expect(search).toBeVisible();
 await search.fill("drones");
 await expect(page.locator(".choices .choice").filter({visible:true})).toHaveCount(1);
 await expect(page.getByRole("link",{name:/Comando de Drones/})).toBeVisible();
 await context.setOffline(false);
});
