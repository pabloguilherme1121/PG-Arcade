import {test,expect} from "@playwright/test";
test.use({hasTouch:true});

for(const width of [320,390]){
  test("Espelhos: toque, teclado, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
    await page.setViewportSize({width,height:800});
    await page.goto("./estrategia/independentes/espelhos-sinal/?seed=8");
    await expect(page.getByRole("heading",{name:"Espelhos de Sinal"})).toBeVisible();
    const cells=page.locator("#board button[data-cell]");
    await expect(cells).toHaveCount(16);
    const optional=page.locator('#board button[data-critical="false"][data-mirror="true"]').first();
    await optional.tap();
    await expect(page.locator("#moves")).toHaveText("1/12");
    await page.getByRole("button",{name:"Pausar"}).tap();
    await expect(optional).toBeDisabled();
    await expect(page.getByRole("button",{name:"Desfazer"})).toBeDisabled();
    await page.getByRole("button",{name:"Retomar"}).tap();
    await page.getByRole("button",{name:"Desfazer"}).tap();
    await expect(page.locator("#moves")).toHaveText("0/12");
    await optional.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#moves")).toHaveText("1/12");
    await page.getByRole("button",{name:"Pedir dica"}).tap();
    await expect(page.locator("#hint-text")).toContainText("Casa");
    await page.locator("#pg-bot summary").click();
    await page.getByRole("button",{name:"Situação"}).click();
    await expect(page.locator("#bot-answer")).toContainText("Giros: 1 de 12");
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const height=await optional.evaluate(el=>el.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(44);
  });
}

for(const mode of ["simples","duplo"]){
 test("Espelhos: dicas resolvem modo "+mode+" e recorde persiste",async({page})=>{
    await page.goto("./estrategia/independentes/espelhos-sinal/?seed=13");
    await page.getByLabel("Objetivo").selectOption(mode);
    for(let step=0;step<14;step++){
      if(await page.locator("#phase").getAttribute("data-phase")!=="playing")break;
      await page.getByRole("button",{name:"Pedir dica"}).click();
      const text=await page.locator("#hint-text").innerText();
      const match=text.match(/Casa (\d+)\./);
      expect(match,text).not.toBeNull();
      await page.locator('#board button[data-cell="'+(Number(match?.[1])-1)+'"]').click();
    }
    await expect(page.locator("#phase")).toHaveText("Vitória");
    await expect(page.locator("#reached")).toHaveText(mode==="duplo"?"2/2":"1/1");
    const record=await page.locator("#record").innerText();
    expect(record).toMatch(/^\d+ pontos$/);
    await page.reload();
    await expect(page.getByLabel("Objetivo")).toHaveValue(mode);
    await expect(page.locator("#record")).toHaveText(record);
    await page.getByLabel("Dificuldade").selectOption("veterano");
    await expect(page.locator("#board button[data-cell]")).toHaveCount(36);
 });
}
test("Espelhos: desperdício de movimentos causa derrota e permite reiniciar",async({page})=>{
    await page.goto("./estrategia/independentes/espelhos-sinal/?seed=3");
    const optional=page.locator('#board button[data-critical="false"][data-mirror="true"]').first();
    for(let i=0;i<12;i++) await optional.click();
    await expect(page.locator("#phase")).toHaveText("Derrota");
    await expect(optional).toBeDisabled();
    await page.getByRole("button",{name:"Nova transmissão"}).click();
    await expect(page.locator("#moves")).toHaveText("0/12");
    await expect(page.locator("#phase")).toHaveText("Em andamento");
});
test("Espelhos: portal abre jogo e retorna ao PG Arcade",async({page})=>{
    await page.goto("./estrategia/");
    await page.locator('#jogos-originais a[href="./independentes/espelhos-sinal/"]').click();
    await expect(page).toHaveURL(/\/estrategia\/independentes\/espelhos-sinal\/$/);
    await expect(page.getByRole("heading",{name:"Espelhos de Sinal"})).toBeVisible();
    const root=new URL("../../../",page.url()).href;
    await page.getByRole("navigation",{name:"Navegação entre projetos"})
      .getByRole("link",{name:"PG Arcade"}).click();
    await expect(page).toHaveURL(root);
});
