import { expect, test } from "@playwright/test";

test("Liga 4 prevê onde cai a peça e permite jogar com setas e Enter", async ({ page }) => {
  await page.setViewportSize({width: 320, height: 740});
  await page.goto("./#/jogar/liga4");
  const board = page.locator(".connect-board");
  await expect(board).toBeVisible();
  const preview = page.locator("[data-disc-preview='true']");
  await expect(preview).toHaveCount(1);
  await expect(preview).toHaveAttribute("data-cell", "38");
  await expect(board).toHaveAttribute("data-selected-column", "4");
  await board.focus();
  await board.press("ArrowLeft");
  await expect(board).toHaveAttribute("data-selected-column", "3");
  await expect(preview).toHaveAttribute("data-cell", "37");
  await board.press("Enter");
  await expect(board.locator(".disc-1")).toHaveCount(1);
  await expect(board.locator(".disc-1")).toHaveAttribute("data-cell", "37");
  await expect(preview).toHaveAttribute("data-cell", "30");
  await expect(preview).toHaveAttribute("data-player", "2");
  await expect(page.locator("[data-connect-hud]")).toContainText("Jogador 2");
  await page.getByRole("button", {name: "Desfazer jogada", exact:true}).click();
  await expect(board.locator(".disc-1")).toHaveCount(0);
  await expect(preview).toHaveAttribute("data-cell", "37");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Liga 4 mantém toque e teclas numéricas em viewport móvel", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("./#/jogar/liga4");
  const board=page.locator(".connect-board");
  await page.getByRole("button",{name:"Jogar na coluna 7"}).click();
  await expect(board.locator(".disc-1")).toHaveAttribute("data-cell","41");
  await board.focus();
  await board.press("4");
  await expect(board.locator(".disc-2")).toHaveAttribute("data-cell","38");
  await page.getByRole("button",{name:"Nova partida",exact:true}).click();
  await expect(board.locator(".disc-1")).toHaveCount(0);
  await expect(board.locator(".disc-2")).toHaveCount(0);
  await expect(board).toHaveAttribute("data-selected-column","4");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
