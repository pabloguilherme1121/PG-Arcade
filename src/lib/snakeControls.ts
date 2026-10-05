import { opposite, type Direction } from "./engines";

// Two turns preserve intentional quick corners without accumulating stale input.
export function queueSnakeTurn(current: Direction, queue: Direction[], next: Direction): Direction[] {
  const previous = queue.at(-1) ?? current;
  if (queue.length >= 2 || next === previous || next === opposite[previous]) return queue;
  return [...queue, next];
}
