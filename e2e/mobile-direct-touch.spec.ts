import { expect, test } from "@playwright/test";
test.use({ hasTouch: true });

for (const [id,selector] of [
  ["runner",".action-collection"],["invasores",".action-collection"],["rhythm",".motion-expansion"],["stack",".motion-expansion"],
] as const) {
  test(`${id}: arena tocável, controles e renderização mobile sem overflow`, async ({page}) => {
    await page.setViewportSize({width:320,height:740});
    await page.goto(`./#/jogar/${id}`);
    const game=page.locator(selector);
    await expect(game).toBeVisible();
    const canvas=game.locator("canvas").first();
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveCSS("touch-action","none");
    const box=await canvas.boundingBox();
    expect(box).not.toBeNull();
    const nativePixels=await canvas.evaluate(node=>({width:(node as HTMLCanvasElement).width,height:(node as HTMLCanvasElement).height}));
    expect(nativePixels.width*nativePixels.height).toBeLessThanOrEqual(1_500_000);
    await game.getByRole("button",{name:"Começar",exact:true}).click();
    await page.touchscreen.tap(box!.x+box!.width/2,box!.y+box!.height/2);
    await expect(canvas).toHaveAttribute("data-touch-ready","true");
    await expect(canvas).toHaveAttribute("data-touch-last-gesture","tap");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
