import { expect, test } from "@playwright/test";

test("sessão carrega sob demanda sem interromper jogo e desafio de tempo", async ({ page }) => {
  await page.goto("./#/jogar/memoria");
  await expect(page.locator(".session-mode-cards")).toBeVisible();
  await expect(page.locator(".memory-card")).toHaveCount(16);
  const session = page.locator(".session-mode-cards");
  await session.getByRole("button", { name: /Sprint:/ }).click();
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
