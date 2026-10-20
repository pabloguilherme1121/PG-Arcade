import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
  test(`Contrato das Cores tem quatro rounds reais e sem overflow em ${viewport.width}px`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/contrato");
    const arena=page.locator("[data-color-contracts]");
    await expect(arena).toBeVisible();
    await expect(page.locator(".session-mode-cards button")).toHaveCount(1);
    await arena.getByLabel("Jogadores de Contrato das Cores").selectOption("3");
    await arena.getByRole("button",{name:"Começar rodada"}).click();
    await expect(arena.getByRole("group",{name:"Mercado compartilhado"}).getByRole("button")).toHaveCount(3);
    for(let t=0;t<12;t++){
      await expect(arena.getByText(`Vez da pessoa ${t%3+1}`,{exact:false})).toBeVisible();
      await arena.locator(".contract-options button").nth(t%3).click();
    }
    await expect(arena.getByText("Contrato encerrado")).toBeVisible();
    await expect(arena.locator(".contract-player")).toHaveCount(3);
    for(const player of await arena.locator(".contract-player").all())
      await expect(player.getByRole("listitem")).toHaveCount(4);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await arena.getByRole("button",{name:"Novo contrato"}).click();
    await expect(arena.getByRole("button",{name:"Começar rodada"})).toBeVisible();
  });
}
