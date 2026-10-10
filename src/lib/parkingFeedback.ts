import { moveParking } from "./actionGames";
import type { Direction } from "./engines";

const directions: readonly Direction[] = ["up", "left", "right", "down"];

/** Enumerates traversable adjacent tiles without wrapping across row boundaries. */
export function parkingExitCells(position: number, walls: readonly number[]): number[] {
  if (!Number.isInteger(position) || position < 0 || position >= 36) return [];
  return [...new Set(directions.map(d => moveParking(position, d, [...walls])))]
    .filter(next => next !== position)
    .sort((a,b) => a-b);
}

/** BFS yields a minimal path including start and goal, without changing any game state. */
export function parkingShortestPath(start: number, goal: number, walls: readonly number[]): number[] | null {
  if (![start,goal].every(n => Number.isInteger(n) && n >= 0 && n < 36 && !walls.includes(n)))
    return null;
  if (start===goal) return [start];
  const visited = new Set([start]);
  const previous = new Map<number,number>();
  const queue = [start];
  for (let cursor=0;cursor<queue.length;cursor++) {
    for (const next of parkingExitCells(queue[cursor],walls)) {
      if (visited.has(next)) continue;
      visited.add(next);
      previous.set(next,queue[cursor]);
      if (next===goal) {
        const path=[goal];
        while(path[0]!==start) path.unshift(previous.get(path[0])!);
        return path;
      }
      queue.push(next);
    }
  }
  return null;
}
