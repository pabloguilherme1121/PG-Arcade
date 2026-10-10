import { expect, test } from "@playwright/test";

test("memory pauses a mismatch on blur and resumes only its remaining observation time", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#/jogar/memoria");
  await expect(page.locator(".memory-card")).toHaveCount(16);
  const time = new Date("2026-10-09T12:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.locator(".memory-card").nth(0).click();
  await page.locator(".memory-card").nth(1).click();
  const exposed = page.locator(".memory-card.revealed:not(.matched)");
  await expect(exposed).toHaveCount(2);
  await page.clock.runFor(200);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.clock.runFor(2000);
  await expect(exposed).toHaveCount(2);
  await expect(page.locator(".memory-card").first()).toBeDisabled();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.clock.runFor(699);
  await expect(exposed).toHaveCount(2);
  await page.clock.runFor(2);
  await expect(exposed).toHaveCount(0);
});

for (const pairs of [4, 12]) {
  test(`memory has a genuine ${pairs}-pair victory and persists it`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./#/jogar/memoria");
    await page.getByLabel("Dificuldade da memória").selectOption(String(pairs));
    await page.getByLabel("Tempo para observar cartas diferentes").selectOption("500");
    const time = new Date("2026-10-09T12:00:00Z");
    await page.clock.install({ time });
    await page.clock.pauseAt(time);
    const cards = page.locator(".memory-card");
    await expect(cards).toHaveCount(pairs * 2);
    const known = new Map<string, number[]>();
    for (let i = 0; i < pairs * 2; i += 2) {
      for (const index of [i, i + 1]) {
        await cards.nth(index).click();
        const name = (await cards.nth(index).getAttribute("aria-label"))!.split(": ")[1];
        known.set(name, [...(known.get(name) || []), index]);
      }
      await page.clock.runFor(501);
      await expect(page.locator(".memory-card.revealed:not(.matched)")).toHaveCount(0);
    }
    expect(known.size).toBe(pairs);
    for (const pair of known.values()) {
      if (await cards.nth(pair[0]).isDisabled()) continue;
      await cards.nth(pair[0]).click();
      await cards.nth(pair[1]).click();
      await expect(cards.nth(pair[0])).toHaveClass(/matched/);
    }
    await expect(page.getByText(/Todos os pares encontrados/)).toBeVisible();
    const moves = Number(await page.locator(".scores strong").first().textContent());
    expect(moves).toBeGreaterThanOrEqual(pairs);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pg-arcade-progress-v1") || "{}").records.memoria)).toBe(moves);
    await page.clock.resume();
    await page.reload();
    await expect(page.locator(".scores strong").nth(1)).toHaveText(String(moves));
  });
}

test("desktop immersive canvas uses the available stage without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => { Element.prototype.requestFullscreen = () => Promise.reject(Error("viewport")); });
  for (const id of ["breakout", "rhythm"]) {
    await page.goto(`./#/jogar/${id}`);
    if (await page.locator(".player-utilities:not([open]) summary").count()) {
    await page.locator(".player-utilities summary").click();
  }
    await page.getByRole("button", { name: "Tela cheia", exact: true }).click();
    await expect(page.locator(".player")).toHaveAttribute("data-immersive", "true");
    await expect.poll(() => page.locator("canvas").evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(560);
    expect(await page.locator("canvas").evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(900);
    expect(await page.locator(".player").evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await expect(page.getByRole("button", { name: "Sair da tela cheia", exact: true })).toBeVisible();
  }
});
