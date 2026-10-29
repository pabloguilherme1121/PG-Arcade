import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("Reversi Tático: bot, teclado, toque, pausa, desfazer e sem overflow em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/reversi-tatico/");
  await expect(page.getByRole("heading",{name:"Reversi Tático"})).toBeVisible();
  await expect(page.locator(".cell")).toHaveCount(36);
  await expect(page.locator('[data-legal="true"]')).toHaveCount(4);
  await page.locator("#pg-bot summary").click();
  await page.locator('[data-help="situacao"]').click();
  await expect(page.locator("#bot-answer")).toContainText("4 jogadas");
  await page.locator("#pause").click();
  await expect(page.locator("#pause")).toHaveAttribute("aria-pressed","true");
  await expect(page.locator('[data-legal="true"]')).toHaveCount(0);
  await page.locator("#pause").press("Enter");
  await expect(page.locator("#pause")).toHaveAttribute("aria-pressed","false");
  await page.locator('[data-legal="true"]').first().tap();
  await expect(page.locator("#round")).not.toHaveText("0");
  await page.locator("#undo").click();
  await expect(page.locator("#player-score")).toHaveText("2");
  await expect(page.locator("#bot-score")).toHaveText("2");
  await page.locator("#size").selectOption("8");
  await expect(page.locator(".cell")).toHaveCount(64);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Reversi Tático: jogo completo 6x6 termina por captura e placar legítimos",async({page})=>{
 await page.setViewportSize({width:390,height:780});
 await page.goto("./estrategia/independentes/reversi-tatico/");
 await page.locator("#difficulty").selectOption("veterano");
 let turns=0;
 while((await page.locator("#status").getAttribute("data-status"))==="playing"&&turns++<38){
  await page.locator('[data-legal="true"]').first().click();
 }
 await expect(page.locator("#status")).toHaveAttribute("data-status",/won|lost|tie/);
 await expect(page.locator('[data-legal="true"]')).toHaveCount(0);
 await expect(page.locator("#pause")).toBeDisabled();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});