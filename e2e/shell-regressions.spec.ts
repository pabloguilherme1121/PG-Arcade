import { test, expect } from "@playwright/test";

for (const width of [320, 390]) {
  test(`progress backup fits ${width}px and still restores a file`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./#/progresso");
    const input = page.getByLabel("Restaurar cópia do progresso");
    await expect(input).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const bounds = await input.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await input.setInputFiles({
      name: "mobile-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ favorites: ["snake"], records: { snake: 20 }, visits: {} })),
    });
    await expect(page.getByText("Progresso restaurado.", { exact: false })).toBeVisible();
    await expect(page.locator('.record-list a[href="#/jogar/snake"]')).toContainText("20");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("search ignores accidental surrounding spaces and keeps named catalog links", async ({ page }) => {
  await page.goto("./");
  await page.getByLabel("Buscar jogo").fill("  sNaKe  ");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Jogar Snake", exact: true })).toBeVisible();
});

test("restoring records does not invent explored games", async ({ page }) => {
  await page.goto("./#/progresso");
  await page.getByLabel("Restaurar cópia do progresso").setInputFiles({
    name: "records.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ favorites: [], records: { snake: 20 }, visits: {} })),
  });
  await expect(page.getByText("Progresso restaurado.", { exact: false })).toBeVisible();
  await expect(page.locator(".progress-grid strong").first()).toHaveText("0 de 100");
  await expect(page.locator('.record-list a[href="#/jogar/snake"]')).toContainText("20");
  await page.reload();
  await expect(page.locator(".progress-grid strong").first()).toHaveText("0 de 100");
  await page.locator('.record-list a[href="#/jogar/snake"]').click();
  await expect(page.locator(".snake-board")).toBeVisible();
  await page.getByRole("link", { name: "Meu progresso", exact: true }).click();
  await expect(page.locator(".progress-grid strong").first()).toHaveText("1 de 100");
});

test("exploring respects the in-app reduced motion preference", async ({ page, browserName }) => {
  // Preserve full tracing of the SVG catalog while checking the scroll preference.
  if (browserName === "firefox") test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  await page.locator(".play-preferences summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".play-preferences")).toHaveAttribute("open", "");
  await page.getByLabel("Movimento da interface").selectOption("reduced");
  await expect(page.locator("html")).toHaveAttribute("data-arcade-motion", "reduced");
  await page.evaluate(() => {
    const catalog = document.getElementById("catalogo")!;
    const scroll = catalog.scrollIntoView.bind(catalog);
    catalog.scrollIntoView = (options) => {
      catalog.dataset.requestedScroll = typeof options === "object" ? options.behavior : "";
      scroll(options);
    };
  });
  await page.getByRole("link", { name: "Explorar jogos" }).click();
  await expect(page.locator("#catalogo")).toHaveAttribute("data-requested-scroll", "instant");
});

test("favorite changes persist once per action", async ({ page, browserName }) => {
  // Firefox traces snapshot the 100 SVG covers before and after the reload.
  if (browserName === "firefox") test.setTimeout(60_000);
  await page.goto("./");
  await expect(page.locator(".game-card")).toHaveCount(100);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    document.documentElement.dataset.progressWrites = "0";
    Storage.prototype.setItem = function (key, value) {
      if (key === "pg-arcade-progress-v1") {
        const html = document.documentElement;
        html.dataset.progressWrites = String(Number(html.dataset.progressWrites) + 1);
      }
      return original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "Adicionar Snake aos favoritos", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remover Snake dos favoritos", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-progress-writes", "1");
  await page.reload();
  await expect(page.getByRole("button", { name: "Remover Snake dos favoritos", exact: true })).toHaveAttribute("aria-pressed", "true");
});
