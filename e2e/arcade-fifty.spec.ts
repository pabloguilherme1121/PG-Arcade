import { test, expect } from "@playwright/test";
test("extended expedition and endless survival remain playable and can save early", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.9;
  });
  await page.clock.install();
  await page.goto("/#/jogar/rally");
  await expect(page.locator(".run-board")).toBeVisible();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await expect(page.locator(".scores strong").nth(1)).toHaveText("90s");
  await page
    .getByLabel("Dificuldade da expedição", { exact: true })
    .selectOption("easy");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.locator(".run-board").press("ArrowRight");
  await page.clock.runFor(31000);
  await expect(
    page.getByRole("button", { name: "Pausar", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".race-lives")).toContainText("Etapa 2");
  await page
    .getByRole("button", { name: "Encerrar e salvar", exact: true })
    .click();
  await expect(page.locator(".race-lives")).toContainText("concluída");
  await page.getByRole("button", { name: "Nova rodada", exact: true }).click();
  await page
    .getByLabel("Modo da expedição", { exact: true })
    .selectOption("Infinity");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.locator(".run-board").press("ArrowLeft");
  await page.clock.runFor(35000);
  await expect(
    page.getByRole("button", { name: "Pausar", exact: true }),
  ).toBeEnabled();
});
test("progress backup restores best records and rejects malformed input", async ({
  page,
}) => {
  await page.goto("/#/progresso");
  const data = {
    favorites: ["snake", "drift"],
    records: { snake: 55, drift: 1000 },
    visits: { snake: 2 },
    last: "drift",
  };
  await page
    .getByLabel("Restaurar cópia do progresso", { exact: true })
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data)),
    });
  await expect(
    page.getByText(
      "Progresso restaurado. Seus melhores recordes foram preservados.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: /Snake 55 pontos/ }),
  ).toBeVisible();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Salvar cópia do progresso", exact: true })
    .click();
  expect((await downloaded).suggestedFilename()).toBe(
    "pg-arcade-progresso.json",
  );
  await page
    .getByLabel("Restaurar cópia do progresso", { exact: true })
    .setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{bad"),
    });
  await expect(page.getByText(/Não foi possível restaurar/)).toBeVisible();
});
