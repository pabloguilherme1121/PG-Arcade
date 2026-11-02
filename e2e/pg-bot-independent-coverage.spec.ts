import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Every independent strategy arena ships an inspectable local assistant.
// Discover folders dynamically so adding a game without PG Bot fails CI.
const independentes = readdirSync(join(process.cwd(), "public", "estrategia", "independentes"), {
  withFileTypes: true,
}).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();

test("independent strategy arenas retain the minimum registered catalog", () => {
  expect(independentes.length).toBeGreaterThanOrEqual(27);
});

for (const slug of independentes) {
  test(`PG Bot opens and gives accessible local help: ${slug}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(`./estrategia/independentes/${slug}/`);

    const bot = page.locator("#pg-bot");
    await expect(bot).toBeVisible();
    await bot.locator("summary").click();
    await expect(bot).toHaveAttribute("open", "");
    const topic = bot.locator("button").first();
    const answer = bot.locator("#bot-answer, #bot-response, #market-bot-answer, [data-bot-answer]");
    await expect(topic).toBeVisible();
    await expect(answer).toHaveCount(1);
    const initial = (await answer.textContent())?.trim() || "";
    await topic.click();
    await expect(answer).toHaveText(/\S/);
    // Alguns jogos iniciam com o primeiro assunto já respondido. Confira outro tópico.
    if (initial && (await answer.textContent())?.trim() === initial && await bot.locator("button").count() > 1) {
      await bot.locator("button").nth(1).click();
      await expect(answer).not.toHaveText(initial);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);

    const audit = await new AxeBuilder({ page }).include("#pg-bot").analyze();
    const violations = audit.violations.filter(({ impact }) => impact === "serious" || impact === "critical");
    expect(violations.map(({ id, nodes }) => ({
      id, targets: nodes.map(node => node.target),
    }))).toEqual([]);
  });
}
