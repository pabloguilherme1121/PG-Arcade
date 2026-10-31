import {test,expect} from "@playwright/test";
test.use({hasTouch:true});

for(const width of [320,390]){
  test("Frequências: toque, teclado, conflito, pausa, desfazer e PG Bot em "+width+"px",async({page})=>{
    await page.setViewportSize({width,height:790});
    await page.goto("./estrategia/independentes/rede-frequencias/?seed=6");
    await expect(page.getByRole("heading",{name:"Rede de Frequências"})).toBeVisible();
    const nodes=page.locator("#network button[data-node]");
    await expect(nodes).toHaveCount(6);
    await nodes.nth(0).tap();
    await expect(nodes.nth(0).locator("[data-current]")).toHaveText("Canal 1");
    await nodes.nth(1).tap();
    await expect(page.locator("#status")).toContainText("Interferência");
    await expect(page.locator("#moves")).toHaveText("1/18");
    await page.getByRole("button",{name:"Canal 2"}).click();
    await nodes.nth(1).focus();
    await page.keyboard.press("Enter");
    await expect(nodes.nth(1).locator("[data-current]")).toHaveText("Canal 2");
    await expect(page.locator("#moves")).toHaveText("2/18");
    await page.getByRole("button",{name:"Pausar"}).tap();
    await expect(nodes.first()).toBeDisabled();
    await expect(page.getByRole("button",{name:"Desfazer"})).toBeDisabled();
    await page.getByRole("button",{name:"Retomar"}).tap();
    await page.getByRole("button",{name:"Desfazer"}).tap();
    await expect(page.locator("#moves")).toHaveText("1/18");
    await expect(nodes.nth(1).locator("[data-current]")).toHaveText("Sem canal");
    await page.getByRole("button",{name:"Mostrar dica"}).tap();
    await expect(page.locator("#hint-text")).toContainText("Experimente");
    await page.locator("#pg-bot summary").click();
    await page.getByRole("button",{name:"Situação"}).click();
    await expect(page.locator("#bot-answer")).toContainText("Você configurou 1 de 6");
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const h=await page.getByRole("button",{name:"Desfazer"}).evaluate(el=>el.getBoundingClientRect().height);
    expect(h).toBeGreaterThanOrEqual(44);
  });
}

test("Frequências: dicas resolvem modo economizar e recorde persiste",async({page})=>{
  await page.goto("./estrategia/independentes/rede-frequencias/?seed=17");
  await page.getByLabel("Modo").selectOption("economizar");
  await expect(page.locator("#channels [data-channel='2']")).toBeHidden();
  for(let i=0;i<6;i++){
    await page.getByRole("button",{name:"Mostrar dica"}).click();
    const hint=await page.locator("#hint-text").innerText();
    const match=hint.match(/Experimente (.+) no canal (\d+)\./);
    expect(match).not.toBeNull();
    await page.locator('#channels [data-channel="'+(Number(match?.[2])-1)+'"]').click();
    const station = page.locator("#network button[data-node]").filter({has:page.getByText(match?.[1]||"",{exact:true})});
    await expect(station).toHaveCount(1);
    await station.click();
  }
  await expect(page.locator("#phase")).toHaveText("Vitória");
  const record=await page.locator("#record").innerText();
  expect(record).toBe("6 alterações");
  await page.reload();
  await expect(page.locator("#record")).toHaveText(record);
  await page.getByLabel("Dificuldade").selectOption("veterano");
  await expect(page.locator("#network button[data-node]")).toHaveCount(11);
});

test("Frequências: limite de mudanças encerra sem travar reinício",async({page})=>{
  await page.goto("./estrategia/independentes/rede-frequencias/?seed=1");
  for(let i=0;i<18;i++){
    await page.locator('#channels [data-channel="'+(i%2)+'"]').click();
    await page.locator("#network button[data-node='0']").click();
  }
  await expect(page.locator("#phase")).toHaveText("Derrota");
  await expect(page.locator("#network button[data-node='0']")).toBeDisabled();
  await page.getByRole("button",{name:"Nova rede"}).click();
  await expect(page.locator("#moves")).toHaveText("0/18");
});

test("Frequências: portal abre o jogo e retorna ao PG Arcade",async({page})=>{
  await page.goto("./estrategia/");
  await page.locator('#jogos-originais a[href="./independentes/rede-frequencias/"]').click();
  await expect(page).toHaveURL(/\/estrategia\/independentes\/rede-frequencias\/$/);
  await expect(page.getByRole("heading",{name:"Rede de Frequências"})).toBeVisible();
  const root=new URL("../../../",page.url()).href;
  await page.getByRole("navigation",{name:"Navegação de projetos"}).getByRole("link",{name:"PG Arcade"}).click();
  await expect(page).toHaveURL(root);
});
