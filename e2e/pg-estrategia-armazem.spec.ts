import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("Armazém: toque, teclado, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:800});
  await page.goto("./estrategia/independentes/armazem-tatico/?seed=8");
  await expect(page.getByRole("heading",{name:"Armazém Tático"})).toBeVisible();
  await page.getByLabel("Dificuldade").selectOption("tatico");
  await expect(page.locator("#board .cell")).toHaveCount(36);
  await page.getByRole("button",{name:"Mover para baixo"}).tap();
  await expect(page.locator("#moves")).toHaveText("1/50");
  await page.getByRole("button",{name:"Pausar"}).tap();
  await expect(page.getByRole("button",{name:"Mover para baixo"})).toBeDisabled();
  await expect(page.getByRole("button",{name:"Desfazer"})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).tap();
  await page.getByRole("button",{name:"Desfazer"}).tap();
  await expect(page.locator("#moves")).toHaveText("0/50");
  await page.getByRole("button",{name:"Mover para direita"}).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#moves")).toHaveText("1/50");
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("Movimentos: 1");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const height=await page.locator("#board .cell").first().evaluate(el=>el.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(44);
 });
}
for(const mode of ["entrega","economia"]){
 test("Armazém: dicas concluem "+mode+" e recorde persiste",async({page})=>{
  await page.goto("./estrategia/independentes/armazem-tatico/?seed=12");
  await page.getByLabel("Objetivo").selectOption(mode);
  await page.getByLabel("Dificuldade").selectOption("veterano");
  for(let step=0;step<80;step++){
   if(await page.locator("#phase").getAttribute("data-phase")!=="playing")break;
   await page.getByRole("button",{name:"Pedir dica"}).click();
   const dir=await page.locator("#hint-text").getAttribute("data-direction");
   expect(["up","down","left","right"]).toContain(dir);
   await page.locator("#direction-"+dir).click();
  }
  await expect(page.locator("#phase")).toHaveText("Vitória");
  await expect(page.locator("#delivered")).toHaveText("3/3");
  const record=await page.locator("#record").innerText();
  expect(record).toMatch(/^\d+ pontos$/);
  await page.reload();
  await expect(page.getByLabel("Objetivo")).toHaveValue(mode);
  await expect(page.getByLabel("Dificuldade")).toHaveValue("veterano");
  await expect(page.locator("#record")).toHaveText(record);
 });
}
test("Armazém: esgotar movimentos causa derrota e reinício funciona",async({page})=>{
 await page.goto("./estrategia/independentes/armazem-tatico/?seed=0");
 await page.getByLabel("Objetivo").selectOption("economia");
 await page.getByLabel("Dificuldade").selectOption("tatico");
 for(let i=0;i<60;i++){
  if(await page.locator("#phase").getAttribute("data-phase")!=="playing")break;
  await page.getByRole("button",{name:i%2===0?"Mover para direita":"Mover para esquerda"}).click();
 }
 await expect(page.locator("#phase")).toHaveText("Derrota");
 await expect(page.getByRole("button",{name:"Mover para direita"})).toBeDisabled();
 await page.getByRole("button",{name:"Reiniciar depósito"}).click();
 await expect(page.locator("#phase")).toHaveText("Em andamento");
 await expect(page.locator("#moves")).toHaveText("0/40");
});
test("Armazém: portal abre jogo e retorna ao PG Arcade",async({page})=>{
 await page.goto("./estrategia/");
 await page.locator('#jogos-originais a[href="./independentes/armazem-tatico/"]').click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/armazem-tatico\/$/);
 await expect(page.getByRole("heading",{name:"Armazém Tático"})).toBeVisible();
 const root=new URL("../../../",page.url()).href;
 await page.getByRole("navigation",{name:"Navegação entre projetos"}).getByRole("link",{name:"PG Arcade"}).click();
 await expect(page).toHaveURL(root);
});
