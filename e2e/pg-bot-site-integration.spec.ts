import {test,expect} from "@playwright/test";
for(const width of [320,390]){
 test("link ao PG Bot próprio mantém contexto no Arcade a "+width+" px",async({page})=>{
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.setViewportSize({width,height:844});
  await page.goto("./");
  const panel=page.locator('[data-pg-bot="catalog-help"]');
  await panel.locator("summary").click();
  await expect(panel.getByRole("link",{name:/site completo do PG Bot/i})).toHaveAttribute(
   "href","https://pabloguilherme1121.github.io/PG-Bot/?projeto=arcade");
  await page.goto("./#/jogar/snake");
  const help=page.locator('[data-pg-bot="game-help"]');
  await help.locator("summary").click();
  await expect(help.locator('[data-pg-bot-site="arcade-game"]')).toHaveAttribute(
   "href","https://pabloguilherme1121.github.io/PG-Bot/?projeto=arcade&jogo=snake");
  await expect(help.locator('[data-pg-bot-site="arcade-game"]')).toHaveAttribute("target","_blank");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
 });
}
