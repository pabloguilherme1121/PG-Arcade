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
    let lastPixels = 0;
    let lastRows = 0;
    let frame: number | null = null;
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width <= 0) return;
      // Preserve game-space physics while keeping canvas buffers below ~1.5 MP.
      const {width:pixels,height:rows} = calculateCanvasPixels(
        bounds.width,width,height,window.devicePixelRatio || 1,
      );
      // A window resize and ResizeObserver can report the same physical size.
      // Do not repaint an unchanged backing buffer twice on mobile.
      if (lastPixels === pixels && lastRows === rows
        && element.width === pixels && element.height === rows) return;
      lastPixels = pixels;
      lastRows = rows;
      if (element.width !== pixels || element.height !== rows) {
        element.width = pixels;
        element.height = rows;
      }
      context.setTransform(pixels / width, 0, 0, rows / height, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      draw.current(context);
    };
    // Rotation and browser chrome can emit several resize signals in one frame.
    // Read layout once, after it settles, rather than once per signal.
    const scheduleResize = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        resize();
      });
    };
    const restore = () => {
      // Context restoration resets drawing state even when dimensions are unchanged.
      lastPixels = 0;
      lastRows = 0;
      scheduleResize();
    };
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(element);
    window.addEventListener("resize", scheduleResize);
    element.addEventListener("contextrestored", restore);
    resize();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleResize);
      element.removeEventListener("contextrestored", restore);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [canvas, width, height]);
}
