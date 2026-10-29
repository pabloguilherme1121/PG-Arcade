import { test, expect } from "@playwright/test";
test.use({hasTouch:true});

test("Conselho: três votações ganhas em 320px e recorde persiste",async ({page})=>{
 await page.setViewportSize({width:320,height:720});
 await page.goto("./estrategia/independentes/conselho-de-reinos/?seed=7");
 await expect(page.getByRole("heading",{name:/Conselho dos Reinos/i})).toBeVisible();
 await page.locator('[data-faction="0"]').tap();
 await expect(page.locator('[data-policy="defesa"]').locator("..")).toContainText("7 votos");
 await page.locator('[data-policy="defesa"]').tap();
 await page.locator('[data-policy="comercio"]').tap();
 await page.locator('[data-policy="comercio"]').tap();
 await expect(page.locator("#notice")).toContainText("Vitória");
 await expect(page.locator("#record")).toContainText(/Recorde local.*[1-9]/);
 await page.reload();
 await expect(page.locator("#record")).toContainText(/Recorde local.*[1-9]/);
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator("#restart").click();
 await expect(page.locator("#notice")).not.toContainText("Vitória");
});
test("Conselho: teclado, pausa e derrota na crise em 390px",async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("./estrategia/independentes/conselho-de-reinos/?seed=2");
 await page.locator("#objective-mode").selectOption("crise");
 await page.locator("#level").selectOption("veterano");
 await page.locator("#pause").click();
 await expect(page.locator("#pause")).toHaveAttribute("aria-pressed","true");
 await page.locator("#pause").press("Enter");
 await expect(page.locator("#pause")).toHaveAttribute("aria-pressed","false");
 for(let turn=0;turn<6;turn++)await page.locator("#wait").click();
 await expect(page.locator("#notice")).toContainText(/Rodada encerrada|fim do mandato/i);
 await expect(page.locator("#wait")).toBeDisabled();
 await expect(page.locator("#notice")).toHaveAttribute("data-status","lost");
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
