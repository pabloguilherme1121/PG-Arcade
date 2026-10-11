export type TouchGesture = "tap" | "left" | "right" | "up" | "down";

/** Classify a completed touch/pen gesture in display coordinates. */
export function identifyTouchGesture(
  startX: number, startY: number, endX: number, endY: number, threshold = 24,
): TouchGesture | null {
  if (![startX,startY,endX,endY,threshold].every(Number.isFinite)) return null;
  const dx=endX-startX,dy=endY-startY;
  if(Math.max(Math.abs(dx),Math.abs(dy)) < Math.max(0,threshold)) return "tap";
  if(Math.abs(dx)>=Math.abs(dy)) return dx<0?"left":"right";
  return dy<0?"up":"down";
}

/** Physical-pixel cap avoids costly 4K/retina redraws while preserving world coordinates. */
export function calculateCanvasPixels(
  displayWidth: number, worldWidth: number, worldHeight: number, dpr = 1,
): {width:number;height:number} {
  if(!Number.isFinite(displayWidth)||displayWidth<=0||
    !Number.isFinite(worldWidth)||worldWidth<=0||
    !Number.isFinite(worldHeight)||worldHeight<=0) return {width:1,height:1};
  const ratio=worldHeight/worldWidth;
  if(!Number.isFinite(ratio)||ratio<=0) return {width:1,height:1};
  const density=Number.isFinite(dpr)?Math.max(1,Math.min(2.5,dpr)):1;
  const capWidth=Math.max(1,Math.floor(Math.sqrt(1_500_000/ratio)));
  const width=Math.max(1,Math.min(capWidth,2560,Math.round(displayWidth*density)));
  const height=Math.max(1,Math.floor(width*ratio));
  return {width,height};
}

/**
 * A held action already starts on pointer down. Releasing the finger must not
 * enqueue another pulse; discrete shooters can still act on a quick tap.
 */
export function shouldQueueCanvasTapAction(gameId: string, hasActionControl: boolean): boolean {
  return hasActionControl && !["runner", "voo", "jetpack"].includes(gameId);
}
