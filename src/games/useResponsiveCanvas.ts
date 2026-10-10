import { useEffect, useRef, type RefObject } from "react";
import { calculateCanvasPixels } from "../lib/touchCanvas";

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
      // Preserve game-space physics while keeping canvas buffers below ~1.5 MP.
      const {width:pixels,height:rows} = calculateCanvasPixels(
        bounds.width,width,height,window.devicePixelRatio || 1,
      );
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
