import {test,expect} from "@playwright/test";
test.use({hasTouch:true});

for(const width of [320,390]){
  test("Central de Resgates: prazos, toque, teclado, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
    await page.setViewportSize({width,height:790});
    await page.goto("./estrategia/independentes/central-resgates/?seed=9");
    await expect(page.getByRole("heading",{name:"Central de Resgates"})).toBeVisible();
    const jobs=page.locator("#jobs button[data-job]");
    await expect(jobs).toHaveCount(6);
    const first=jobs.first();
    await first.tap();
    await expect(page.locator("#time")).not.toHaveText("0/12");
    await expect(first).toBeDisabled();
    await page.getByRole("button",{name:"Pausar"}).tap();
    await expect(jobs.nth(1)).toBeDisabled();
    await expect(page.getByRole("button",{name:"Desfazer"})).toBeDisabled();
    await page.getByRole("button",{name:"Retomar"}).tap();
    await page.getByRole("button",{name:"Desfazer"}).tap();
    await expect(page.locator("#time")).toHaveText("0/12");
    await expect(jobs.first()).toBeEnabled();
    await page.getByRole("button",{name:"Pedir dica"}).click();
    await expect(page.locator("#hint-text")).toContainText("Sugestão:");
    await page.locator("#pg-bot summary").click();
    await page.getByRole("button",{name:"Situação"}).click();
    await expect(page.locator("#bot-answer")).toContainText("Tempo utilizado: 0 de 12");
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const height=await page.getByRole("button",{name:"Pedir dica"})
      .evaluate(button=>button.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(44);
    await jobs.nth(2).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#time")).not.toHaveText("0/12");
  });
}
for(const mode of ["prioridade","pontualidade"]){
  test("Central de Resgates: dica vence modo "+mode+" e recorde persiste",async({page})=>{
    await page.goto("./estrategia/independentes/central-resgates/?seed=13");
    await page.getByLabel("Objetivo").selectOption(mode);
    for(let i=0;i<6;i++){
      if(await page.locator("#phase").getAttribute("data-phase")!=="playing")break;
      await page.getByRole("button",{name:"Pedir dica"}).click();
      const hint=await page.locator("#hint-text").innerText();
      const match=hint.match(/Sugestão: atenda (.+) agora\./);
      expect(match).not.toBeNull();
      const card=page.locator("#jobs button[data-job]")
        .filter({has:page.getByText(match?.[1]||"",{exact:true})});
      await expect(card).toHaveCount(1);
      await card.click();
    }
    await expect(page.locator("#phase")).toHaveText("Vitória");
    const record=await page.locator("#record").innerText();
    expect(record).toMatch(/^\d+ pontos$/);
    await page.reload();
    await expect(page.getByLabel("Objetivo")).toHaveValue(mode);
    await expect(page.locator("#record")).toHaveText(record);
    await page.getByLabel("Dificuldade").selectOption("veterano");
    await expect(page.locator("#jobs button[data-job]")).toHaveCount(10);
  });
}

test("Central de Resgates: catálogo abre jogo e volta ao PG Arcade",async({page})=>{
  await page.goto("./estrategia/");
  await page.locator('#jogos-originais a[href="./independentes/central-resgates/"]').click();
  await expect(page).toHaveURL(/\/estrategia\/independentes\/central-resgates\/$/);
  await expect(page.getByRole("heading",{name:"Central de Resgates"})).toBeVisible();
  const home=new URL("../../../",page.url()).href;
  await page.getByRole("navigation",{name:"Navegação entre projetos"})
    .getByRole("link",{name:"PG Arcade"}).click();
  await expect(page).toHaveURL(home);
});
