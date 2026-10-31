import {test,expect} from "@playwright/test";
test.use({hasTouch:true});
for(const width of [320,390]){
  test("Contenção: toque, teclado, pausa, desfazer, barreira e PG Bot em "+width+"px",async({page})=>{
    await page.setViewportSize({width,height:800});
    await page.goto("./estrategia/independentes/linha-contencao/?seed=9");
    await expect(page.getByRole("heading",{name:"Linha de Contenção"})).toBeVisible();
    const cells=page.locator("#board button[data-cell]");
    await expect(cells).toHaveCount(16);
    await expect(page.locator(".cell[data-state='fire']")).toHaveCount(2);
    await page.locator(".cell[data-state='fire']").first().tap();
    await expect(page.locator("#water")).toHaveText("6");
    await page.getByRole("button",{name:"Pausar"}).tap();
    await expect(cells.first()).toBeDisabled();
    await expect(page.getByRole("button",{name:"Desfazer"})).toBeDisabled();
    await page.getByRole("button",{name:"Retomar"}).tap();
    await page.getByRole("button",{name:"Desfazer"}).tap();
    await expect(page.locator("#water")).toHaveText("7");
    await expect(page.locator(".cell[data-state='fire']")).toHaveCount(2);
    await page.getByRole("button",{name:"Criar barreira · 1 água"}).tap();
    const target=cells.filter({has:page.locator(".symbol",{hasText:"·"})}).nth(3);
    await target.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".cell[data-state='barrier']")).toHaveCount(1);
    await page.getByRole("button",{name:"Avançar rodada"}).tap();
    await expect(page.locator("#round")).toHaveText("2/6");
    await page.locator("#pg-bot summary").click();
    await page.getByRole("button",{name:"Situação"}).click();
    await expect(page.locator("#bot-answer")).toContainText("Rodada 2 de 6");
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const height=await page.locator(".cell").first().evaluate(cell=>cell.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(44);
  });
}
for(const mode of ["proteger","resistir"]){
  test("Contenção: dicas resolvem modo "+mode+" e recorde persiste",async({page})=>{
    await page.goto("./estrategia/independentes/linha-contencao/?seed=12");
    await page.getByLabel("Objetivo").selectOption(mode);
    for(let i=0;i<60;i++){
      if(await page.locator("#phase").getAttribute("data-phase")!=="playing")break;
      const actions=Number(await page.locator("#actions").innerText());
      if(actions===0){await page.getByRole("button",{name:"Avançar rodada"}).click();continue;}
      await page.getByRole("button",{name:"Pedir dica"}).click();
      const hint=await page.locator("#hint-text").innerText();
      if(hint.includes("Repor água")) await page.getByRole("button",{name:"Repor +3 água"}).click();
      else {
        const match=hint.match(/Casa (\d+)\./);
        expect(match,hint).not.toBeNull();
        await page.locator('#board button[data-cell="'+(Number(match?.[1])-1)+'"]').click();
      }
    }
    await expect(page.locator("#phase")).toHaveText("Vitória");
    const record=await page.locator("#record").innerText();
    expect(record).toMatch(/^\d+ pontos$/);
    await page.reload();
    await expect(page.getByLabel("Objetivo")).toHaveValue(mode);
    await expect(page.locator("#record")).toHaveText(record);
    await page.getByLabel("Dificuldade").selectOption("veterano");
    await expect(page.locator("#board button[data-cell]")).toHaveCount(36);
  });
}
test("Contenção: negligenciar incêndios causa derrota e reinício preserva controles",async({page})=>{
  await page.goto("./estrategia/independentes/linha-contencao/?seed=8");
  await page.getByLabel("Dificuldade").selectOption("veterano");
  for(let i=0;i<10;i++){
    if(await page.locator("#phase").getAttribute("data-phase")!=="playing")break;
    await page.getByRole("button",{name:"Avançar rodada"}).click();
  }
  await expect(page.locator("#phase")).toHaveText("Derrota");
  await expect(page.getByRole("button",{name:"Avançar rodada"})).toBeDisabled();
  await page.getByRole("button",{name:"Reiniciar operação"}).click();
  await expect(page.locator("#phase")).toHaveText("Em andamento");
});
test("Contenção: portal abre o jogo e volta ao PG Arcade",async({page})=>{
  await page.goto("./estrategia/");
  await page.locator('#jogos-originais a[href="./independentes/linha-contencao/"]').click();
  await expect(page).toHaveURL(/\/estrategia\/independentes\/linha-contencao\/$/);
  await expect(page.getByRole("heading",{name:"Linha de Contenção"})).toBeVisible();
  const root=new URL("../../../",page.url()).href;
  await page.getByRole("navigation",{name:"Navegação entre projetos"}).getByRole("link",{name:"PG Arcade"}).click();
  await expect(page).toHaveURL(root);
});
