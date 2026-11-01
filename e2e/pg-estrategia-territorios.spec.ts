import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/territorios-de-pedra/";
for(const width of [320,390,1200]){
 test("Territórios: capturas, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto(route);
  await expect(page.getByRole("heading",{name:/Territórios de Pedra/})).toBeVisible();
  const grid=page.locator("#board button.cell");
  await expect(grid).toHaveCount(25);
  await expect(page.getByRole("button",{name:/Linha 3, coluna 3: vazio/})).toBeEnabled();
  await grid.nth(12).click();
  await expect(page.locator("#board .stone.dark")).toHaveCount(1);
  await expect(page.locator("#board .stone.light")).toHaveCount(1);
  await expect(page.locator("#moves")).toHaveText("2");
  await page.getByRole("button",{name:"Desfazer"}).click();
  await expect(page.locator("#board .stone.dark")).toHaveCount(0);
  await expect(page.locator("#board .stone.light")).toHaveCount(0);
  await page.getByRole("button",{name:"Pausar"}).click();
  await expect(grid.first()).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await expect(grid.first()).toBeEnabled();
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Estratégia",exact:true}).click();
  await expect(page.locator("#bot-answer")).toContainText("liberdades");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Territórios: escolha de modo, tabuleiro 9x9 e navegação por teclado",async({page})=>{
 await page.setViewportSize({width:320,height:780});
 await page.goto(route);
 await page.locator("#mode").selectOption("capturas");
 await expect(page.locator("#goal")).toContainText("Capture 2 pedras");
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator("#goal")).toContainText("Capture 4 pedras");
 const cells=page.locator("#board button.cell");
 await expect(cells).toHaveCount(81);
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect.poll(()=>page.locator("#board-scroll").evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
 const first=cells.first();
 await first.focus();
 await page.keyboard.press("Enter");
 await expect(page.locator("#board .stone.dark")).toHaveCount(1);
 await expect(page.locator("#board .stone.light")).toHaveCount(1);
 await expect(page.locator("#board button.cell:focus")).toHaveCount(1);
 await page.getByRole("button",{name:"Nova partida"}).click();
 await expect(page.locator("#moves")).toHaveText("0");
});
test("Territórios: catálogo preserva a rota do jogo após expandir para 36 motores",async({page})=>{
 await page.goto("./estrategia/independentes/");
 await expect(page.locator(".choices a.choice[href='./territorios-de-pedra/']")).toHaveCount(1);
 await expect(page.locator(".selection .count")).toHaveText("36 motores independentes");
 await expect(page.locator(".choices .choice")).toHaveCount(36);
 await page.getByRole("link",{name:/Territórios de Pedra/}).click();
 await expect(page.getByRole("heading",{name:/Territórios de Pedra/})).toBeVisible();
});
test("Territórios: PWA restaura o próprio jogo offline",async({page,context})=>{
 await page.goto(route);
 await page.waitForFunction(()=>navigator.serviceWorker?.controller?.scriptURL.endsWith("/territorios-de-pedra/sw.js"));
 await page.reload();
 await context.setOffline(true);
 try{
  await page.reload();
  await expect(page.getByRole("heading",{name:/Territórios de Pedra/})).toBeVisible();
  await expect(page.locator("#board button.cell")).toHaveCount(25);
 }finally{await context.setOffline(false);}
});
