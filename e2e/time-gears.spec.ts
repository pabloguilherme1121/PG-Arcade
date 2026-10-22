import {test,expect} from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
  test(`Engrenagens: toque, reversibilidade, dificuldade e responsividade em ${viewport.width}px`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/engrenagens");
    const arena=page.locator("[data-time-gears]");
    await expect(arena).toBeVisible();
    await expect(arena.locator("[data-gear-dial]")).toHaveCount(4);
    const before=await arena.locator("[data-gear-dial]").evaluateAll(els=>els.map(el=>el.getAttribute("data-gear-direction")));
    await arena.getByRole("button",{name:"Engrenagem 2, girar para a direita"}).click();
    await expect(arena.locator("[data-gear-moves]")).toHaveText("1");
    await arena.getByRole("button",{name:"Desfazer giro"}).click();
    await expect(arena.locator("[data-gear-moves]")).toHaveText("0");
    expect(await arena.locator("[data-gear-dial]").evaluateAll(els=>els.map(el=>el.getAttribute("data-gear-direction")))).toEqual(before);
    await arena.getByLabel("Dificuldade das engrenagens").selectOption("2");
    await expect(arena.locator("[data-gear-dial]")).toHaveCount(6);
    await arena.getByRole("button",{name:"Novo desafio"}).click();
    await expect(arena.locator("[data-gear-moves]")).toHaveText("0");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  });
}