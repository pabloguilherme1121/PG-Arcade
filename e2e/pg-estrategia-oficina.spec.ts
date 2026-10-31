import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
 test("Oficina: operação de produção, dificuldade, PG Bot e toque "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/oficina-automatos/");
  await expect(page.getByRole("heading",{name:"Oficina de Autômatos"})).toBeVisible();
  await expect(page.locator("#metrics")).toContainText("0 / 24");
  await page.getByRole("button",{name:"Mineração: +3 minério"}).tap();
  await expect(page.locator("#metrics")).toContainText("1 / 24");
  await page.getByRole("button",{name:/^Fundir:/}).tap();
  await expect(page.locator("#metrics")).toContainText("Placas");
  await page.getByRole("button",{name:"Pausar produção"}).click();
  await expect(page.getByRole("button",{name:/^Mineração/})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar produção"}).click();
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Controles"}).click();
  await expect(page.locator("#bot-answer")).toContainText("Extraia minério");
  await page.getByLabel("Objetivo da oficina").selectOption("contrato");
  await expect(page.locator("#goal")).toContainText("20 créditos");
  await page.getByLabel("Dificuldade").selectOption("veterano");
  await expect(page.locator("#metrics")).toContainText("0 / 20");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Oficina: derrota pelo prazo, proteção contra ações posteriores e reinício",async({page})=>{
 await page.goto("./estrategia/independentes/oficina-automatos/");
 await page.getByLabel("Dificuldade").selectOption("veterano");
 for(let day=0;day<20;day++)await page.getByRole("button",{name:"Descansar e recuperar energia"}).click();
 await expect(page.locator("#notice")).toHaveAttribute("data-status","lost");
 await expect(page.getByRole("button",{name:/^Mineração/})).toBeDisabled();
 await page.getByRole("button",{name:"Reiniciar partida"}).click();
 await expect(page.locator("#notice")).toHaveAttribute("data-status","playing");
 await expect(page.locator("#metrics")).toContainText("0 / 20");
});
test("Oficina: teclado acessa o PG Bot e navegação permanece entre os sites",async({page})=>{
 await page.goto("./estrategia/independentes/oficina-automatos/");
 await page.locator("#pg-bot summary").focus();
 await page.keyboard.press("Enter");
 await expect(page.locator("#pg-bot")).toHaveAttribute("open","");
 await expect(page.locator("#bot-answer")).toContainText("dois autômatos");
 await expect(page.getByRole("navigation",{name:"Sites PG"}).getByRole("link",{name:"PG Arcade"})).toHaveAttribute("href","../../../");
});

for (const width of [320,390]) {
 test("Oficina: Enter preserva foco após atualizar botões e alternar pausa em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto("./estrategia/independentes/oficina-automatos/");
  const mine=page.getByRole("button",{name:"Mineração: +3 minério"});
  await mine.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#metrics")).toContainText("1 / 24");
  await expect(page.getByRole("button",{name:"Mineração: +3 minério"})).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.locator("#metrics")).toContainText("2 / 24");
  await expect(page.getByRole("button",{name:"Mineração: +3 minério"})).toBeFocused();
  const pause=page.getByRole("button",{name:"Pausar produção"});
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button",{name:"Retomar produção"})).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button",{name:"Pausar produção"})).toBeFocused();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}

test("Oficina: ao desabilitar uma ação, o foco vai para outro comando disponível",async({page})=>{
 await page.goto("./estrategia/independentes/oficina-automatos/");
 await page.getByLabel("Objetivo da oficina").selectOption("montagem");
 const improve=page.getByRole("button",{name:"Melhorar extrator: 8 créditos"});
 await improve.focus();
 await page.keyboard.press("Enter");
 await expect(improve).toBeDisabled();
 await expect(page.locator("#actions button:enabled").first()).toBeFocused();
});
