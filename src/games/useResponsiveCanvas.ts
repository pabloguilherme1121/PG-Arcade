import { useEffect, useRef, type RefObject } from "react";

/** Preserve world coordinates while matching the drawing buffer to display pixels. */
export function useResponsiveCanvas(
  canvas: RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
  redraw: (context: CanvasRenderingContext2D) => void,
) {
  const draw = useRef(redraw);
  draw.current = redraw;
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext("2d");
    if (!context) return;
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width <= 0) return;
      // Bound GPU memory on 4K/retina displays; physics never depend on resolution.
      const pixels = Math.min(2560, Math.round(bounds.width * Math.min(window.devicePixelRatio || 1, 3)));
      const rows = Math.round(pixels * height / width);
      if (element.width !== pixels || element.height !== rows) {
        element.width = pixels;
        element.height = rows;
      }
      context.setTransform(pixels / width, 0, 0, rows / height, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      draw.current(context);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    window.addEventListener("resize", resize);
    resize();
    return () => { observer.disconnect(); window.removeEventListener("resize", resize); };
  }, [canvas, width, height]);
}
