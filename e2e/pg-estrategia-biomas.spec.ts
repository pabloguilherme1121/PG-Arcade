import {test, expect} from "@playwright/test";

test.use({hasTouch: true});

for (const width of [320, 390]) {
  test("Guardiões dos Biomas: previsão, toque, teclado, pausa e desfazer em " + width + "px", async ({page}) => {
    await page.setViewportSize({width, height: 800});
    await page.goto("./estrategia/independentes/guardioes-biomas/?seed=3");
    await expect(page.getByRole("heading", {name: "Guardiões dos Biomas"})).toBeVisible();
    const regions = page.locator("#regions .region");
    await expect(regions).toHaveCount(3);
    const threatened = page.locator(".region[data-threat='true']");
    await expect(threatened).toHaveCount(1);
    await threatened.getByRole("button", {name: "Proteger · 2"}).tap();
    await expect(threatened.locator("[data-shield]")).toHaveText("3");
    await expect(page.locator("#supplies")).toHaveText("5");
    await page.getByRole("button", {name: "Coletar +2 suprimentos"}).tap();
    await expect(page.locator("#actions")).toHaveText("0");
    await page.getByRole("button", {name: "Avançar rodada"}).tap();
    await expect(page.locator("#round")).toHaveText("2/8");
    const threatenedNext = page.locator(".region[data-threat='true']");
    await threatenedNext.getByRole("button", {name: "Proteger · 2"}).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", {name: "Desfazer"})).toBeEnabled();
    await page.getByRole("button", {name: "Pausar"}).tap();
    await expect(page.getByRole("button", {name: "Desfazer"})).toBeDisabled();
    await expect(page.getByRole("button", {name: "Coletar +2 suprimentos"})).toBeDisabled();
    await page.getByRole("button", {name: "Retomar"}).tap();
    await page.getByRole("button", {name: "Desfazer"}).tap();
    await expect(page.locator("#actions")).toHaveText("2");
    await page.locator("#pg-bot summary").click();
    await page.getByRole("button", {name: "Situação"}).click();
    await expect(page.locator("#bot-answer")).toContainText("Rodada 2 de 8");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const tapHeight = await page.getByRole("button", {name: "Avançar rodada"})
      .evaluate(button => button.getBoundingClientRect().height);
    expect(tapHeight).toBeGreaterThanOrEqual(44);
  });
}

test("Guardiões dos Biomas: planejamento vence e recorde permanece após reload", async ({page}) => {
  await page.goto("./estrategia/independentes/guardioes-biomas/?seed=9");
  for (let round = 1; round <= 8; round++) {
    const target = page.locator(".region[data-threat='true']");
    await target.getByRole("button", {name: "Proteger · 2"}).click();
    await page.getByRole("button", {name: "Coletar +2 suprimentos"}).click();
    await page.getByRole("button", {name: "Avançar rodada"}).click();
  }
  await expect(page.locator("#phase")).toHaveText("Vitória");
  const record = await page.locator("#record").textContent();
  expect(record).toMatch(/^\d+ pontos$/);
  await page.reload();
  await expect(page.locator("#record")).toHaveText(record || "");
  await page.getByLabel("Dificuldade").selectOption("veterano");
  await expect(page.locator("#round")).toHaveText("1/12");
});

test("Guardiões dos Biomas: ignorar clima veterano causa derrota", async ({page}) => {
  await page.goto("./estrategia/independentes/guardioes-biomas/?seed=6");
  await page.getByLabel("Dificuldade").selectOption("veterano");
  for (let n = 0; n < 12; n++) {
    const advance = page.getByRole("button", {name: "Avançar rodada"});
    if (await advance.isDisabled()) break;
    await advance.click();
  }
  await expect(page.locator("#phase")).toHaveText("Derrota");
  await expect(page.getByRole("button", {name: "Avançar rodada"})).toBeDisabled();
});

test("PG Estratégia: portal abre Guardiões e retorna ao Arcade", async ({page}) => {
  await page.goto("./estrategia/");
  await page.locator('#jogos-originais a[href="./independentes/guardioes-biomas/"]').click();
  await expect(page).toHaveURL(/\/estrategia\/independentes\/guardioes-biomas\/$/);
  await expect(page.getByRole("heading", {name: "Guardiões dos Biomas"})).toBeVisible();
  const arcade = new URL("../../../", page.url()).href;
  await page.getByRole("navigation", {name: "Navegação de projetos"})
    .getByRole("link", {name: "PG Arcade"}).click();
  await expect(page).toHaveURL(arcade);
});
