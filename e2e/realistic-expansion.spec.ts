import { test, expect } from "@playwright/test";
for (const id of ["rally", "coleta", "orbital"])
  test(`${id}: steering, pause, deadline, restart and assets`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.9;
    });
    await page.clock.install();
    await page.goto(`./#/jogar/${id}`);
    const board = page.locator(".run-board");
    await expect(board).toBeVisible();
    await page
      .getByLabel("Modo da expedição", { exact: true })
      .selectOption("300");
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await expect(board.locator(".race-car img")).toHaveJSProperty(
      "naturalWidth",
      256,
    );
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await board.press("ArrowLeft");
    await expect(board.locator(".race-car")).toHaveAttribute("data-lane", "0");
    await board.press("ArrowRight");
    await board.press("ArrowRight");
    await board.press("A");
    await expect(board.locator(".race-car")).toHaveAttribute("data-lane", "1");
    await board.press("D");
    await expect(board.locator(".race-car")).toHaveAttribute("data-lane", "2");
    if (id !== "orbital") {
      await board.press("Enter");
      await expect(board.locator(".laser")).toHaveCount(0);
    }
    if (id === "orbital") {
      await board.press("Enter");
      await expect(board.locator(".laser")).toHaveCount(1);
    }
    await page.getByRole("button", { name: "Pausar", exact: true }).click();
    const remaining = await page.locator(".scores strong").nth(1).textContent();
    await page.clock.runFor(3000);
    await expect(page.locator(".scores strong").nth(1)).toHaveText(remaining!);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    if (id === "orbital") {
      await page.clock.runFor(1500);
      await board.press("Enter");
      await page.clock.runFor(2500);
      await expect(page.locator(".scores strong").first()).not.toHaveText("0");
    }
    await page.clock.runFor(31000);
    await expect(
      page.getByRole("button", { name: "Começar", exact: true }),
    ).toBeDisabled();
    if (id !== "orbital") {
      await expect(page.locator(".scores strong").first()).not.toHaveText("0");
      const score = await page.locator(".scores strong").first().textContent();
      await page.clock.resume();
      await page.reload();
      await expect(page.locator(".instructions")).toContainText(
        `${score} pontos`,
      );
    }
    await page
      .getByRole("button", { name: "Nova rodada", exact: true })
      .click();
    await expect(page.locator(".scores strong").first()).toHaveText("0");
  });
test("mines: safe first reveal, flags on touch, loss and reset", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let n = 0;
    Math.random = () => (n++ % 5) * 0.2;
  });
  await page.goto("./#/jogar/minas");
  await page
    .getByRole("button", { name: "Casa 28: fechada", exact: true })
    .click();
  await expect(page.locator(".mine-open")).not.toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Uma mina" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Modo revelar", exact: true }).click();
  await page
    .getByRole("button", { name: "Casa 1: fechada", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Casa 1: marcada", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Casa 1: marcada", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Modo bandeira", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Casa 1: fechada", exact: true })
    .click();
  await expect(page.locator(".game-status")).toContainText("Uma mina");
  await page.getByRole("button", { name: "Novo campo", exact: true }).click();
  await expect(page.locator(".mines-board button")).toHaveCount(64);
  await expect(page.locator(".mine-open")).toHaveCount(0);
});
test("reaction: false start, timed hit, pause and five-round record", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.clock.install();
  await page.goto("./#/jogar/reflexo");
  const board = page.locator(".reaction-board");
  await board.click();
  await board.click();
  await expect(page.locator(".game-status")).toContainText("Cedo demais");
  await board.click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.clock.runFor(3000);
  await expect(board).toHaveText(/Continuar/);
  for (let i = 0; i < 4; i++) {
    await board.click();
    await page.clock.runFor(1300);
    await expect(board).toHaveText(/AGORA/);
    await board.press("Enter");
  }
  await expect(board).toBeDisabled();
  const score = await page.locator(".scores strong").first().textContent();
  expect(Number(score)).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator(".instructions")).toContainText(`${score} pontos`);
});


test("corrida: speed builds progressively and remains mobile-safe", async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/corrida");

  const speed = page.locator("[data-race-speed]");
  const initial = Number.parseInt((await speed.textContent()) || "0", 10);
  await page.getByRole("button", { name: "Largar", exact: true }).click();
  await page.clock.runFor(6000);
  const accelerated = Number.parseInt((await speed.textContent()) || "0", 10);

  expect(accelerated).toBeGreaterThan(initial);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
