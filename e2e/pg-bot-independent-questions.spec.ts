import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("PG Bot independente responde perguntas e dica local em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:800});
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("./estrategia/independentes/#frota-oculta");
  const toggle=page.locator("#pg-bot-toggle");
  await toggle.tap();
  const body=page.locator("#pg-bot-body");
  await expect(body).toBeVisible();
  await page.getByRole("button",{name:"Dica de estratégia"}).tap();
  await expect(page.locator("#pg-bot-answer")).toContainText(/sonar|quadrante/);
  const question=page.getByRole("searchbox",{name:"Pergunte ao PG Bot sobre o jogo atual"});
  await question.fill("Como usar o teclado?");
  await page.getByRole("button",{name:"Perguntar"}).tap();
  await expect(page.locator("#pg-bot-answer")).toContainText("Toque ou pressione Enter");
  await question.fill("funciona OFFLINE?");
  await page.getByRole("button",{name:"Perguntar"}).tap();
  await expect(page.locator("#pg-bot-answer")).toContainText("sem internet");
  await question.fill("<img src=x onerror=alert(1)>");
  await page.getByRole("button",{name:"Perguntar"}).tap();
  await expect(page.locator("#pg-bot-answer")).toContainText("Posso explicar");
  await expect(page.locator("#pg-bot-answer")).not.toContainText("<img");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
 });
 test("PG Bot independente muda dica e limpa pergunta ao trocar o jogo "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:800});
  await page.goto("./estrategia/independentes/#frota-oculta");
  await page.locator("#pg-bot-toggle").tap();
  await page.getByRole("button",{name:"Dica de estratégia"}).click();
  await expect(page.locator("#pg-bot-answer")).toContainText("sonar");
  await page.getByRole("searchbox",{name:"Pergunte ao PG Bot sobre o jogo atual"}).fill("Dica no sonar?");
  await page.locator('[data-select="hex-conexao"]').click();
  await expect(page.locator("#pg-bot-answer")).toContainText("Conecte suas pedras");
  await expect(page.getByRole("searchbox",{name:"Pergunte ao PG Bot sobre o jogo atual"})).toHaveValue("");
  await page.getByRole("button",{name:"Dica de estratégia"}).click();
  await expect(page.locator("#pg-bot-answer")).toContainText(/rotas|pontes|pedras/);
  await expect(page.locator("#pg-bot-answer")).not.toContainText("sonar");
 });
}
test("PG Bot independente opera offline depois de visitar",async({page,context})=>{
 await page.goto("./estrategia/independentes/#patrulha-tatica");
 await page.waitForFunction(()=>navigator.serviceWorker?.controller?.scriptURL.includes("/estrategia/independentes/sw.js"));
 await page.reload();await context.setOffline(true);await page.reload();
 await page.locator("#pg-bot-toggle").click();
 await page.getByRole("searchbox",{name:"Pergunte ao PG Bot sobre o jogo atual"}).fill("como vencer?");
 await page.getByRole("button",{name:"Perguntar"}).click();
 await expect(page.locator("#pg-bot-answer")).toContainText(/drones|combate|esquadrão/);
 await context.setOffline(false);
});
