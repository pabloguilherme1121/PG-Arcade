import { expect, it, vi } from "vitest";
import { motionCanvasMaterials } from "./motionCanvasMaterials";

function context() {
  const canvas = new EventTarget() as EventTarget & { width: number; height: number };
  canvas.width = 480; canvas.height = 380;
  const gradient = () => ({ addColorStop: vi.fn() });
  const c = { canvas, createLinearGradient: vi.fn(gradient), createRadialGradient: vi.fn(gradient) };
  return c as unknown as CanvasRenderingContext2D & typeof c;
}

it("reuses all static gradients across 120 frames instead of allocating them every frame", () => {
  const c = context(), initial = motionCanvasMaterials(c);
  for (let i = 0; i < 120; i++) expect(motionCanvasMaterials(c)).toBe(initial);
  expect(c.createLinearGradient).toHaveBeenCalledTimes(1);
  expect(c.createRadialGradient).toHaveBeenCalledTimes(2);
});
it("rebuilds after resizing either buffer dimension and does not reuse obsolete transforms", () => {
  const c = context(), initial = motionCanvasMaterials(c);
  c.canvas.width = 640;
  const wider = motionCanvasMaterials(c);
  expect(wider).not.toBe(initial);
  c.canvas.height = 506;
  expect(motionCanvasMaterials(c)).not.toBe(wider);
  expect(c.createLinearGradient).toHaveBeenCalledTimes(3);
});
it("isolates contexts and preserves the original colors for both themes", () => {
  const c = context(), d = context();
  const a = motionCanvasMaterials(c), b = motionCanvasMaterials(d, true);
  expect(a.background).not.toBe(b.background);
  expect(c.createLinearGradient.mock.results[0].value.addColorStop.mock.calls).toEqual([[0,"#0c172a"],[1,"#1a2d3e"]]);
  expect(d.createLinearGradient.mock.results[0].value.addColorStop.mock.calls).toEqual([[0,"#c7dfed"],[1,"#f0f5f8"]]);
});
it("recreates resources after a canvas context is restored at the same resolution", () => {
  const c = context(), observe = vi.spyOn(c.canvas, "addEventListener"), initial = motionCanvasMaterials(c);
  c.canvas.dispatchEvent(new Event("contextrestored"));
  expect(motionCanvasMaterials(c)).not.toBe(initial);
  c.canvas.dispatchEvent(new Event("contextrestored"));
  motionCanvasMaterials(c);
  expect(observe).toHaveBeenCalledTimes(1);
});
it("rebuilds the palette when switching between normal and snow on the same canvas", () => {
  const c = context(), normal = motionCanvasMaterials(c);
  const snow = motionCanvasMaterials(c, true);
  expect(snow).not.toBe(normal);
  expect(snow.haze).toBeNull();
  expect(motionCanvasMaterials(c, true)).toBe(snow);
  expect(motionCanvasMaterials(c).haze).not.toBeNull();
});
