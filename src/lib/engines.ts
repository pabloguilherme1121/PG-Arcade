export type Direction = "up" | "down" | "left" | "right";
export function slide2048(board: number[], direction: Direction) {
  const next = [...board];
  let score = 0;
  for (let line = 0; line < 4; line++) {
    const indexes = Array.from({ length: 4 }, (_, n) =>
      direction === "left"
        ? line * 4 + n
        : direction === "right"
          ? line * 4 + 3 - n
          : direction === "up"
            ? n * 4 + line
            : (3 - n) * 4 + line,
    );
    const values = indexes.map((i) => board[i]).filter(Boolean),
      merged: number[] = [];
    for (let n = 0; n < values.length; n++) {
      if (values[n] === values[n + 1]) {
        const value = values[n] * 2;
        merged.push(value);
        score += value;
        n++;
      } else merged.push(values[n]);
    }
    indexes.forEach((index, n) => {
      next[index] = merged[n] ?? 0;
    });
  }
  return {
    board: next,
    score,
    changed: next.some((value, n) => value !== board[n]),
  };
}
export function spawn2048(board: number[], random: () => number = Math.random) {
  const empty = board.flatMap((value, index) => (value ? [] : [index]));
  if (!empty.length) return board;
  const next = [...board];
  next[empty[Math.min(empty.length - 1, Math.floor(random() * empty.length))]] =
    random() < 0.9 ? 2 : 4;
  return next;
}
export function new2048() {
  return spawn2048(spawn2048(Array(16).fill(0)));
}
export function canMove2048(board: number[]) {
  return (["up", "down", "left", "right"] as Direction[]).some(
    (d) => slide2048(board, d).changed,
  );
}
export type Point = { x: number; y: number };
export const opposite: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};
export function queueSnakeDirection(
  current: Direction,
  pending: Direction,
  next: Direction,
): Direction {
  const reference = pending === opposite[current] ? current : pending;
  return next === opposite[reference] ? pending : next;
}
export function samePoint(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}
export function stepSnake(
  body: Point[],
  direction: Direction,
  food: Point,
  size = 16,
) {
  const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[
    direction
  ];
  const head = { x: body[0].x + delta[0], y: body[0].y + delta[1] };
  const ate = samePoint(head, food);
  const collision =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= size ||
    head.y >= size ||
    (ate ? body : body.slice(0, -1)).some((p) => samePoint(p, head));
  return {
    body: collision ? body : [head, ...(ate ? body : body.slice(0, -1))],
    ate,
    collision,
  };
}
export function snakeFood(
  body: Point[],
  size = 16,
  random: () => number = Math.random,
): Point | null {
  const empty: Point[] = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (!body.some((p) => p.x === x && p.y === y)) empty.push({ x, y });
  return (
    empty[Math.min(empty.length - 1, Math.floor(random() * empty.length))] ??
    null
  );
}
export function shuffledPairs(
  pairs: number,
  random: () => number = Math.random,
) {
  const cards = Array.from({ length: pairs * 2 }, (_, i) => i % pairs);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
