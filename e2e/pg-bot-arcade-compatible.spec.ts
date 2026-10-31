import {test,expect} from "@playwright/test";

test.use({hasTouch:true});
for(const width of [320,390]){
 test("PG Bot no Snake mantém ajuda antiga e toque em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./#/jogar/snake");
  const help=page.locator('[data-pg-bot="game-help"]');
  await expect(help).toBeVisible();
  await expect(help.getByText("Ajuda rápida e controles",{exact:true})).toBeVisible();
  await expect(help.locator("img")).toHaveAttribute("src",/brand\/pg-bot\/mascot\.webp$/);
  await expect(help.locator("summary")).toContainText("PG Bot");
  await help.locator("summary").tap();
  await expect(help).toHaveAttribute("open","");
  await expect(help).toContainText("respostas prontas");
  await expect(help).toContainText("Snake");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("PG Bot muda contexto para 2048 e permite teclado sem alterar os atalhos",async({page})=>{
 await page.goto("./#/jogar/2048");
 const help=page.locator('[data-pg-bot="game-help"]');
 await help.locator("summary").focus();
 await page.keyboard.press("Enter");
 await expect(help).toHaveAttribute("open","");
 await expect(help).toContainText("2048");
 await expect(help.getByRole("link",{name:/PG Estratégia/})).toHaveAttribute("href",/estrategia\/\?ajuda=1$/);
 await page.keyboard.press("Enter");
 await expect(help).not.toHaveAttribute("open","");
 await expect(help.getByText("Ajuda rápida e controles",{exact:true})).toBeVisible();
});
