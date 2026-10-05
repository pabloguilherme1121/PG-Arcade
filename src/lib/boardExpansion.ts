import type { BoardId } from "./newCatalog";
export type BoardState = {
  id: BoardId;
  size: number;
  cells: number[];
  goal: number[];
  fixed: number[];
  aux: number[];
  selected: number;
  value: number;
  moves: number;
  phase: number;
  status: "playing" | "won" | "lost";
  message: string;
  difficulty: number;
  seed: number;
};
export function seeded(seed: number) {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}
export function neighbors(i: number, n: number, diagonal = false): number[] {
  const r = Math.floor(i / n),
    c = i % n,
    out: number[] = [];
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++)
      if (
        (x || y) &&
        (diagonal || Math.abs(x) + Math.abs(y) === 1) &&
        r + y >= 0 &&
        r + y < n &&
        c + x >= 0 &&
        c + x < n
      )
        out.push((r + y) * n + c + x);
  return out;
}
const same = (a: number[], b: number[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);
export function visibleTowers(line: number[]) {
  let high = 0,
    count = 0;
  for (const x of line)
    if (x > high) {
      high = x;
      count++;
    }
  return count;
}
export function latinValid(cells: number[], n = 4) {
  return Array.from({ length: n }, (_, i) => [
    cells.slice(i * n, (i + 1) * n),
    cells.filter((_, j) => j % n === i),
  ])
    .flat()
    .every(
      (line) => new Set(line).size === n && line.every((x) => x >= 1 && x <= n),
    );
}
export function takuzuValid(cells: number[]) {
  const lines = Array.from({ length: 4 }, (_, i) =>
    cells.slice(i * 4, i * 4 + 4),
  );
  const cols = Array.from({ length: 4 }, (_, i) =>
    cells.filter((_, j) => j % 4 === i),
  );
  return [lines, cols].every(
    (group) =>
      new Set(group.map((x) => x.join(""))).size === 4 &&
      group.every(
        (row) =>
          row.filter((x) => x === 1).length === 2 &&
          row.filter((x) => x === 2).length === 2 &&
          !row.some((x, i) => i < 2 && row[i + 1] === x && row[i + 2] === x),
      ),
  );
}
export const rotateMask = (mask: number) => ((mask << 1) & 15) | (mask >> 3);
// Bits point right, down, left, up. The entrance and exit are the only legal open ends.
export function pipesValid(cells: number[], n: number) {
  const seen = new Set<number>(),
    todo = [0];
  while (todo.length) {
    const i = todo.pop()!;
    if (seen.has(i)) continue;
    seen.add(i);
    for (let d = 0; d < 4; d++)
      if (cells[i] & (1 << d)) {
        const r = Math.floor(i / n) + [0, 1, 0, -1][d],
          c = (i % n) + [1, 0, -1, 0][d];
        if (r < 0 || r >= n || c < 0 || c >= n) {
          if (!((i === 0 && d === 2) || (i === n * n - 1 && d === 0)))
            return false;
        } else {
          const j = r * n + c;
          if (!(cells[j] & (1 << ((d + 2) % 4)))) return false;
          todo.push(j);
        }
      }
  }
  return seen.size === n * n && !!(cells[0] & 4) && !!(cells.at(-1)! & 1);
}
export function laserPath(cells: number[], n: number) {
  let r = 1,
    c = -1,
    d = 0;
  const points = [[c, r]],
    seen = new Set<string>();
  for (let steps = 0; steps < n * n * 4; steps++) {
    c += [1, 0, -1, 0][d];
    r += [0, 1, 0, -1][d];
    points.push([c, r]);
    if (r < 0 || r >= n || c < 0 || c >= n)
      return { points, won: r === n && c === n - 1 };
    const key = `${r},${c},${d}`;
    if (seen.has(key)) break;
    seen.add(key);
    if (cells[r * n + c] === 1) d = [3, 2, 1, 0][d];
    if (cells[r * n + c] === 2) d = [1, 0, 3, 2][d];
  }
  return { points, won: false };
}
export function loopEdges(n = 4): [number, number][] {
  const edges: [number, number][] = [];
  for (let i = 0; i < n * n; i++) {
    if (i % n < n - 1) edges.push([i, i + 1]);
    if (i < n * (n - 1)) edges.push([i, i + n]);
  }
  return edges;
}
export function loopValid(cells: number[], n: number) {
  const edges = loopEdges(n).filter((_, i) => cells[i]);
  if (
    !Array.from(
      { length: n * n },
      (_, i) => edges.filter((e) => e.includes(i)).length === 2,
    ).every(Boolean)
  )
    return false;
  const seen = new Set([0]),
    todo = [0];
  while (todo.length) {
    const i = todo.pop()!;
    for (const [a, b] of edges) {
      const j = a === i ? b : b === i ? a : -1;
      if (j >= 0 && !seen.has(j)) {
        seen.add(j);
        todo.push(j);
      }
    }
  }
  return seen.size === n * n;
}
function rotateBlock(cells: number[], i: number, n: number) {
  if (i % n === n - 1 || i >= n * (n - 1)) return cells;
  const b = [...cells],
    ids = [i, i + 1, i + 1 + n, i + n];
  ids.forEach((p, k) => (b[ids[(k + 1) % 4]] = cells[p]));
  return b;
}
export function newBoard(id: BoardId, difficulty = 1, seed = 1): BoardState {
  const rng = seeded(seed);
  const s: BoardState = {
    id,
    size: 4,
    cells: [],
    goal: [],
    fixed: [],
    aux: [],
    selected: -1,
    value: 1,
    moves: 0,
    phase: 0,
    status: "playing",
    message: "Sua vez. Consulte as regras abaixo.",
    difficulty,
    seed,
  };
  if (id === "queens") {
    s.size = 8;
    s.cells = Array(64).fill(0);
    s.fixed = Array(64).fill(0);
    const cols = [0, 4, 7, 5, 2, 6, 1, 3];
    if (difficulty === 0)
      for (let r = 0; r < 2; r++) {
        const i = r * 8 + (seed % 2 ? cols[r] : 7 - cols[r]);
        s.cells[i] = s.fixed[i] = 1;
      }
  } else if (id === "knight") {
    s.size = 5;
    s.cells = Array(25).fill(0);
    s.cells[0] = 1;
    s.selected = 0;
  } else if (id === "peg") {
    s.size = 5;
    const geometry = Array.from({ length: 25 }, (_, i) =>
        [0, 4, 20, 24].includes(i) ? -1 : 0,
      ),
      moves: [number, number, number][] = [];
    for (let a = 0; a < 25; a++)
      if (geometry[a] === 0)
        for (const d of [-1, 1, -5, 5]) {
          const b = a + d,
            c = a + 2 * d;
          if (
            c >= 0 &&
            c < 25 &&
            geometry[b] === 0 &&
            geometry[c] === 0 &&
            (Math.abs(d) !== 1 || Math.floor(a / 5) === Math.floor(c / 5))
          )
            moves.push([a, b, c]);
        }
    s.goal = [...geometry];
    s.goal[12] = 1;
    let best = [...s.goal],
      bestPath: number[] = [];
    for (let attempt = 0; attempt < 60; attempt++) {
      const cells = [...s.goal],
        path: number[][] = [];
      while (cells.filter((x) => x === 1).length < 8 + difficulty * 4) {
        const legal = moves.filter(
          ([a, b, c]) => cells[a] === 0 && cells[b] === 0 && cells[c] === 1,
        );
        if (!legal.length) break;
        const [a, b, c] = legal[Math.floor(rng() * legal.length)];
        cells[a] = cells[b] = 1;
        cells[c] = 0;
        path.push([a, c]);
      }
      if (
        cells.filter((x) => x === 1).length > best.filter((x) => x === 1).length
      ) {
        best = cells;
        bestPath = path.reverse().flat();
      }
      if (best.filter((x) => x === 1).length >= 8 + difficulty * 4) break;
    }
    s.cells = best;
    s.aux = bestPath;
  } else if (["latin", "sky", "futoshiki"].includes(id)) {
    const shift = Math.floor(rng() * 4);
    s.goal = Array.from(
      { length: 16 },
      (_, i) => ((Math.floor(i / 4) + (i % 4) + shift) % 4) + 1,
    );
    if (id === "sky")
      s.aux = [
        ...Array.from({ length: 4 }, (_, i) =>
          visibleTowers(s.goal.filter((_, j) => j % 4 === i)),
        ),
        ...Array.from({ length: 4 }, (_, i) =>
          visibleTowers(s.goal.slice(i * 4, i * 4 + 4)),
        ),
        ...Array.from({ length: 4 }, (_, i) =>
          visibleTowers(s.goal.slice(i * 4, i * 4 + 4).reverse()),
        ),
        ...Array.from({ length: 4 }, (_, i) =>
          visibleTowers(s.goal.filter((_, j) => j % 4 === i).reverse()),
        ),
      ];
    if (id === "futoshiki")
      s.aux = [
        0,
        1,
        Math.sign(s.goal[0] - s.goal[1]),
        6,
        7,
        Math.sign(s.goal[6] - s.goal[7]),
        10,
        14,
        Math.sign(s.goal[10] - s.goal[14]),
      ];
    s.cells = s.goal.map((x, i) =>
      (i + seed) % (difficulty + 2) === 0 ? x : 0,
    );
    s.fixed = [...s.cells];
  } else if (id === "takuzu") {
    s.goal = [1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1];
    if (seed % 2) s.goal = s.goal.map((x) => 3 - x);
    s.cells = s.goal.map((x, i) => (i % (difficulty + 2) === 0 ? x : 0));
    s.fixed = [...s.cells];
  } else if (id === "magic") {
    s.size = 3;
    s.goal = [8, 1, 6, 3, 5, 7, 4, 9, 2];
    s.cells = Array(9).fill(0);
    s.cells[4] = 5;
    s.fixed = [...s.cells];
  } else if (id === "fifteen" || id === "rotate") {
    s.goal = Array.from({ length: 16 }, (_, i) =>
      id === "fifteen" && i === 15 ? 0 : i + 1,
    );
    s.cells = [...s.goal];
    for (let j = 0; j < 10 + difficulty * 12; j++) {
      if (id === "rotate")
        s.cells = rotateBlock(
          s.cells,
          Math.floor(rng() * 3) + Math.floor(rng() * 3) * 4,
          4,
        );
      else {
        const z = s.cells.indexOf(0),
          ns = neighbors(z, 4),
          p = ns[Math.floor(rng() * ns.length)];
        [s.cells[z], s.cells[p]] = [s.cells[p], s.cells[z]];
      }
    }
    if (same(s.cells, s.goal))
      s.cells =
        id === "rotate"
          ? rotateBlock(s.cells, 0, 4)
          : [...s.cells.slice(0, 14), 0, 15];
  } else if (id === "pipes") {
    // Odd widths ensure a serpentine path exits at the bottom right.
    s.size = 3 + difficulty * 2;
    const path = Array.from(
      { length: s.size * s.size },
      (_, i) =>
        Math.floor(i / s.size) * s.size +
        (Math.floor(i / s.size) % 2 ? s.size - 1 - (i % s.size) : i % s.size),
    );
    s.goal = Array(s.size * s.size).fill(0);
    path.forEach((i, k) => {
      const prev = k ? path[k - 1] : -1,
        next = k < path.length - 1 ? path[k + 1] : s.size * s.size;
      const bit = (j: number) =>
        j === i - 1 ? 4 : j === i + 1 ? 1 : j < i ? 8 : 2;
      s.goal[i] = bit(prev) | bit(next);
    });
    s.cells = s.goal.map((x) => {
      for (let j = 0, turns = Math.floor(rng() * 4); j < turns; j++)
        x = rotateMask(x);
      return x;
    });
    if (pipesValid(s.cells, s.size)) s.cells[0] = rotateMask(s.cells[0]);
  } else if (id === "laser") {
    s.size = 4 + difficulty;
    const n = s.size,
      mid = Math.floor(n / 2),
      row = n - 2;
    s.goal = Array(n * n).fill(0);
    s.goal[n] = 2;
    s.goal[row * n] = 2;
    s.goal[row * n + mid] = 1;
    s.goal[mid] = 1;
    s.goal[n - 1] = 2;
    s.cells = s.goal.map((x) => (x ? (rng() < 0.5 ? 1 : 2) : 0));
    s.fixed = s.goal.map((x) => (x === 0 ? 1 : 0));
    if (laserPath(s.cells, n).won) s.cells[n] = 1;
  } else if (id === "loop") s.cells = Array(loopEdges(4).length).fill(0);
  else if (id === "links") {
    s.fixed = Array(16).fill(0);
    s.goal = Array(16).fill(0);
    const path = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12].map(
        (i) => (seed % 2 ? i : 15 - i),
      ),
      lengths = difficulty === 0 ? [4, 4, 4, 4] : [3, 5, 3, 5];
    let offset = 0;
    lengths.forEach((len, k) => {
      const segment = path.slice(offset, offset + len);
      segment.forEach((i) => (s.goal[i] = k + 1));
      s.fixed[segment[0]] = s.fixed[segment.at(-1)!] = k + 1;
      offset += len;
    });
    s.cells = [...s.fixed];
  } else if (id === "colorsort" || id === "watersort") {
    s.size = 4;
    s.cells = [
      1, 2, 1, 2, 2, 1, 2, 1, 3, 4, 3, 4, 4, 3, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    if (seed % 2) s.cells = s.cells.map((x) => (x ? 5 - x : 0));
  } else if (id === "slideblock") {
    s.size = 6;
    s.cells = Array(36).fill(0);
    s.aux = [12, 2, 0, 3, 3, 1, 21, 2, 0];
    s.aux.forEach((_, k) => {
      if (k % 3 === 0)
        for (let j = 0; j < s.aux[k + 1]; j++)
          s.cells[s.aux[k] + j * (s.aux[k + 2] ? 6 : 1)] = k / 3 + 1;
    });
  } else if (id === "memorypath") {
    s.cells = Array(16).fill(0);
    s.goal = [0];
    for (let k = 0; k < 4 + difficulty * 2; k++) {
      const ns = neighbors(s.goal.at(-1)!, 4).filter(
        (x) => !s.goal.includes(x),
      );
      if (!ns.length) break;
      s.goal.push(ns[Math.floor(rng() * ns.length)]);
    }
  } else if (id === "flood" || id === "same") {
    s.size = 6;
    s.cells = Array.from(
      { length: 36 },
      () => 1 + Math.floor(rng() * (3 + difficulty)),
    );
    if (id === "same")
      for (let i = 0; i < 36; i += 2) s.cells[i + 1] = s.cells[i];
  } else if (id === "mancala") {
    s.size = 7;
    s.cells = Array(14).fill(4);
    s.cells[6] = s.cells[13] = 0;
  } else if (id === "chomp") {
    s.size = 5;
    s.cells = Array(25).fill(1);
  } else {
    s.size = id === "gomoku" ? 9 : id === "hex" ? 6 : 5;
    s.cells = Array(s.size * s.size).fill(0);
    if (["ataxx", "territory"].includes(id)) {
      s.cells[0] = 1;
      s.cells[s.cells.length - 1] = 2;
      if (id === "ataxx") {
        s.cells[s.size - 1] = 2;
        s.cells[s.cells.length - s.size] = 1;
      }
    }
    if (id === "isolation") {
      s.cells[Math.floor(s.size / 2)] = 2;
      s.cells[s.cells.length - Math.ceil(s.size / 2)] = 1;
    }
    if (id === "breakthrough")
      s.cells = s.cells.map((_, i) =>
        i < s.size * 2 ? 2 : i >= s.size * (s.size - 2) ? 1 : 0,
      );
  }
  return s;
}
export function pegMoves(cells: number[], n: number) {
  const out: [number, number, number][] = [];
  cells.forEach((v, i) => {
    if (v !== 1) return;
    for (const d of [-1, 1, -n, n]) {
      const mid = i + d,
        to = i + 2 * d;
      if (
        to >= 0 &&
        to < cells.length &&
        (Math.abs(d) !== 1 || Math.floor(to / n) === Math.floor(i / n)) &&
        cells[mid] === 1 &&
        cells[to] === 0
      )
        out.push([i, mid, to]);
    }
  });
  return out;
}
export function knightMoves(i: number, cells: number[], n: number) {
  return cells.flatMap((v, j) => {
    const a = Math.abs(Math.floor(i / n) - Math.floor(j / n)),
      b = Math.abs((i % n) - (j % n));
    return v === 0 && a * b === 2 ? [j] : [];
  });
}
function floodGroup(cells: number[], start: number, n: number) {
  const seen = new Set([start]),
    todo = [start];
  while (todo.length) {
    for (const j of neighbors(todo.pop()!, n))
      if (cells[j] === cells[start] && !seen.has(j)) {
        seen.add(j);
        todo.push(j);
      }
  }
  return [...seen];
}
function connection(cells: number[], n: number, player: number) {
  const todo = cells.flatMap((v, i) =>
      v === player && (player === 1 ? i < n : i % n === 0) ? [i] : [],
    ),
    seen = new Set(todo);
  while (todo.length) {
    const i = todo.pop()!;
    if (player === 1 ? i >= n * (n - 1) : i % n === n - 1) return true;
    const r = Math.floor(i / n),
      c = i % n;
    for (const [dy, dx] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, 1],
      [1, -1],
    ]) {
      const y = r + dy,
        x = c + dx,
        j = y * n + x;
      if (
        y >= 0 &&
        y < n &&
        x >= 0 &&
        x < n &&
        cells[j] === player &&
        !seen.has(j)
      ) {
        todo.push(j);
        seen.add(j);
      }
    }
  }
  return false;
}
function five(cells: number[], n: number, p: number) {
  return cells.some(
    (v, i) =>
      v === p &&
      [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
      ].some(([dy, dx]) =>
        Array.from({ length: 5 }, (_, k) => {
          const r = Math.floor(i / n) + dy * k,
            c = (i % n) + dx * k;
          return r >= 0 && r < n && c >= 0 && c < n && cells[r * n + c] === p;
        }).every(Boolean),
      ),
  );
}
function end(s: BoardState, won: boolean, text?: string) {
  s.status = won ? "won" : "lost";
  s.message =
    text ||
    (won ? "Desafio concluído!" : "Sem jogadas. Desfaça ou tente novamente.");
}
export function boardScore(s: BoardState) {
  return Math.max(50, 1200 + s.difficulty * 300 - s.moves * 10);
}
export function boardSolved(s: BoardState): boolean {
  const b = s.cells,
    n = s.size;
  if (s.id === "flood") return b.every((x) => x === b[0]);
  if (s.id === "same") return b.every((x) => x === 0);
  if (s.id === "queens") {
    const qs = b.flatMap((x, i) => (x ? [i] : []));
    return (
      qs.length === 8 &&
      qs.every((a, i) =>
        qs.every(
          (c, j) =>
            i === j ||
            (Math.floor(a / n) !== Math.floor(c / n) &&
              a % n !== c % n &&
              Math.abs(Math.floor(a / n) - Math.floor(c / n)) !==
                Math.abs((a % n) - (c % n))),
        ),
      )
    );
  }
  if (s.id === "knight") return b.every((x) => x > 0);
  if (s.id === "peg") return b.filter((x) => x === 1).length === 1;
  if (s.id === "latin") return latinValid(b);
  if (s.id === "takuzu") return takuzuValid(b);
  if (s.id === "sky")
    return (
      latinValid(b) &&
      Array.from(
        { length: 4 },
        (_, i) =>
          visibleTowers(b.filter((_, j) => j % 4 === i)) === s.aux[i] &&
          visibleTowers(b.slice(i * 4, i * 4 + 4)) === s.aux[4 + i] &&
          visibleTowers(b.slice(i * 4, i * 4 + 4).reverse()) === s.aux[8 + i] &&
          visibleTowers(b.filter((_, j) => j % 4 === i).reverse()) ===
            s.aux[12 + i],
      ).every(Boolean)
    );
  if (s.id === "futoshiki")
    return (
      latinValid(b) &&
      [0, 3, 6].every(
        (i) => Math.sign(b[s.aux[i]] - b[s.aux[i + 1]]) === s.aux[i + 2],
      )
    );
  if (s.id === "magic") {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    return (
      new Set(b).size === 9 &&
      b.every((x) => x >= 1 && x <= 9) &&
      lines.every((line) => line.reduce((sum, i) => sum + b[i], 0) === 15)
    );
  }
  if (["fifteen", "rotate"].includes(s.id)) return same(b, s.goal);
  if (s.id === "pipes") return pipesValid(b, n);
  if (s.id === "laser") return laserPath(b, n).won;
  if (s.id === "loop") return loopValid(b, n);
  if (["colorsort", "watersort"].includes(s.id))
    return Array.from({ length: 6 }, (_, i) => b.slice(i * 4, i * 4 + 4)).every(
      (tube) =>
        tube.every((x) => x === 0) ||
        tube.every((x) => x === tube[0] && x !== 0),
    );
  if (s.id === "links")
    return (
      b.every((x) => x > 0) &&
      [1, 2, 3, 4].every((color) => {
        const terminals = s.fixed.flatMap((v, i) => (v === color ? [i] : []));
        const group = floodGroup(b, terminals[0], n);
        return (
          group.includes(terminals[1]) &&
          group.every(
            (i) =>
              neighbors(i, n).filter((j) => b[j] === color).length ===
              (s.fixed[i] ? 1 : 2),
          )
        );
      })
    );
  if (s.id === "memorypath")
    return s.phase === 2 && s.selected === s.goal.length;
  if (s.id === "slideblock") return (s.aux[0] % 6) + s.aux[1] === 6;
  return false;
}
export function boardClick(state: BoardState, index: number): BoardState {
  if (state.status !== "playing" || index < 0 || index >= state.cells.length)
    return state;
  const s = structuredClone(state),
    b = s.cells,
    n = s.size,
    id = s.id;
  const invalid = (text: string) => {
    s.message = text;
    return s;
  };
  if (id === "flood") return boardValue(state, b[index]);
  if (id === "same") {
    if (!b[index]) return state;
    const group = floodGroup(b, index, n);
    if (group.length < 2)
      return invalid("Escolha um grupo de dois ou mais cristais.");
    group.forEach((i) => (b[i] = 0));
    const cols = Array.from({ length: n }, (_, c) =>
      Array.from({ length: n }, (_, r) => b[r * n + c]).filter(Boolean),
    ).filter((x) => x.length);
    b.fill(0);
    cols.forEach((col, c) =>
      col.forEach((x, r) => (b[(n - col.length + r) * n + c] = x)),
    );
  } else if (id === "queens") {
    if (s.fixed[index]) return state;
    b[index] = b[index] ? 0 : 1;
  } else if (id === "knight") {
    if (!knightMoves(s.selected, b, n).includes(index))
      return invalid("Use um salto em L para uma casa ainda não visitada.");
    b[index] = Math.max(...b) + 1;
    s.selected = index;
  } else if (id === "peg") {
    if (b[index] === 1) {
      s.selected = index;
      return s;
    }
    const move = pegMoves(b, n).find(
      ([from, , to]) => from === s.selected && to === index,
    );
    if (!move)
      return invalid(
        "Escolha uma peça e salte uma vizinha para uma casa vazia.",
      );
    b[move[0]] = b[move[1]] = 0;
    b[move[2]] = 1;
    s.selected = -1;
  } else if (["latin", "takuzu", "sky", "futoshiki", "magic"].includes(id)) {
    if (s.fixed[index]) return state;
    b[index] = s.value;
  } else if (id === "fifteen") {
    const z = b.indexOf(0);
    if (!neighbors(z, n).includes(index))
      return invalid("Só peças vizinhas ao espaço podem deslizar.");
    [b[index], b[z]] = [b[z], b[index]];
  } else if (id === "rotate") {
    if (index % n === n - 1 || index >= n * (n - 1))
      return invalid("Escolha o canto superior esquerdo de um bloco 2 × 2.");
    s.cells = rotateBlock(b, index, n);
  } else if (id === "pipes") b[index] = rotateMask(b[index]);
  else if (id === "laser") {
    if (s.fixed[index]) return state;
    b[index] = 3 - b[index];
  } else if (id === "loop") b[index] = 1 - b[index];
  else if (id === "links") {
    if (s.fixed[index]) {
      s.value = s.fixed[index];
      s.selected = index;
      return s;
    }
    if (s.value === 0) b[index] = 0;
    else {
      if (
        s.selected < 0 ||
        !neighbors(s.selected, n).includes(index) ||
        b[index]
      )
        return invalid("Comece num terminal e siga por casas vizinhas vazias.");
      b[index] = s.value;
      s.selected = index;
    }
  } else if (["colorsort", "watersort"].includes(id)) {
    const to = Math.floor(index / 4);
    if (s.selected < 0) {
      if (!b.slice(to * 4, to * 4 + 4).some(Boolean)) return state;
      s.selected = to;
      return s;
    }
    const from = s.selected;
    s.selected = -1;
    if (from === to) return s;
    const src = b.slice(from * 4, from * 4 + 4).filter(Boolean),
      dst = b.slice(to * 4, to * 4 + 4).filter(Boolean),
      color = src.at(-1)!;
    if (!src.length || dst.length === 4 || (dst.length && dst.at(-1) !== color))
      return invalid("Destino cheio ou cor incompatível.");
    let count = 1;
    if (id === "watersort")
      while (count < src.length && src[src.length - 1 - count] === color)
        count++;
    count = Math.min(count, 4 - dst.length);
    for (let k = 0; k < count; k++) dst.push(src.pop()!);
    b.splice(from * 4, 4, ...src, ...Array(4 - src.length).fill(0));
    b.splice(to * 4, 4, ...dst, ...Array(4 - dst.length).fill(0));
  } else if (id === "slideblock") {
    if (b[index]) s.selected = b[index] - 1;
    return s;
  } else if (id === "memorypath") {
    if (s.phase !== 1)
      return invalid("Observe a trilha e use Ocultar trilha para começar.");
    if (index !== s.goal[s.selected])
      end(s, false, "Essa casa não é a próxima da trilha.");
    else {
      b[index] = ++s.selected;
      if (s.selected === s.goal.length) s.phase = 2;
    }
  } else return strategyClick(state, index);
  s.moves++;
  s.message = "Jogada registrada.";
  if (boardSolved(s)) end(s, true);
  else if (
    (id === "peg" && !pegMoves(s.cells, n).length) ||
    (id === "knight" && !knightMoves(s.selected, s.cells, n).length) ||
    (id === "same" &&
      !s.cells.some(
        (x, i) => x && neighbors(i, n).some((j) => s.cells[j] === x),
      ))
  )
    end(s, false);
  return s;
}
export function boardValue(s: BoardState, value: number): BoardState {
  if (s.status !== "playing") return s;
  if (s.id !== "flood")
    return { ...s, value, selected: s.id === "links" ? -1 : s.selected };
  if (value === s.cells[0]) return s;
  const next = structuredClone(s);
  floodGroup(s.cells, 0, s.size).forEach((i) => (next.cells[i] = value));
  next.moves++;
  next.message = "A maré avançou.";
  if (boardSolved(next)) end(next, true);
  else if (next.moves >= 24) end(next, false);
  return next;
}
export function slideVehicle(state: BoardState, delta: number): BoardState {
  if (
    state.id !== "slideblock" ||
    state.selected < 0 ||
    state.status !== "playing"
  )
    return state;
  const s = structuredClone(state),
    k = s.selected * 3,
    [pos, len, vertical] = s.aux.slice(k, k + 3),
    stride = vertical ? 6 : 1;
  if (Math.abs(delta) !== stride) return state;
  const dest = pos + delta,
    positions = Array.from({ length: len }, (_, i) => dest + i * stride);
  if (
    positions.some(
      (i) =>
        i < 0 ||
        i >= 36 ||
        (!vertical && Math.floor(i / 6) !== Math.floor(pos / 6)) ||
        (s.cells[i] && s.cells[i] !== s.selected + 1),
    )
  )
    return state;
  s.cells = s.cells.map((x) => (x === s.selected + 1 ? 0 : x));
  positions.forEach((i) => (s.cells[i] = s.selected + 1));
  s.aux[k] = dest;
  s.moves++;
  if (boardSolved(s)) end(s, true);
  return s;
}
export function strategyMoves(
  s: BoardState,
  player: number,
): [number, number][] {
  const b = s.cells,
    n = s.size,
    out: [number, number][] = [];
  if (["gomoku", "hex", "chomp", "mancala", "territory"].includes(s.id))
    return b.flatMap((v, i) => {
      if (s.id === "chomp") return v ? [[i, i] as [number, number]] : [];
      if (s.id === "mancala")
        return (player === 1 ? i < 6 : i > 6 && i < 13) && v > 0
          ? [[i, i] as [number, number]]
          : [];
      if (v) return [];
      if (s.id === "territory" && !neighbors(i, n).some((j) => b[j] === player))
        return [];
      return [[i, i] as [number, number]];
    });
  b.forEach((v, i) => {
    if (v !== player) return;
    b.forEach((w, j) => {
      const dy = Math.floor(j / n) - Math.floor(i / n),
        dx = (j % n) - (i % n);
      if (
        s.id === "ataxx" &&
        !w &&
        Math.max(Math.abs(dy), Math.abs(dx)) >= 1 &&
        Math.max(Math.abs(dy), Math.abs(dx)) <= 2
      )
        out.push([i, j]);
      if (
        s.id === "isolation" &&
        !w &&
        Math.max(Math.abs(dy), Math.abs(dx)) === 1
      )
        out.push([i, j]);
      if (
        s.id === "breakthrough" &&
        dy === (player === 1 ? -1 : 1) &&
        Math.abs(dx) <= 1 &&
        (dx ? w !== player : w === 0)
      )
        out.push([i, j]);
    });
  });
  return out;
}
function applyStrategy(s: BoardState, move: [number, number], p: number) {
  const [a, i] = move,
    b = s.cells,
    n = s.size;
  if (s.id === "ataxx") {
    if (
      Math.max(
        Math.abs(Math.floor(a / n) - Math.floor(i / n)),
        Math.abs((a % n) - (i % n)),
      ) === 2
    )
      b[a] = 0;
    b[i] = p;
    neighbors(i, n, true).forEach((j) => {
      if (b[j]) b[j] = p;
    });
  } else if (s.id === "breakthrough" || s.id === "isolation") {
    b[a] = 0;
    b[i] = p;
  } else if (s.id === "chomp") {
    for (let r = Math.floor(i / n); r < n; r++)
      for (let c = i % n; c < n; c++) b[r * n + c] = 0;
    if (i === 0)
      end(
        s,
        p === 2,
        p === 1
          ? "Você comeu o canto venenoso."
          : "O adversário comeu o canto venenoso.",
      );
  } else if (s.id === "mancala") {
    let seeds = b[i],
      j = i;
    b[i] = 0;
    const store = p === 1 ? 6 : 13;
    while (seeds) {
      j = (j + 1) % 14;
      if (j === (p === 1 ? 13 : 6)) continue;
      b[j]++;
      seeds--;
    }
    if (
      j !== store &&
      b[j] === 1 &&
      (p === 1 ? j < 6 : j > 6 && j < 13) &&
      b[12 - j] > 0
    ) {
      b[store] += b[12 - j] + 1;
      b[j] = b[12 - j] = 0;
    }
    return j === store;
  } else b[i] = p;
  return false;
}
function assessStrategy(s: BoardState) {
  const b = s.cells,
    n = s.size;
  if (s.id === "gomoku") {
    if (five(b, n, 1)) end(s, true);
    else if (five(b, n, 2))
      end(s, false, "O adversário formou cinco em linha.");
    else if (b.every(Boolean))
      end(s, false, "Empate. O tabuleiro está completo.");
  }
  if (s.id === "hex") {
    if (connection(b, n, 1)) end(s, true);
    else if (connection(b, n, 2))
      end(s, false, "O adversário conectou as bordas.");
  }
  if (s.id === "breakthrough") {
    if (b.slice(0, n).includes(1) || !b.includes(2)) end(s, true);
    else if (b.slice(-n).includes(2) || !b.includes(1))
      end(s, false, "O adversário rompeu sua linha.");
  }
  if (
    s.id === "mancala" &&
    (b.slice(0, 6).every((x) => !x) || b.slice(7, 13).every((x) => !x))
  ) {
    b[6] += b.slice(0, 6).reduce((a, v) => a + v, 0);
    b[13] += b.slice(7, 13).reduce((a, v) => a + v, 0);
    b.forEach((_, i) => {
      if (i !== 6 && i !== 13) b[i] = 0;
    });
    end(s, b[6] > b[13], b[6] === b[13] ? "Empate na colheita." : undefined);
  }
  if (
    ["ataxx", "territory"].includes(s.id) &&
    !strategyMoves(s, 1).length &&
    !strategyMoves(s, 2).length
  )
    end(s, b.filter((x) => x === 1).length > b.filter((x) => x === 2).length);
}
function linePressure(cells: number[], n: number, i: number, p: number) {
  let score = 0;
  for (const [dy, dx] of [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]) {
    let count = 1,
      open = 0;
    for (const sign of [-1, 1])
      for (let k = 1; k <= 4; k++) {
        const r = Math.floor(i / n) + dy * k * sign,
          c = (i % n) + dx * k * sign;
        if (r < 0 || r >= n || c < 0 || c >= n) break;
        const v = cells[r * n + c];
        if (v === p) count++;
        else {
          if (v === 0) open++;
          break;
        }
      }
    score +=
      count >= 5
        ? 10000
        : count === 4
          ? open === 2
            ? 1500
            : 400
          : count === 3
            ? open === 2
              ? 120
              : 30
            : count * open;
  }
  return score;
}
function hexCost(cells: number[], n: number, p: number) {
  const dist = Array(n * n).fill(Infinity),
    visited = new Set<number>();
  for (let i = 0; i < n; i++) {
    const j = p === 1 ? i : i * n;
    dist[j] = cells[j] === p ? 0 : cells[j] === 0 ? 1 : Infinity;
  }
  for (let count = 0; count < n * n; count++) {
    let i = -1;
    for (let j = 0; j < dist.length; j++)
      if (!visited.has(j) && (i < 0 || dist[j] < dist[i])) i = j;
    if (i < 0 || !Number.isFinite(dist[i])) break;
    visited.add(i);
    if (p === 1 ? i >= n * (n - 1) : i % n === n - 1) return dist[i];
    const r = Math.floor(i / n),
      c = i % n;
    for (const [dy, dx] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, 1],
      [1, -1],
    ]) {
      const y = r + dy,
        x = c + dx,
        j = y * n + x;
      if (y >= 0 && y < n && x >= 0 && x < n && cells[j] !== 3 - p)
        dist[j] = Math.min(dist[j], dist[i] + (cells[j] === p ? 0 : 1));
    }
  }
  return n * n;
}
const chompMemo = new Map<string, boolean>();
export function chompWinning(cells: number[], n: number): boolean {
  const key = n + ":" + cells.join("");
  if (chompMemo.has(key)) return chompMemo.get(key)!;
  for (let i = 1; i < cells.length; i++)
    if (cells[i]) {
      const next = [...cells];
      for (let r = Math.floor(i / n); r < n; r++)
        for (let c = i % n; c < n; c++) next[r * n + c] = 0;
      if (!chompWinning(next, n)) {
        chompMemo.set(key, true);
        return true;
      }
    }
  chompMemo.set(key, false);
  return false;
}
function chooseBot(s: BoardState): [number, number] | undefined {
  const moves = strategyMoves(s, 2);
  if (!moves.length) return;
  let best = -Infinity,
    choice = moves[0];
  const rng = seeded(s.seed + s.moves * 431);
  for (const move of moves) {
    const test = structuredClone(s);
    applyStrategy(test, move, 2);
    assessStrategy(test);
    const [, i] = move;
    let score = rng() * Math.max(0.1, 2 - s.difficulty * 0.5);
    if (test.status === "lost") score += 10000;
    if (s.id === "gomoku") {
      const block = structuredClone(s);
      block.cells[i] = 1;
      if (five(block.cells, s.size, 1)) score += 9000;
      score +=
        linePressure(test.cells, s.size, i, 2) +
        (s.difficulty > 0 ? linePressure(block.cells, s.size, i, 1) * 0.9 : 0);
    }
    if (s.id === "hex")
      score +=
        (s.difficulty > 0
          ? hexCost(test.cells, s.size, 1) - hexCost(test.cells, s.size, 2)
          : neighbors(i, s.size).filter((j) => s.cells[j] === 2).length) * 10;
    if (s.id === "ataxx")
      score +=
        test.cells.filter((x) => x === 2).length -
        s.cells.filter((x) => x === 2).length;
    if (s.id === "breakthrough")
      score += Math.floor(i / s.size) + (s.cells[i] === 1 ? 5 : 0);
    if (s.id === "mancala") {
      score += test.cells[13] - s.cells[13];
      if (s.difficulty === 2) {
        const reply = strategyMoves(test, 1).map((m) => {
          const r = structuredClone(test);
          applyStrategy(r, m, 1);
          return r.cells[6] - test.cells[6];
        });
        score -= Math.max(0, ...reply) * 0.8;
      }
    }
    if (s.id === "chomp") {
      score += i === 0 ? -10000 : 0;
      const replies = strategyMoves(test, 1);
      if (replies.length === 1) score += 1000;
      if (s.difficulty === 2 && i !== 0 && !chompWinning(test.cells, s.size))
        score += 5000;
    }
    if (s.id === "isolation")
      score += neighbors(i, s.size, true).filter((j) => !test.cells[j]).length;
    if (score > best) {
      best = score;
      choice = move;
    }
  }
  return choice;
}
function strategyClick(state: BoardState, i: number): BoardState {
  const s = structuredClone(state),
    moves = strategyMoves(s, 1);
  if (s.id === "isolation" && s.phase === 1) {
    if (s.cells[i]) {
      s.message = "Remova uma casa vazia.";
      return s;
    }
    s.cells[i] = -1;
    s.phase = 0;
    if (!strategyMoves(s, 2).length) {
      end(s, true);
      return s;
    }
  } else {
    if (
      ["ataxx", "breakthrough", "isolation"].includes(s.id) &&
      s.cells[i] === 1
    )
      return { ...s, selected: i, message: "Escolha uma casa de destino." };
    const move = moves.find(
      ([a, b]) =>
        b === i &&
        (["ataxx", "breakthrough", "isolation"].includes(s.id)
          ? a === s.selected
          : true),
    );
    if (!move) return { ...s, message: "Essa jogada não é permitida." };
    s.moves++;
    s.selected = -1;
    const again = applyStrategy(s, move, 1);
    assessStrategy(s);
    if (s.status !== "playing") return s;
    if (s.id === "isolation") {
      s.phase = 1;
      s.message = "Agora remova uma casa vazia.";
      return s;
    }
    if (again)
      return { ...s, message: "Última semente no depósito: jogue novamente." };
  }
  let bot = chooseBot(s),
    turns = 0;
  while (bot && turns++ < 30 && s.status === "playing") {
    const again = applyStrategy(s, bot, 2);
    assessStrategy(s);
    if (!again) break;
    bot = chooseBot(s);
  }
  if (s.id === "isolation" && s.status === "playing") {
    const pos = s.cells.indexOf(1),
      free = neighbors(pos, s.size, true).filter((j) => !s.cells[j]);
    if (free.length) s.cells[free[0]] = -1;
    if (!strategyMoves(s, 1).length) end(s, false, "Você ficou sem saída.");
  }
  assessStrategy(s);
  if (
    s.status === "playing" &&
    !strategyMoves(s, 1).length &&
    ["ataxx", "territory"].includes(s.id)
  ) {
    for (let k = 0; k < s.cells.length; k++) {
      const m = chooseBot(s);
      if (!m) break;
      applyStrategy(s, m, 2);
    }
    assessStrategy(s);
  }
  if (s.status === "playing") s.message = "O adversário jogou. Sua vez.";
  return s;
}
