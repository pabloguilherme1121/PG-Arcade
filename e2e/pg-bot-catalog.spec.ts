import {test,expect} from "@playwright/test";
for(const width of [320,390]){
 test("PG Bot no catálogo indica jogos reais e mantém navegação em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:800});
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("./");
  const help=page.locator('[data-pg-bot="catalog-help"]');
  await expect(help).toBeVisible();
  await help.locator("summary").click();
  await expect(help).toHaveAttribute("open","");
  await help.getByRole("button",{name:"Estratégia e lógica"}).click();
  await expect(help.locator(".catalog-pg-bot-links a")).toHaveCount(3);
  await expect(help.getByRole("button",{name:"Estratégia e lógica"})).toHaveAttribute("aria-pressed","true");
  await help.getByLabel("Pergunte ao PG Bot").fill("funciona sem internet?");
  await help.getByRole("button",{name:"Perguntar"}).click();
  await expect(help.getByRole("status")).toContainText("conectado");
  await help.getByLabel("Pergunte ao PG Bot").fill("Quero uma partida rápida");
  await help.getByRole("button",{name:"Perguntar"}).click();
  const games=help.locator(".catalog-pg-bot-links a");
  await expect(games).toHaveCount(3);
  const first=await games.first().getAttribute("href");
  expect(first).toMatch(/^#\/jogar\//);
  await games.first().click();
  await expect(page.locator('[data-pg-bot="game-help"]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
 });
}
