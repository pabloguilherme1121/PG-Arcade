import { expect, test } from "@playwright/test";

test("sessão carrega sob demanda sem interromper jogo e desafio de tempo", async ({ page }) => {
  await page.goto("./#/jogar/memoria");
  await expect(page.getByLabel("Modo de sessão", { exact: true })).toBeVisible();
  await expect(page.locator(".memory-card")).toHaveCount(16);
  const session = page.getByLabel("Modo de sessão", { exact: true });
  await session.selectOption("sprint");
  await expect(page.getByRole("button", { name: "Iniciar desafio de tempo", exact: true })).toBeVisible();
  await expect(page.locator("[data-session-content]")).toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Iniciar desafio de tempo", exact: true }).click();
  await expect(page.locator("[data-session-content]")).not.toHaveAttribute("inert", "");
  await expect(page.locator(".memory-card")).toHaveCount(16);
  await page.getByRole("button", { name: "Pausar sessão", exact: true }).click();
  await expect(page.locator("[data-session-content]")).toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Voltar à sessão livre", exact: true }).click();
  await expect(page.locator("[data-session-content]")).not.toHaveAttribute("inert", "");
  await expect(page.locator(".memory-card")).toHaveCount(16);
});
