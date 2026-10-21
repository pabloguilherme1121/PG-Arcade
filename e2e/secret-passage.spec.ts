import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
  test(`Passagem Secreta resolve planos de três participantes em ${viewport.width}px`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/passagem");
    const arena=page.locator("[data-secret-passage]");
    await expect(arena).toBeVisible();
    await expect(arena.getByRole("row")).toHaveCount(5);
    await expect(arena.getByRole("gridcell")).toHaveCount(25);
    await expect(page.locator(".session-mode-cards button")).toHaveCount(1);
    await arena.getByLabel("Jogadores de Passagem Secreta").selectOption("3");
    for(let player=1;player<=3;player++){
      await arena.getByRole("button",{name:`Planejar rota do explorador ${player}`}).click();
      for(const direction of ["Direita","Direita","Baixo","Baixo"]){
        await arena.getByRole("button",{name:`Adicionar ${direction}`}).click();
      }
      await expect(arena.getByText("Passos escolhidos: 4/4")).toBeVisible();
      await arena.getByRole("button",{name:"Confirmar e ocultar rota"}).click();
      await expect(arena.locator(".passage-route")).toHaveCount(0);
    }
    await expect(arena.getByText(/Rodada resolvida/)).toBeVisible();
    await expect(arena.locator(".passage-result li")).toHaveCount(3);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await arena.getByRole("button",{name:"Novo percurso"}).click();
    await expect(arena.getByText("Passe o aparelho ao explorador 1")).toBeVisible();
  });
}