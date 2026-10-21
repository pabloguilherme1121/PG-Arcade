import {test,expect} from "@playwright/test";
import {CATALOG_SIZE} from "../src/lib/catalogRelease";
test("all catalog covers retain unique mechanics without a separate inline SVG scene",async({page})=>{
 await page.goto("./");
 const cards=page.locator(".game-grid [data-catalog-game]");
 await expect(cards).toHaveCount(CATALOG_SIZE);
 const covers=cards.locator(".game-cover");
 await expect(covers).toHaveCount(CATALOG_SIZE);
 await expect(covers.locator("img.cover-mechanic")).toHaveCount(CATALOG_SIZE);
 await expect(covers.locator("svg")).toHaveCount(0);
 await expect(covers.locator(".cover-brand")).toHaveCount(CATALOG_SIZE);
 await expect(covers.locator(".cover-chapter")).toHaveCount(CATALOG_SIZE);
 const data=await covers.evaluateAll(nodes=>nodes.map(node=>({
  id:node.getAttribute("data-game-cover"),fingerprint:node.getAttribute("data-cover-fingerprint"),
  background:getComputedStyle(node).backgroundColor,
  width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height
 })));
 expect(new Set(data.map(x=>x.id)).size).toBe(CATALOG_SIZE);
 expect(new Set(data.map(x=>x.fingerprint)).size).toBe(CATALOG_SIZE);
 expect(data.every(item=>item.width>1&&item.height>1)).toBe(true);
});
