import type { Point } from "./engines";
/** Builds one class per board cell using a single pass over the body.
 * O(side² + body length), rather than scanning the whole body for each tile.
 */
export function snakeCellClasses(body: readonly Point[], food: Point | null, side = 16): string[] {
  const result = Array<string>(side * side).fill("");
  if (food && food.x >= 0 && food.x < side && food.y >= 0 && food.y < side) {
    result[food.y * side + food.x] = "snake-food";
  }
  for (let index = body.length - 1; index >= 0; index--) {
    const point = body[index];
    if (point.x < 0 || point.x >= side || point.y < 0 || point.y >= side) continue;
    result[point.y * side + point.x] = index === 0 ? "snake-head" : "snake-body";
  }
  return result;
}
