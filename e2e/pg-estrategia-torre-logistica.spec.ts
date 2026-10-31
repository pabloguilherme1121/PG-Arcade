import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("Torre Logística: teclado, toque, pausa, desfazer e ajuda no mobile "+width,async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/torre-logistica/?seed=0");
  await expect(page.getByRole("heading",{name:"Torre Logística"})).toBeVisible();
  await expect(page.locator("#platforms .peg-action")).toHaveCount(3);
  await expect(page.locator("#moves")).toHaveText("0/32");
  const a=page.locator('[data-peg="0"]'),b=page.locator('[data-peg="1"]');
  await a.focus();await page.keyboard.press("Enter");
  await expect(a).toHaveAttribute("aria-pressed","true");
  await expect(a).toBeFocused();
  await b.focus();await page.keyboard.press("Enter");
  await expect(page.locator("#moves")).toHaveText("1/32");
  await expect(b).toBeFocused();
  await a.tap();await b.tap();
  await expect(page.locator("#moves")).toHaveText("1/32");
  await expect(page.locator("#status")).toContainText("Movimento inválido");
  await page.getByRole("button",{name:"Pausar"}).tap();
  await expect(a).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).tap();
  await page.getByRole("button",{name:"Desfazer"}).tap();
  await expect(page.locator("#moves")).toHaveText("0/32");
  await page.getByRole("button",{name:"Mostrar dica"}).tap();
  await expect(page.locator("#hint-text")).toContainText("Tente mover");
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("Manobras 0 de 32");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Torre Logística: dicas permitem vitória e recorde persiste",async({page})=>{
 await page.goto("./estrategia/independentes/torre-logistica/?seed=0");
 for(let i=0;i<32;i++){
  if((await page.locator("#phase").textContent())==="Vitória")break;
  await page.getByRole("button",{name:"Mostrar dica"}).click();
  const text=await page.locator("#hint-text").textContent();
  const match=text?.match(/de ([ABC]) para ([ABC])/);
  expect(match).toBeTruthy();
  const from="ABC".indexOf(match?.[1]??""),to="ABC".indexOf(match?.[2]??"");
  await page.locator('[data-peg="'+from+'"]').click();
  await page.locator('[data-peg="'+to+'"]').click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#record")).toContainText("manobras");
 const score=await page.locator("#record").textContent();
 await page.reload();
 await expect(page.locator("#record")).toHaveText(score??"");
 await page.getByLabel("Dificuldade").selectOption("veterano");
 await expect(page.locator("#moves")).toHaveText("0/80");
 await expect(page.locator(".disc")).toHaveCount(5);
});
test("Torre Logística: navegação entre catálogo estratégico e Arcade",async({page})=>{
 await page.goto("./estrategia/");
 await page.locator('#jogos-originais a[href="./independentes/torre-logistica/"]').click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/torre-logistica\/$/);
 const arcade=new URL("../../../",page.url()).href;
 await page.getByRole("navigation",{name:"Navegação de projetos"}).getByRole("link",{name:"PG Arcade"}).click();
 await expect(page).toHaveURL(arcade);
});
