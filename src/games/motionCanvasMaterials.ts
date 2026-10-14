type Materials = {
  width: number; height: number; snow: boolean;
  background: CanvasGradient; haze: CanvasGradient | null; edge: CanvasGradient;
};
// Fixed 480×380 world transform. Keep only the current resolution/theme per
// context; no raster layers, DPR history or strong references to detached games.
const cache = new WeakMap<CanvasRenderingContext2D, Materials>();
const observed = new WeakSet<CanvasRenderingContext2D>();

export function motionCanvasMaterials(c: CanvasRenderingContext2D, snow = false): Materials {
  const { width, height } = c.canvas;
  const previous = cache.get(c);
  if (previous?.width === width && previous.height === height && previous.snow === snow) return previous;
  const background = c.createLinearGradient(0, 0, 0, 380);
  background.addColorStop(0, snow ? "#c7dfed" : "#0c172a");
  background.addColorStop(1, snow ? "#f0f5f8" : "#1a2d3e");
  let haze: CanvasGradient | null = null;
  if (!snow) {
    haze = c.createRadialGradient(340, 70, 8, 290, 120, 300);
    haze.addColorStop(0, "#628dc426");
    haze.addColorStop(.5, "#61479712");
    haze.addColorStop(1, "#101d2b00");
  }
  const edge = c.createRadialGradient(240, 190, 130, 240, 190, 360);
  edge.addColorStop(0, "#00000000");
  edge.addColorStop(1, snow ? "#54788b22" : "#00000060");
  const materials = { width, height, snow, background, haze, edge };
  if (!observed.has(c)) {
    c.canvas.addEventListener("contextrestored", () => cache.delete(c));
    observed.add(c);
  }
  cache.set(c, materials);
  return materials;
}
