import { test, expect, type Page } from "@playwright/test";

async function casual(page: Page, game: string, difficulty = "0") {
  await page.goto(`./#/jogar/${game}`);
  await page.locator(".casual-options select").first().selectOption(difficulty);
  await page.getByLabel("Formato da sessão", { exact: true }).selectOption("treino");
  await page.getByRole("button", { name: "Iniciar sessão", exact: true }).click();
}

test("golf recovers an overshoot, completes the round and shows an obstacle rebound", async ({ page }) => {
  await casual(page, "golfe");
  const power = page.getByRole("slider", { name: "Força", exact: true });
  const hit = page.getByRole("button", { name: "Dar tacada", exact: true });
  await power.fill("100");
  await hit.click();
  await hit.click();
  await expect(page.locator(".sport-golfe circle")).toHaveAttribute("cx", "340");
  await power.fill("10");
  await hit.click();
  await expect(page.locator(".sport-scene [role=status]")).toContainText("Bola no buraco!");
  await page.getByRole("button", { name: /Próxima rodada/ }).click();
  await expect(page.locator(".casual-hud strong").first()).toHaveText("2 / 5");

  await page.reload();
  await casual(page, "golfe", "1");
  await page.getByRole("button", { name: "Dar tacada", exact: true }).click();
  await expect(page.locator(".sport-scene [role=status]")).toContainText("obstáculo");
  const points = (await page.locator(".sport-golfe polyline").getAttribute("points"))!.split(" ");
  expect(points).toHaveLength(3);
  expect(Number(points[1].split(",")[0])).toBeGreaterThan(Number(points[2].split(",")[0]));
});

test("basketball distinguishes a banked miss from a basket", async ({ page }) => {
  await casual(page, "basquete");
  await page.getByRole("slider", { name: "Mira", exact: true }).fill("47");
  await page.getByRole("slider", { name: "Força", exact: true }).fill("100");
  await page.getByRole("button", { name: "Arremessar", exact: true }).click();
  await expect(page.locator(".sport-scene [role=status]")).toContainText("tabela, mas não caiu");
  await expect(page.locator(".casual-hud strong").nth(1)).toHaveText("0");
});

for (const preference of ["system", "saved"] as const) {
  test(`football stops an active flight when ${preference} reduced motion is enabled`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("./#/jogar/futebol");
    const shoot = page.getByRole("button", { name: "Chutar", exact: true });
    await expect(shoot).toBeVisible();
    const frozen = new Date("2026-10-05T12:00:00Z");
    await page.clock.install({ time: frozen });
    await page.clock.pauseAt(new Date(frozen.getTime() + 1000));
    await shoot.click();
    await expect(page.locator(".football-ball animateMotion")).toHaveCount(1);
    if (preference === "system") await page.emulateMedia({ reducedMotion: "reduce" });
    else await page.evaluate(() => {
      document.documentElement.dataset.arcadeMotion = "reduced";
      window.dispatchEvent(new Event("pg-arcade-preferences"));
    });
    await expect(page.locator(".football-ball animateMotion")).toHaveCount(0);
    await expect(shoot).toBeEnabled();
    const result = await page.locator("[data-football-result]").getAttribute("data-football-result");
    await page.clock.runFor(1000);
    await expect(page.locator("[data-football-result]")).toHaveAttribute("data-football-result", result!);
    for (let i = 0; i < 4; i++) await shoot.click();
    await expect(page.locator("[data-football-series-review]")).toBeVisible();
    await expect(shoot).toBeDisabled();
  });
}

test("lunar touchdown feedback survives pause and resets with a new game", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#/jogar/pouso");
  await page.getByLabel("Dificuldade", { exact: true }).selectOption("easy");
  const frozen = new Date("2026-10-05T12:00:00Z");
  await page.clock.install({ time: frozen });
  await page.clock.pauseAt(new Date(frozen.getTime() + 1000));
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.clock.runFor(5000);
  await expect(page.locator(".action-telemetry")).toContainText("Último toque: impacto");
  await expect(page.locator(".action-hud strong").nth(1)).toHaveText("4");
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const hud = await page.locator(".action-telemetry").textContent();
  await page.clock.runFor(1000);
  await expect(page.locator(".action-telemetry")).toHaveText(hud!);
  await page.getByRole("button", { name: "Reiniciar jogo", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar reinício", exact: true }).click();
  await expect(page.locator(".action-telemetry")).not.toContainText("Último toque");
});

test("jetpack releases held thrust on pointer cancellation and preserves fuel through pause", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#/jogar/jetpack");
  const frozen = new Date("2026-10-05T12:00:00Z");
  await page.clock.install({ time: frozen });
  await page.clock.pauseAt(new Date(frozen.getTime() + 1000));
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  const thrust = page.getByRole("button", { name: "Propulsor", exact: true });
  await thrust.scrollIntoViewIfNeeded();
  const box = (await thrust.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.clock.runFor(400);
  const fuel = async () => Number((await page.locator(".action-telemetry").textContent())!.match(/Combustível: (\d+)%/)![1]);
  expect(await fuel()).toBeLessThan(100);
  await thrust.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  await page.clock.runFor(120);
  const released = await fuel();
  await page.clock.runFor(600);
  expect(await fuel()).toBe(released);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const telemetry = await page.locator(".action-telemetry").textContent();
  await page.clock.runFor(1000);
  await expect(page.locator(".action-telemetry")).toHaveText(telemetry!);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.clock.runFor(300);
  expect(await fuel()).toBe(released);
});

for (const width of [320, 390]) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`new sports controls stay usable at ${width}px with ${reducedMotion} motion`, async ({ page }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion });
      for (const game of ["boliche", "basquete", "golfe"]) {
        await casual(page, game);
        const sliders = page.locator(".casual-sliders input");
        for (const slider of await sliders.all()) {
          await expect.poll(async () => Math.round((await slider.boundingBox())?.height ?? 0)).toBeGreaterThanOrEqual(44);
          const box = (await slider.boundingBox())!;
          expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(120);
          await slider.fill(game === "basquete" ? "50" : "65");
        }
        await page.getByRole("button", { name: game === "boliche" ? "Lançar bola" : game === "golfe" ? "Dar tacada" : "Arremessar", exact: true }).click();
        await expect(page.locator(".sport-scene [role=status]")).not.toHaveText("");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await page.goto("./#/jogar/futebol");
      await page.getByRole("button", { name: "Cobranças de falta", exact: true }).click();
      for (const name of ["Força", "Elevação", "Curva"]) {
        const slider = page.getByRole("slider", { name, exact: true });
        await expect.poll(async () => Math.round((await slider.boundingBox())?.height ?? 0)).toBeGreaterThanOrEqual(44);
        const box = (await slider.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(120);
        expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);
        await slider.fill(name === "Curva" ? "0" : "55");
      }
      await page.getByRole("button", { name: "Chutar", exact: true }).click();
      await expect(page.locator("[data-football-result]")).not.toHaveAttribute("data-football-result", "ready");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
