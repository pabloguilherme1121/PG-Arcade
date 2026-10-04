import { test, expect, type Page } from "@playwright/test";
import { projectile, basketHit, swapJewels } from "../src/lib/casualCollection";
async function start(page: Page, id: string) {
  await page.goto("./#/jogar/" + id);
  await page.locator(".casual-options select").first().selectOption("0");
  await page
    .getByLabel("Formato da sessão", { exact: true })
    .selectOption("treino");
  await page
    .getByRole("button", { name: "Iniciar sessão", exact: true })
    .click();
}
async function range(page: Page, label: string, value: number) {
  const input = page.getByRole("slider", { name: label, exact: true });
  const current = Number(await input.inputValue());
  const key = value > current ? "ArrowRight" : "ArrowLeft";
  for (let i = 0; i < Math.abs(value - current); i++) await input.press(key);
}
for (const id of ["vinteum", "dados", "boliche", "basquete", "arco"])
  test(`${id}: five actual rounds complete, score and record survive reload`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.999;
    });
    await start(page, id);
    let basket = { angle: 60, power: 90 };
    outer: for (let power = 90; power <= 100; power++)
      for (let angle = 60; angle <= 70; angle++)
        if (basketHit(projectile(angle, power, 0), 16)) {
          basket = { angle, power };
          break outer;
        }
    for (let round = 0; round < 5; round++) {
      if (id === "vinteum") {
        await page
          .getByRole("button", { name: "Parar (P)", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Próxima rodada", exact: true })
          .click();
      }
      if (id === "dados") {
        await page
          .getByRole("button", { name: "Lançar dados", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Registrar combinação", exact: true })
          .click();
      }
      if (id === "boliche") {
        await range(page, "Força", 100);
        await page
          .getByRole("button", { name: "Lançar bola", exact: true })
          .click();
        await expect(page.locator(".sport-scene [role=status]")).toContainText("Strike!");
        await page.getByRole("button", { name: /Próxima rodada ·/ }).click();
      }
      if (id === "basquete") {
        await range(page, "Mira", basket.angle);
        await range(page, "Força", basket.power);
        await page
          .getByRole("button", { name: "Arremessar", exact: true })
          .click();
        await expect(page.locator(".sport-scene [role=status]")).toContainText(
          "Cesta!",
        );
        await page.getByRole("button", { name: /Próxima rodada ·/ }).click();
      }
      if (id === "arco") {
        await range(page, "Força", 100);
        await page
          .getByRole("button", { name: "Soltar flecha", exact: true })
          .click();
        await page.getByRole("button", { name: /Próxima rodada ·/ }).click();
      }
    }
    await expect(
      page.getByRole("button", { name: "Nova sessão", exact: true }),
    ).toBeVisible();
    const record = await page.locator(".casual-hud strong").nth(2).innerText();
    expect(Number(record)).toBeGreaterThan(0);
    await page.reload();
    await expect(page.locator(".casual-hud strong").nth(2)).toHaveText(record);
  });
test("golf obstacle can be crossed with planned successive strokes", async ({
  page,
}) => {
  await start(page, "golfe");
  await range(page, "Mira", 80);
  await page.getByRole("button", { name: "Dar tacada", exact: true }).click();
  await expect(page.locator(".sport-scene [role=status]")).toContainText(
    "Planeje",
  );
  await range(page, "Mira", 78);
  await page.getByRole("button", { name: "Dar tacada", exact: true }).click();
  await expect(page.locator(".sport-scene [role=status]")).toContainText(
    "Bola no buraco",
  );
  await page.getByRole("button", { name: /Próxima rodada ·/ }).click();
  await expect(page.locator(".casual-hud strong").first()).toHaveText("2 / 5");
});
test("match3 valid adjacent swap spends one move and produces points", async ({
  page,
}) => {
  await start(page, "match3");
  const cells = page.locator(".jewel-board button");
  const labels = await cells.evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute("aria-label")!),
  );
  const board = labels.map((v) => Number(v.match(/tipo (\d+)/)![1]) - 1);
  let pair: number[] = [];
  for (let i = 0; i < 36 && !pair.length; i++)
    for (const j of [i + 1, i + 6])
      if (j < 36 && swapJewels(board, i, j)) {
        pair = [i, j];
        break;
      }
  expect(pair).toHaveLength(2);
  await cells.nth(pair[0]).click();
  await cells.nth(pair[1]).click();
  await expect(
    page.locator(".casual-suite [role=status]").last(),
  ).toContainText("11 jogadas");
  await expect(
    page.locator(".casual-suite [role=status]").last(),
  ).toContainText("cascata");
});
test("fishing pauses on interruption, resumes and rewards controlled reeling", async ({
  page,
}) => {
  await start(page, "pesca");
  await page.clock.install();
  await page.getByRole("button", { name: "Lançar linha", exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("pg-arcade-pause")));
  await expect(
    page.getByRole("button", { name: "Continuar pesca", exact: true }),
  ).toBeVisible();
  await page.clock.runFor(4000);
  await expect(
    page.getByRole("button", { name: "Continuar pesca", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Continuar pesca", exact: true })
    .click();
  await page.clock.runFor(2700);
  await page.getByRole("button", { name: "Fisgar", exact: true }).click();
  for (let i = 0; i < 8; i++) {
    await page
      .getByRole("button", { name: "Recolher linha", exact: true })
      .click();
    if (i < 7) await page.clock.runFor(750);
  }
  await expect(page.locator(".fishing-scene [role=status]")).toHaveText(
    "Peixe capturado!",
  );
  await page
    .getByRole("button", { name: "Próxima rodada", exact: true })
    .click();
  await expect(page.locator(".casual-hud strong").nth(1)).toHaveText("150");
});

