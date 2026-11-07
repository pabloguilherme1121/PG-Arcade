import { test, expect } from "@playwright/test";
import { CATALOG_SIZE } from "../src/lib/catalogRelease";

test("catalog keeps unique local artwork and CSS backgrounds for every game", async ({page}) => {
  await page.goto("./");
  const covers = page.locator(".game-grid [data-game-cover]");
  await expect(covers).toHaveCount(CATALOG_SIZE);
  const summary=await covers.evaluateAll(elements=>elements.map(el=>({
    id:el.getAttribute("data-game-cover"),
    fingerprint:el.getAttribute("data-cover-fingerprint"),
    background:!!el.querySelector(".cover-backdrop"),
    backgroundPaint:el.querySelector(".cover-backdrop")?getComputedStyle(el.querySelector(".cover-backdrop")!).backgroundImage:"",
    image:!!el.querySelector("img.cover-mechanic"),
    svg:!!el.querySelector("svg"),
    width:el.getBoundingClientRect().width,
    height:el.getBoundingClientRect().height
  })));
  expect(new Set(summary.map(x=>x.id)).size).toBe(CATALOG_SIZE);
  expect(new Set(summary.map(x=>x.fingerprint)).size).toBe(CATALOG_SIZE);
  expect(summary.every(x=>x.background && x.backgroundPaint.includes("linear-gradient"))).toBe(true);
  expect(summary.every(x=>x.image && !x.svg && x.width>20 && x.height>20)).toBe(true);
});
