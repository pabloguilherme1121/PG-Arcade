import { expect, test } from "@playwright/test";
import { games } from "../src/lib/catalog";

for (const width of [320,390,1280]) {
  test(`100 capas exclusivas, navegáveis e sem overflow em ${width}px`, async ({page})=>{
    test.setTimeout(120_000);
    await page.setViewportSize({width,height:width===320?740:844});
    await page.goto("./");
    const cards=page.locator(".game-card");
    const covers=page.locator(".game-card [data-game-cover]");
    await expect(cards).toHaveCount(games.length);
    await expect(covers).toHaveCount(games.length);
    const ids=await covers.evaluateAll(nodes=>nodes.map(node=>node.getAttribute("data-game-cover")));
    expect(new Set(ids).size).toBe(games.length);
    const fingerprints=await covers.evaluateAll(nodes=>nodes.map(node=>node.getAttribute("data-cover-fingerprint")));
    expect(new Set(fingerprints).size).toBe(games.length);
    await expect(cards.first().locator(".game-cover svg")).toBeVisible();
    await expect(page.getByRole("link",{name:"Jogar Xadrez"})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole("link",{name:"Jogar Xadrez"}).click();
    await expect(page.locator(".player [data-game-cover='xadrez']")).toBeVisible();
    await expect(page.getByRole("button",{name:"Ir para o tabuleiro"})).toBeVisible();
    await expect(page.locator("[data-gameplay-orientation]")).toContainText("Xadrez");
    await expect(page.locator("[data-player-record]")).toContainText("Primeira partida");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
test("Busca pelo teclado e ajuda acessível sem interferir nos controles do jogo", async ({page})=>{
  await page.goto("./");
  await page.keyboard.press("/");
  await expect(page.getByRole("textbox",{name:"Buscar jogo"})).toBeFocused();
  await page.keyboard.type("memoria");
  await expect(page.locator(".game-card")).not.toHaveCount(100);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("textbox",{name:"Buscar jogo"})).toHaveValue("");
  await page.goto("./#/jogar/snake");
  const help=page.locator(".experience-tools details");
  await help.locator("summary").click();
  await expect(help).toHaveAttribute("open","");
  await page.keyboard.press("Escape");
  await expect(help).not.toHaveAttribute("open","");
  await expect(page.getByRole("button",{name:"Ir para o tabuleiro"})).toBeVisible();
});
