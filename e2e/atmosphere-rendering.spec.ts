import { expect, test } from "@playwright/test";

for (const density of [1, 1.25, 2]) {
  test.describe(`vector atmosphere at DPR ${density}`, () => {
    test.use({ deviceScaleFactor: density });
    for (const game of ["rhythm", "ski"]) {
      test(`${game} preserves the original pixels and sharpness after rotation`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.addInitScript(({ snow }) => {
          const results: Array<{ width: number; height: number; max: number; changed: number; pixels: number }> = [];
          Object.assign(window, { __atmosphereResults: results });
          const seen = new Set<string>();
          const counts = new WeakMap<CanvasRenderingContext2D, number>();
          const clear = CanvasRenderingContext2D.prototype.clearRect;
          CanvasRenderingContext2D.prototype.clearRect = function (...args) {
            if (this.canvas.closest(".motion-expansion")) counts.set(this, 0);
            clear.apply(this, args);
          };
          const capture = (c: CanvasRenderingContext2D, path?: Path2D) => {
            if (!(path instanceof Path2D) || !c.canvas.closest(".motion-expansion")) return;
            const count = (counts.get(c) || 0) + 1;
            counts.set(c, count);
            if (count !== 2) return;
            const { width, height } = c.canvas;
            const key = `${width}:${height}`;
            if (seen.has(key)) return;
            seen.add(key);
            // Frozen reference painter from main 9a8fbcd, before path batching.
            const canvas = document.createElement("canvas");
            canvas.width = width; canvas.height = height;
            const r = canvas.getContext("2d")!;
            r.setTransform(c.getTransform());
            const bg = r.createLinearGradient(0, 0, 0, 380);
            bg.addColorStop(0, snow ? "#c7dfed" : "#0c172a");
            bg.addColorStop(1, snow ? "#f0f5f8" : "#1a2d3e");
            r.fillStyle = bg; r.fillRect(0, 0, 480, 380);
            if (snow) {
              r.strokeStyle = "#9ebed240"; r.lineWidth = 2;
              for (let x = -120; x < 600; x += 64) {
                r.beginPath(); r.moveTo(x, 0);
                r.bezierCurveTo(x + 60, 380 / 3, x - 10, 380 * .7, x + 80, 380);
                r.stroke();
              }
              r.fillStyle = "#ffffffaa";
              for (let i = 0; i < 48; i++) r.fillRect((i * 139) % 480, (i * 83) % 380, 2, 2);
            } else {
              const haze = r.createRadialGradient(340, 70, 8, 290, 120, 300);
              haze.addColorStop(0, "#628dc426"); haze.addColorStop(.5, "#61479712"); haze.addColorStop(1, "#101d2b00");
              r.fillStyle = haze; r.fillRect(0, 0, 480, 380);
              for (let i = 0; i < 56; i++) {
                r.fillStyle = i % 3 === 0 ? "#d6e7ff88" : "#aac9ef38";
                r.fillRect((i * 137 + 19) % 480, (i * 79 + 13) % 380, i % 5 === 0 ? 2 : 1, 1);
              }
            }
            const actual = c.getImageData(0, 0, width, height).data;
            const reference = r.getImageData(0, 0, width, height).data;
            let max = 0, changed = 0;
            for (let i = 0; i < actual.length; i += 4) {
              let delta = 0;
              for (let channel = 0; channel < 4; channel++) delta = Math.max(delta, Math.abs(actual[i + channel] - reference[i + channel]));
              max = Math.max(max, delta);
              if (delta > 0) changed++;
            }
            results.push({ width, height, max, changed, pixels: width * height });
          };
          const fill = CanvasRenderingContext2D.prototype.fill;
          CanvasRenderingContext2D.prototype.fill = function (...args: Parameters<typeof fill>) {
            fill.apply(this, args);
            capture(this, args[0] instanceof Path2D ? args[0] : undefined);
          };
          const stroke = CanvasRenderingContext2D.prototype.stroke;
          CanvasRenderingContext2D.prototype.stroke = function (...args: Parameters<typeof stroke>) {
            stroke.apply(this, args); capture(this, args[0]);
          };
        }, { snow: game === "ski" });
        await page.goto(`./#/jogar/${game}`);
        await expect(page.locator(".motion-expansion canvas")).toBeVisible();
        const results = () => page.evaluate(() => (window as unknown as {
          __atmosphereResults: Array<{ width: number; height: number; max: number; changed: number; pixels: number }>;
        }).__atmosphereResults);
        await expect.poll(async () => (await results()).length).toBeGreaterThanOrEqual(1);
        const first = (await results())[0];
        await page.setViewportSize({ width: 844, height: 390 });
        await expect.poll(async () => (await results()).some(r => r.width !== first.width)).toBe(true);
        for (const result of await results()) {
          expect(result.max, JSON.stringify(result)).toBeLessThanOrEqual(2);
          expect(result.changed / result.pixels).toBeLessThanOrEqual(.003);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      });
    }
  });
}
