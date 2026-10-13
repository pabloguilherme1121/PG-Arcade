import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { actionCollectionGames } from "../src/lib/actionCollection";
import { newGames } from "../src/lib/newCatalog";
import type { MotionState } from "../src/lib/motionExpansion";

for (const width of [320, 390]) {
  test(`all 20 canvas briefings show their real objective inside the arena at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const game of [...actionCollectionGames, ...newGames.filter(g => g.family === "motion")]) {
      await page.goto(`./#/jogar/${game.id}`);
      const panel = page.locator('.arena-feedback[data-arena-phase="ready"]');
      await expect(panel).toBeVisible();
      await expect(panel.locator(".arena-summary")).not.toHaveText("");
      await expect(panel.locator(".arena-hint")).not.toHaveText("");
      const bounds = await panel.evaluate(el => {
        const arena = el.parentElement!.getBoundingClientRect();
        const children = Array.from(el.children).map(child => child.getBoundingClientRect());
        return children.every(r => r.left >= arena.left - 1 && r.right <= arena.right + 1 && r.top >= arena.top - 1 && r.bottom <= arena.bottom + 1);
      });
      expect(bounds, game.id).toBe(true);
      await expect(page.locator(".arena-progress progress")).toHaveAttribute("value", "0");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), game.id).toBe(true);
    }
  });
}

test("mission progress freezes on pause and resistance has no invented target", async ({ page }) => {
  await page.goto("./#/jogar/breakout");
  const now = new Date("2026-10-12T12:00:00Z");
  await page.clock.install({ time: now });
  await page.clock.pauseAt(new Date(+now + 1000));
  const goal = page.getByRole("progressbar", { name: "Progresso: Meta da missão", exact: true });
  await expect(goal).toHaveAttribute("max", "600");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await expect(page.locator(".arena-feedback")).toHaveCount(0);
  await page.clock.runFor(1200);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const progress = await page.locator(".arena-progress").textContent();
  const result = await page.locator(".arena-result").textContent();
  await page.clock.runFor(4000);
  await expect(page.locator(".arena-progress")).toHaveText(progress!);
  await expect(page.locator(".arena-result")).toHaveText(result!);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator("canvas[data-expanded-board]")).toBeFocused();
  await page.getByRole("button", { name: "Nova partida", exact: true }).click();
  await page.getByRole("combobox", { name: "Modo", exact: true }).selectOption("endless");
  await expect(goal).toHaveCount(0);
  await expect(page.locator(".arena-summary")).toContainText("Sem limite de tempo");
});

test("motion victory shows the achieved result and focuses replay without replaying inputs", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.addInitScript(() => {
    const clone = structuredClone.bind(window);
    let seeded = false;
    window.structuredClone = ((value: unknown, options?: StructuredSerializeOptions) => {
      const result = clone(value, options) as MotionState;
      if (!seeded && result?.id === "balloons" && result.status === "running") {
        seeded = true;
        result.time = 44.99;
        result.score = 88;
        result.lives = 3;
        result.spawn = 100;
        result.objects = [];
      }
      return result;
    }) as typeof structuredClone;
  });
  await page.goto("./#/jogar/balloons");
  const now = new Date("2026-10-12T12:00:00Z");
  await page.clock.install({ time: now });
  await page.clock.pauseAt(new Date(+now + 1000));
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.clock.runFor(200);
  const panel = page.locator('.arena-feedback[data-arena-phase="done"]');
  await expect(panel).toContainText("Desafio concluído!");
  await expect(panel.locator("dd").nth(0)).toHaveText("388");
  await expect(panel.locator("dd").nth(1)).toHaveText("45 s");
  await expect(panel.locator("dd").nth(2)).toHaveText("3");
  await expect(page.getByRole("progressbar", { name: "Progresso: Resistência", exact: true })).toHaveAttribute("value", "45");
  await expect(panel.getByRole("button", { name: "Jogar novamente", exact: true })).toBeFocused();
  const frozen = await panel.textContent();
  await page.clock.runFor(1000);
  await expect(panel).toHaveText(frozen!);
  // Axe schedules work on the page's timers; resume the clock after proving
  // the terminal simulation and summary are frozen.
  await page.clock.resume();
  const audit = await new AxeBuilder({ page }).include('.motion-expansion').analyze();
  expect(audit.violations).toEqual([]);
  await page.locator(".motion-stage").screenshot({ path: testInfo.outputPath("canvas-result-mobile.png") });
  await page.keyboard.press("Enter");
  await expect(page.locator('.arena-feedback[data-arena-phase="ready"]')).toBeVisible();
  await expect(page.locator(".arena-progress progress")).toHaveAttribute("value", "0");
});
