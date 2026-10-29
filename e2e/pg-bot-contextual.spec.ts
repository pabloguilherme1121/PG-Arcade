import {expect,test} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test(`PG Bot dá dica contextual sem sair da missão em ${width}px`,async ({page})=>{
  await page.setViewportSize({width,height:740});
  await page.goto("./estrategia/#est-126");
  const arena=page.locator("#arena");
  await expect(arena).toBeVisible();
  const opener=arena.getByRole("button",{name:"PG Bot · Dica"});
  await opener.tap();
  const help=page.locator("#pg-bot-dialog");
  await expect(help).toBeVisible();
  await help.getByRole("button",{name:"Dica da missão"}).tap();
  await expect(help.locator("#pg-bot-answer")).toContainText(/energia|água|confiança/);
  await help.getByRole("button",{name:"Fechar ajuda"}).tap();
  await expect(help).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(arena).toBeVisible();
  await expect(arena.locator("#arena-turn")).toContainText("0 /");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
