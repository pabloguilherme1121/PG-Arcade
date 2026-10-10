import { describe, expect, it } from "vitest";
import { identifyTouchGesture, calculateCanvasPixels } from "./touchCanvas";

describe("mobile touch gestures", () => {
  it("distinguishes taps from directional swipes without a screen-edge wrap", () => {
    expect(identifyTouchGesture(0,0,8,12)).toBe("tap");
    expect(identifyTouchGesture(0,0,24,5)).toBe("right");
    expect(identifyTouchGesture(80,0,21,3)).toBe("left");
    expect(identifyTouchGesture(0,0,4,-28)).toBe("up");
    expect(identifyTouchGesture(0,0,7,32)).toBe("down");
    expect(identifyTouchGesture(0,0,23,23)).toBe("tap");
  });
  it("rejects invalid input rather than issuing a false move", () => {
    expect(identifyTouchGesture(NaN,0,24,0)).toBeNull();
    expect(identifyTouchGesture(0,0,Infinity,0)).toBeNull();
  });
});

describe("high-density canvas render budget", () => {
  it("keeps world aspect and actual pixel cap on 3x and 4x screens", () => {
    for(const dpr of [1,2,3,4]) {
      const { width,height }=calculateCanvasPixels(2000,480,360,dpr);
      expect(width*height).toBeLessThanOrEqual(1_500_000);
      expect(width).toBeGreaterThan(0);
      expect(Math.abs(width/height-4/3)).toBeLessThan(.005);
    }
  });
  it("uses native-ish density for normal mobile boards without oversampling", () => {
    const mobile=calculateCanvasPixels(320,480,360,3);
    expect(mobile.width).toBe(800);
    expect(mobile.height).toBe(600);
    const normal=calculateCanvasPixels(320,480,360,1);
    expect(normal).toEqual({width:320,height:240});
  });
  it("falls back safely for invalid ratios and tiny widths", () => {
    expect(calculateCanvasPixels(0,480,360,NaN)).toEqual({width:1,height:1});
    expect(calculateCanvasPixels(320,0,360,3)).toEqual({width:1,height:1});
  });
});
