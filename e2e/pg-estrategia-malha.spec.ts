import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("Malha de Energia: toque, teclado, pausa, dica, desfazer e  "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/malha-energia/?seed=3");
  await expect(page.getByRole("heading",{name:"Malha de Energia"})).toBeVisible();
  const cells=page.locator("#board button");
  await expect(cells).toHaveCount(9);
  const first=cells.first();
  await first.focus();await page.keyboard.press("Enter");
  await expect(first).toBeFocused();
  await expect(page.locator("#moves")).toHaveText("1/14");
  await page.getByRole("button",{name:"Pausar"}).tap();
  await expect(first).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).tap();
  await page.getByRole("button",{name:"Desfazer"}).tap();
  await expect(page.locator("#moves")).toHaveText("0/14");
  await page.getByRole("button",{name:"Mostrar dica"}).tap();
  await expect(page.locator("#hint-text")).toContainText("Experimente linha");
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("Você usou 0 de 14 comandos");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Malha de Energia: dica conclui partida e recorde permanece",async({page})=>{
 await page.goto("./estrategia/independentes/malha-energia/?seed=0");
 for(let i=0;i<14;i++){
  if((await page.locator("#phase").textContent())==="Vitória")break;
  await page.getByRole("button",{name:"Mostrar dica"}).click();
  const label=await page.locator("#hint-text").textContent();
  const match=label?.match(/linha (\d+), coluna (\d+)/);
  expect(match).toBeTruthy();
  const index=(Number(match?.[1])-1)*3+Number(match?.[2])-1;
  await page.locator("#board button").nth(index).click();
 }
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#record")).not.toHaveText("Nenhum");
 const score=await page.locator("#record").textContent();
 await page.reload();
 await expect(page.locator("#record")).toHaveText(score??"");
 await page.getByLabel("Dificuldade").selectOption("veterano");
 await expect(page.locator("#board button")).toHaveCount(25);
});
test("Malha de Energia: portal estratégico abre jogo e volta ao Arcade",async({page})=>{
 await page.goto("./estrategia/");
 await page.locator('#jogos-originais a[href="./independentes/malha-energia/"]').click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/malha-energia\/$/);
 const arcadeRoot=new URL("../../../",page.url()).href;
 await page.getByRole("navigation",{name:"Navegação de projetos"}).getByRole("link",{name:"PG Arcade"}).click();
 await expect(page).toHaveURL(arcadeRoot);
});
