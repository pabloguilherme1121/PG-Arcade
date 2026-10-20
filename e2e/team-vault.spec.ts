import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
  test(`Cofre em Equipe coopera sem revelar pistas a outros em ${viewport.width}px`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/cofre");
    const arena=page.locator("[data-team-vault]");
    await expect(arena).toBeVisible();
    await expect(page.locator(".session-mode-cards button")).toHaveCount(1);
    await page.getByLabel("Participantes de Cofre em Equipe").selectOption("3");
    const code=Array<string>(4).fill("");
    for(let player=1;player<=3;player++){
      await arena.getByRole("button",{name:`Ver pista da pessoa ${player}`}).click();
      const secret=arena.locator(".vault-clue");
      await expect(secret).toBeVisible();
      for(const text of await secret.locator("p").allTextContents()){
        const m=text.match(/posição\s+(\d+).*algarismo é\s+(\d+)/);
        if(m)code[Number(m[1])-1]=m[2];
      }
      await arena.getByRole("button",{name:"Ocultar pista e passar"}).click();
      await expect(secret).toHaveCount(0);
    }
    expect(code.every(Boolean)).toBe(true);
    await arena.getByRole("textbox",{name:"Senha do cofre"}).fill("1123");
    await arena.getByRole("button",{name:"Testar código"}).click();
    await expect(arena.getByRole("alert")).toContainText("diferentes");
    await arena.getByRole("textbox",{name:"Senha do cofre"}).fill(code.join(""));
    await arena.getByRole("button",{name:"Testar código"}).click();
    await expect(arena.getByText(/Cofre aberto/)).toBeVisible();
    await expect(arena.getByText(/Pontos: 500/)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await arena.getByRole("button",{name:"Novo cofre"}).click();
    await expect(arena.getByText("Vez da pessoa 1")).toBeVisible();
  });
}
