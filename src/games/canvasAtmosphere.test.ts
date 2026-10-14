import { afterEach, expect, it, vi } from "vitest";

class VectorPath {
  rect = vi.fn(); moveTo = vi.fn(); bezierCurveTo = vi.fn();
}
async function setup() {
  vi.resetModules();
  vi.stubGlobal("Path2D", VectorPath);
  const c = {
    stroke: vi.fn(), fill: vi.fn(), fillRect: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  };
  const { paintAtmosphere } = await import("./canvasAtmosphere");
  return { c, paint: (height = 380, snow = false) => paintAtmosphere(c as unknown as CanvasRenderingContext2D, height, snow) };
}
afterEach(() => vi.unstubAllGlobals());

it("renders the 56 original stars with three draw calls and reuses their vector geometry", async () => {
  const { c, paint } = await setup();
  paint();
  const bright = c.fill.mock.calls[0][0] as VectorPath;
  const dim = c.fill.mock.calls[1][0] as VectorPath;
  expect(bright.rect).toHaveBeenCalledTimes(19);
  expect(dim.rect).toHaveBeenCalledTimes(37);
  expect(bright.rect.mock.calls[0]).toEqual([19, 13, 2, 1]);
  expect(c.fillRect).toHaveBeenCalledTimes(1);
  expect(c.fill).toHaveBeenCalledTimes(2);
  paint();
  expect(c.fill.mock.calls[2][0]).toBe(bright);
  expect(c.fill.mock.calls[3][0]).toBe(dim);
  expect(bright.rect).toHaveBeenCalledTimes(19);
});

it("batches all 12 snow tracks and 48 flakes into two draws without raster buffers", async () => {
  const { c, paint } = await setup();
  paint(380, true);
  const tracks = c.stroke.mock.calls[0][0] as VectorPath;
  const flakes = c.fill.mock.calls[0][0] as VectorPath;
  expect(tracks.moveTo).toHaveBeenCalledTimes(12);
  expect(tracks.bezierCurveTo).toHaveBeenCalledTimes(12);
  expect(flakes.rect).toHaveBeenCalledTimes(48);
  expect(c.fillRect).not.toHaveBeenCalled();
  paint(380, true);
  expect(c.stroke.mock.calls[1][0]).toBe(tracks);
  expect(c.fill.mock.calls[1][0]).toBe(flakes);
});

it("keeps themes separate and rebuilds world geometry when height changes", async () => {
  const { c, paint } = await setup();
  paint(); const stars = c.fill.mock.calls[0][0];
  paint(380, true);
  paint(); expect(c.fill.mock.calls[3][0]).toBe(stars);
  paint(320); expect(c.fill.mock.calls[5][0]).not.toBe(stars);
});

it("ignores invalid heights instead of building invalid canvas paths", async () => {
  const { c, paint } = await setup();
  for (const height of [0, -1, NaN, Infinity]) paint(height);
  expect(c.fill).not.toHaveBeenCalled();
  expect(c.stroke).not.toHaveBeenCalled();
  expect(c.createRadialGradient).not.toHaveBeenCalled();
});
