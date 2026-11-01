import { test, expect } from "@playwright/test";
import { CATALOG_SIZE } from "../src/lib/catalogRelease";
for (const width of [320,390,1200]) {
 test("Capas CSS: catálogo leve, acessível e sem SVG decorativo em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:800});await page.goto("./");
  const cards=page.locator(".game-grid .game-card");
  await expect(cards).toHaveCount(CATALOG_SIZE);
  const covers=cards.locator("[data-game-cover]");
  const metrics=await covers.evaluateAll(nodes=>({
   count:nodes.length,svg:nodes.reduce((n,c)=>n+c.querySelectorAll("svg").length,0),
   artworks:nodes.filter(c=>Boolean(c.querySelector("img.cover-mechanic"))).length,
   background:nodes.filter(c=>Boolean(c.querySelector(".cover-backdrop"))).length,
   dom:document.querySelectorAll("*").length,
   overflow:document.documentElement.scrollWidth>innerWidth,
   fingerprints:new Set(nodes.map(c=>c.getAttribute("data-cover-fingerprint"))).size
  }));
  expect(metrics.count).toBe(CATALOG_SIZE);
  expect(metrics.svg).toBe(0);
  expect(metrics.background).toBe(CATALOG_SIZE);
  expect(metrics.artworks).toBe(CATALOG_SIZE);
  expect(metrics.fingerprints).toBe(CATALOG_SIZE);
  expect(metrics.dom).toBeLessThan(3700);
  expect(metrics.overflow).toBe(false);
  const last=cards.last();await last.scrollIntoViewIfNeeded();
  const fav=last.getByRole("button",{name:/favoritos/i});
  await fav.click();await expect(fav).toHaveAttribute("aria-pressed","true");
  await last.getByRole("link").click();
  await expect(page.locator(".player [data-game-cover]")).toBeVisible();
 });
}
