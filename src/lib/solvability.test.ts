import { it, expect } from "vitest";
import { boardClick, newBoard, type BoardState } from "./boardExpansion";
it("Resta Um's initial board has a complete legal solution", () => {
  const initial = newBoard("peg"),
    geometry = initial.cells.map((v) => (v < 0 ? -1 : 0));
  // Enumerate the board geometry, independently of the occupied middle squares.
  const moves: [number, number, number][] = [];
  for (let i = 0; i < 25; i++)
    if (geometry[i] === 0)
      for (const d of [-1, 1, -5, 5]) {
        const j = i + d,
          k = i + 2 * d;
        if (
          k >= 0 &&
          k < 25 &&
          geometry[j] === 0 &&
          geometry[k] === 0 &&
          (Math.abs(d) !== 1 || Math.floor(i / 5) === Math.floor(k / 5))
        )
          moves.push([i, j, k]);
      }
  const memo = new Set<number>();
  function solve(mask: number): number[][] | null {
    if ((mask & (mask - 1)) === 0) return [];
    if (memo.has(mask)) return null;
    for (const [a, b, c] of moves)
      if (mask & (1 << a) && mask & (1 << b) && !(mask & (1 << c))) {
        const next = mask ^ (1 << a) ^ (1 << b) ^ (1 << c),
          rest = solve(next);
        if (rest) return [[a, c], ...rest];
      }
    memo.add(mask);
    return null;
  }
  const mask = initial.cells.reduce(
      (m, v, i) => (v === 1 ? m | (1 << i) : m),
      0,
    ),
    path = solve(mask);
  expect(path).not.toBeNull();
  let s = initial;
  for (const [a, b] of path!) s = boardClick(boardClick(s, a), b);
  expect(s.status).toBe("won");
}, 20000);
for (const id of ["colorsort", "watersort"] as const)
  it(`${id}'s mixed opening has a complete legal solution`, () => {
    const initial = newBoard(id),
      key = (s: BoardState) =>
        Array.from({ length: 6 }, (_, i) =>
          s.cells.slice(i * 4, i * 4 + 4).join(""),
        )
          .sort()
          .join("|"),
      queue = [initial],
      seen = new Set([key(initial)]);
    let solved: BoardState | undefined;
    for (let k = 0; k < queue.length && k < 100000 && !solved; k++) {
      const s = queue[k];
      for (let from = 0; from < 6 && !solved; from++)
        for (let to = 0; to < 6; to++) {
          if (from === to) continue;
          const next = boardClick(
            boardClick({ ...s, selected: -1 }, from * 4),
            to * 4,
          );
          if (next.moves === s.moves) continue;
          if (next.status === "won") {
            solved = next;
            break;
          }
          const hash = key(next);
          if (!seen.has(hash)) {
            seen.add(hash);
            queue.push(next);
          }
        }
    }
    expect(solved?.status).toBe("won");
  }, 20000);
