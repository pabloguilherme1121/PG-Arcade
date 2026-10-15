import { expect, it, vi } from "vitest";
import { actionCanvasMaterials } from "./actionCanvasMaterials";

function context() {
  const canvas = new EventTarget() as EventTarget & { width: number; height: number };
  canvas.width = 480;
  canvas.height = 360;
  const gradient = () => ({ addColorStop: vi.fn() });
  const c = { canvas, createLinearGradient: vi.fn(gradient) };
  return c as unknown as CanvasRenderingContext2D & typeof c;
}

it("reuses the action background and haze over 120 frames", () => {
  const c = context();
  const initial = actionCanvasMaterials(c, false);
  for (let i = 0; i < 120; i++) expect(actionCanvasMaterials(c, false)).toBe(initial);
  expect(c.createLinearGradient).toHaveBeenCalledTimes(2);
});

it("isolates graphics resources by context and game theme", () => {
  const c = context(), other = context();
  const land = actionCanvasMaterials(c, false);
  const space = actionCanvasMaterials(c, true);
  expect(space).not.toBe(land);
  expect(space.haze).toBeNull();
  expect(actionCanvasMaterials(other, true).sky).not.toBe(space.sky);
  expect(c.createLinearGradient.mock.results[2].value.addColorStop.mock.calls)
    .toEqual([[0, "#071026"], [1, "#192a43"]]);
});

it("rebuilds palette after resolution change or context restoration without extra listeners", () => {
  const c = context();
  const listener = vi.spyOn(c.canvas, "addEventListener");
  const original = actionCanvasMaterials(c, false);
  c.canvas.width = 640;
  const resized = actionCanvasMaterials(c, false);
  expect(resized).not.toBe(original);
  c.canvas.dispatchEvent(new Event("contextrestored"));
  expect(actionCanvasMaterials(c, false)).not.toBe(resized);
  expect(listener).toHaveBeenCalledTimes(1);
});

it("keeps the exact normal colors and gradient geometry", () => {
  const c = context();
  actionCanvasMaterials(c, false);
  expect(c.createLinearGradient.mock.calls).toEqual([[0, 0, 0, 360], [0, 120, 0, 330]]);
  expect(c.createLinearGradient.mock.results[0].value.addColorStop.mock.calls)
    .toEqual([[0, "#162c40"], [1, "#43606b"]]);
  expect(c.createLinearGradient.mock.results[1].value.addColorStop.mock.calls)
    .toEqual([[0, "rgba(216,236,242,.08)"], [1, "rgba(8,20,26,0)"]]);
});
