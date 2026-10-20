import { test, expect } from "@playwright/test";
for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
  test("Frutas em Fusão respeita toque, teclado, pausa e retorno em "+viewport.width+"px",async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/frutas");
    const arena=page.locator("[data-fruit-fusion]");
    await expect(arena).toBeVisible();
    await page.getByLabel("Dificuldade de Frutas em Fusão").selectOption("easy");
    await arena.getByRole("button",{name:"Começar fusão"}).click();
    await expect(arena.getByRole("gridcell")).toHaveCount(42);
    await arena.getByRole("button",{name:"Jogar na coluna 2"}).click();
    await expect(arena.getByRole("gridcell",{name:/Linha 7, coluna 2: Cereja/})).toBeVisible();
    const moves=arena.getByText("1/35",{exact:true});
    await expect(moves).toBeVisible();
    await arena.getByRole("button",{name:"Pausar",exact:true}).click();
    await page.keyboard.press("3");
    await expect(moves).toBeVisible();
    await arena.getByRole("button",{name:"Continuar",exact:true}).click();
    await page.keyboard.press("3");
    await expect(arena.getByText("2/35",{exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await arena.getByRole("button",{name:"Novo desafio"}).click();
    await expect(page.getByLabel("Dificuldade de Frutas em Fusão")).toHaveValue("easy");
  });
}
