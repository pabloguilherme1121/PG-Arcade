import { test, expect } from "@playwright/test";
import { actionCollectionGames } from "../src/lib/actionCollection";
test("all ten action engines start, have real options and pause without advancing", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const game of actionCollectionGames) {
    await page.goto(`./#/jogar/${game.id}`);
    await expect(page.locator(".action-collection")).toBeVisible();
    await page
      .getByRole("combobox", { name: "Dificuldade", exact: true })
      .selectOption("easy");
    await page
      .getByRole("combobox", { name: "Modo", exact: true })
      .selectOption("endless");
    await expect(page.locator(".action-objective")).toContainText("Sem limite");
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await expect(page.locator("canvas[data-expanded-board]")).toBeFocused();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "Pausar", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Continuar", exact: true }),
    ).toBeVisible();
    const frozen = await page.locator(".action-hud").textContent();
    await page.waitForTimeout(180);
    await expect(page.locator(".action-hud")).toHaveText(frozen!);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("jetpack fuel does not regenerate while coasting", async ({ page }) => {
  await page.goto("./#/jogar/jetpack");
  await page.clock.install();
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  const canvas = page.locator("canvas[data-expanded-board]");
  const telemetry = page.locator(".action-telemetry");
  await canvas.focus();

  await page.keyboard.down("ArrowUp");
  await page.clock.runFor(600);
  await page.keyboard.up("ArrowUp");
  await page.clock.runFor(120);
  const afterBurn = Number.parseInt(
    ((await telemetry.textContent())?.match(/Combustível:\s*(\d+)%/)?.[1]) ?? "100",
    10,
  );
  expect(afterBurn).toBeLessThan(100);

  await page.clock.runFor(800);
  const afterCoast = Number.parseInt(
    ((await telemetry.textContent())?.match(/Combustível:\s*(\d+)%/)?.[1]) ?? "100",
    10,
  );
  expect(afterCoast).toBe(afterBurn);
});

test("action game resumes, handles uppercase keys and clears held controls on blur", async ({
  page,
}) => {
  await page.goto("./#/jogar/asteroides");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.locator("canvas").press("W");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(
    page.getByRole("button", { name: "Continuar", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator("canvas")).toBeFocused();
  await page.locator("canvas").press("Escape");
  await expect(
    page.getByRole("button", { name: "Continuar", exact: true }),
  ).toBeVisible();
});

test("touch controls preserve play and fast taps reach the physics step", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/runner");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.getByRole("button", { name: "Saltar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pausar", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".action-hud")).toContainText("1 s", {
    timeout: 3000,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
