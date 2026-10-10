import type { RunObject } from "./runEngine";

export type LaneRadarStatus = "clear" | "reward" | "danger";

/** Read-only snapshot of visible near-field objects. Warnings are informational. */
export function runLaneRadar(objects: readonly RunObject[]): LaneRadarStatus[] {
  const lanes: LaneRadarStatus[] = ["clear", "clear", "clear"];
  for (const item of objects) {
    if (!Number.isInteger(item.lane) || item.lane < 0 || item.lane > 2
      || item.y < 25 || item.y > 85) continue;
    if (!item.reward) lanes[item.lane] = "danger";
    else if (lanes[item.lane] === "clear") lanes[item.lane] = "reward";
  }
  return lanes;
}

/** Percentage complete for timed rounds; survival has no finite deadline. */
export function runTimeProgress(ticks: number, limit: number): number | null {
  if (!Number.isFinite(limit) || limit <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((ticks / limit) * 100)));
}
