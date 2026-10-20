import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 320, height: 740 }, { width: 844, height: 390 }]) {
  test(`leilão indica pares e trios em ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#/jogar/leilao");
    await page.getByRole("button", { name: "Começar leilão" }).click();
    const familyChips = page.locator(".ra-family-progress span");
    await expect(familyChips).toHaveCount(6);
    expect((await familyChips.allTextContents()).every(text => text.includes("0/3"))).toBe(true);
    await page.getByRole("button", { name: "Confirmar lance secreto" }).click();
    const labels = await familyChips.allTextContents();
    expect(labels.filter(text => text.includes("1/3"))).toHaveLength(1);
    expect(labels.filter(text => text.includes("0/3"))).toHaveLength(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
