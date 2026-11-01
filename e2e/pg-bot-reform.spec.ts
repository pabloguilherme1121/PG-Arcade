import { test, expect } from "@playwright/test";

for(const width of [320,390]){
 test("PG Bot Estratégia responde perguntas em português e preserva foco em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("./estrategia/");
  const launcher=page.getByRole("button",{name:"Ajuda do PG Bot"});
  await launcher.click();
  const dialog=page.locator("#pg-bot-dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Pergunte ao PG Bot").fill("Posso jogar OFFLINE?");
  await dialog.getByRole("button",{name:"Perguntar"}).click();
  await expect(dialog.locator("#pg-bot-answer-topic")).toHaveText("Offline");
  await expect(dialog.locator("#pg-bot-answer")).toContainText("pelo menos uma vez");
  await expect(dialog.getByRole("button",{name:"Jogar offline"})).toHaveAttribute("aria-pressed","true");
  await dialog.getByLabel("Pergunte ao PG Bot").fill("<img src=x onerror=alert(1)>");
  await dialog.getByRole("button",{name:"Perguntar"}).click();
  await expect(dialog.locator("#pg-bot-answer")).toContainText("Posso responder perguntas");
  await expect(dialog.locator("#pg-bot-answer")).not.toContainText("<img");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(launcher).toBeFocused();
  expect(errors).toEqual([]);
 });
 test("PG Bot Estratégia orienta missão aberta e mostra turno real em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/#est-126");
  const arena=page.locator("#arena");await expect(arena).toBeVisible();
  const trigger=page.locator("#pg-bot-in-arena");await trigger.click();
  const bot=page.locator("#pg-bot-dialog");await expect(bot).toBeVisible();
  await bot.getByRole("button",{name:"Situação atual"}).click();
  const turn=await arena.locator("#arena-turn").textContent();
  await expect(bot.locator("#pg-bot-answer")).toContainText((turn||"").trim());
  await bot.getByLabel("Pergunte ao PG Bot").fill("Como vencer essa missão?");
  await bot.getByRole("button",{name:"Perguntar"}).click();
  await expect(bot.locator("#pg-bot-answer")).toContainText(/energia|água|confiança/i);
  await bot.getByRole("button",{name:"Fechar ajuda"}).click();
  await expect(trigger).toBeFocused();await expect(arena).toBeVisible();
 });
 test("PG Bot Arcade responde por jogo e respeita o celular em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("./#/jogar/snake");
  const help=page.locator('[data-pg-bot="game-help"]');
  await help.locator("summary").click();
  await expect(help).toHaveAttribute("open","");
  const ask=help.getByRole("searchbox",{name:/Pergunte ao PG Bot sobre snake/});
  await ask.fill("Como vencer esse jogo?");
  await help.getByRole("button",{name:"Perguntar"}).click();
  await expect(help.locator("[data-pg-bot-answer]")).toContainText("Orientação específica do jogo:");
  await help.getByRole("button",{name:"Recordes"}).click();
  await expect(help.locator("[data-pg-bot-answer]")).toContainText("armazenamento do navegador");
  await expect(help.getByRole("button",{name:"Recordes"})).toHaveAttribute("aria-pressed","true");
  await ask.fill("<img src=x onerror=alert(1)>");
  await help.getByRole("button",{name:"Perguntar"}).click();
  await expect(help.locator("[data-pg-bot-answer]")).toContainText("Posso responder perguntas");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
 });
}
test("PG Bot Arcade muda orientação ao trocar de jogo, sem resposta antiga",async({page})=>{
 await page.goto("./#/jogar/snake");
 let help=page.locator('[data-pg-bot="game-help"]');
 await help.locator("summary").click();
 await help.getByRole("button",{name:"Recordes"}).click();
 await expect(help.locator("[data-pg-bot-answer]")).toContainText("armazenamento");
 await page.goto("./#/jogar/2048");
 help=page.locator('[data-pg-bot="game-help"]');
 await help.locator("summary").click();
 await expect(help.getByRole("searchbox",{name:/Pergunte ao PG Bot sobre 2048/})).toHaveValue("");
 await expect(help.locator("[data-pg-bot-answer]")).toContainText("Orientação específica do jogo:");
 await expect(help.locator("[data-pg-bot-answer]")).not.toContainText("armazenamento do navegador");
});
