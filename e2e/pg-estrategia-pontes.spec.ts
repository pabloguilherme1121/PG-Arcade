import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("Pontes: toque, teclado, orçamento, pausa e PG Bot em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/pontes-arquipelago/?seed=0");
  await expect(page.getByRole("heading",{name:"Pontes do Arquipélago"})).toBeVisible();
  await expect(page.locator("#bridges button")).toHaveCount(10);
  const first=page.locator('[data-edge="r0"]');
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("#moves")).toHaveText("1/15");
  await page.getByRole("button",{name:"Pausar"}).tap();
  await expect(first).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).tap();
  await first.tap();
  await expect(first).toHaveAttribute("aria-pressed","false");
  await expect(page.locator("#spent")).toHaveText(/^0\/\d+$/);
  await page.getByRole("button",{name:"Desfazer"}).tap();
  await expect(first).toHaveAttribute("aria-pressed","true");
  await page.getByRole("button",{name:"Mostrar dica"}).tap();
  await expect(page.locator("#hint-text")).toContainText("Considere a ponte");
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("Créditos");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Pontes: vitória em conexão, recorde persistido e redundância mais exigente",async({page})=>{
 await page.goto("./estrategia/independentes/pontes-arquipelago/?seed=0");
 for(const id of ["r0","r1","r2","r3"])await page.locator('[data-edge="'+id+'"]').click();
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#record")).toContainText("créditos restantes");
 const score=await page.locator("#record").textContent();
 await page.reload();
 await expect(page.locator("#record")).toHaveText(score??"");
 await page.getByLabel("Missão").selectOption("redundancia");
 for(const id of ["r0","r1","r2","r3"])await page.locator('[data-edge="'+id+'"]').click();
 await expect(page.locator("#phase")).toHaveText("Em andamento");
 await page.locator('[data-edge="r4"]').click();
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await page.getByLabel("Dificuldade").selectOption("veterano");
 await expect(page.locator("#bridges button")).toHaveCount(18);
});
test("Pontes: acesso real a partir do portal e retorno ao Arcade",async({page})=>{
 await page.goto("./estrategia/");
 await page.locator('#jogos-originais a[href="./independentes/pontes-arquipelago/"]').click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/pontes-arquipelago\/$/);
 const root=new URL("../../../",page.url()).href;
 await page.getByRole("navigation",{name:"Navegação de projetos"}).getByRole("link",{name:"PG Arcade"}).click();
 await expect(page).toHaveURL(root);
});
