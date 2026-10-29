import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("PG Estratégia: Damas Táticas jogáveis por toque em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/#damas-taticas");
  await expect(page.getByRole("heading",{name:"Damas Táticas"})).toBeVisible();
  await expect(page.locator("#board .draughts-cell")).toHaveCount(64);
  await expect(page.locator('#board [data-piece="1"]')).toHaveCount(12);
  await page.locator('#board [data-cell="40"]').tap();
  await expect(page.locator('#board [data-cell="33"]')).toHaveAttribute("data-target","true");
  await page.locator('#board [data-cell="33"]').tap();
  await expect(page.locator("#metrics")).toContainText("1 / 80");
  await page.getByRole("button",{name:"Pausar damas"}).click();
  await expect(page.locator('#board [data-cell="42"]')).toBeDisabled();
  await page.getByRole("button",{name:"Retomar damas"}).click();
  await page.getByRole("button",{name:/Reiniciar partida/}).click();
  await expect(page.locator("#metrics")).toContainText("0 / 80");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("PG Estratégia: damas por teclado, dificuldade e links de retorno",async({page})=>{
 await page.goto("./estrategia/independentes/#damas-taticas");
 await page.locator('#board [data-cell="42"]').focus();
 await page.keyboard.press("Enter");
 await expect(page.locator('#board [data-cell="42"]')).toHaveAttribute("data-selected","true");
 await expect(page.locator('#board [data-cell="33"]')).toHaveAttribute("data-target","true");
 await page.getByLabel("Dificuldade").selectOption("veterano");
 await expect(page.locator("#metrics")).toContainText("0 / 80");
 await expect(page.getByRole("navigation",{name:"Navegação entre os sites"}).getByRole("link",{name:"PG Arcade"})).toHaveAttribute("href","../../");
});
