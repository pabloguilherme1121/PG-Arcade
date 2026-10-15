type Palette = {
  width: number;
  height: number;
  space: boolean;
  sky: CanvasGradient;
  haze: CanvasGradient | null;
};

// Keep only the current palette per context. CanvasGradient objects are bound
// to their context, so never reuse them across canvases or GPU restorations.
const palettes = new WeakMap<CanvasRenderingContext2D, Palette>();
const observed = new WeakSet<CanvasRenderingContext2D>();

export function actionCanvasMaterials(context: CanvasRenderingContext2D, space: boolean): Palette {
  const { width, height } = context.canvas;
  const cached = palettes.get(context);
  if (cached?.width === width && cached.height === height && cached.space === space) return cached;

  const sky = context.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, space ? "#071026" : "#162c40");
  sky.addColorStop(1, space ? "#192a43" : "#43606b");
  let haze: CanvasGradient | null = null;
  if (!space) {
    haze = context.createLinearGradient(0, 120, 0, 330);
    haze.addColorStop(0, "rgba(216,236,242,.08)");
    haze.addColorStop(1, "rgba(8,20,26,0)");
  }
  if (!observed.has(context)) {
    context.canvas.addEventListener("contextrestored", () => palettes.delete(context));
    observed.add(context);
  }
  const palette = { width, height, space, sky, haze };
  palettes.set(context, palette);
  return palette;
}
