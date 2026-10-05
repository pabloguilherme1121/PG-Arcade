import { describe, it, expect } from "vitest";
import { games } from "./catalog";
import { gameHelp, recordUnits } from "./gameHelp";
import { newGames, type BoardId } from "./newCatalog";
import {
  boardClick,
  boardSolved,
  boardValue,
  knightMoves,
  loopEdges,
  newBoard,
  pegMoves,
  slideVehicle,
  strategyMoves,
  visibleTowers,
  type BoardState,
} from "./boardExpansion";
import { evaluate24, isPrime, question, selectedWord } from "./quizExpansion";
import {
  emptyInput,
  motionStep,
  motionTarget,
  newMotion,
} from "./motionExpansion";
import { normalizeProgress } from "./progress";
describe("100-game catalog contract", () => {
  it("registers fifty additional unique games, with help and persistent progress", () => {
    expect(games).toHaveLength(100);
    expect(newGames).toHaveLength(50);
    expect(new Set(games.map((g) => g.id)).size).toBe(100);
    expect(new Set(games.map((g) => g.name)).size).toBe(100);
    for (const g of newGames) {
      expect(gameHelp[g.id].length).toBeGreaterThan(65);
      expect(recordUnits[g.id]).toBe("pontos");
      expect(
        normalizeProgress({ records: { [g.id]: 100 }, favorites: [g.id] })
          .records[g.id],
      ).toBe(100);
    }
  });
});
describe("board rules, solvability and terminal states", () => {
  for (const game of newGames.filter((g) => g.family === "board"))
    it(`${game.id} initializes reproducibly and accepts no input after victory`, () => {
      const s = newBoard(game.id as BoardId, 1, 2);
      expect(s).toEqual(newBoard(game.id as BoardId, 1, 2));
      expect(s.cells.length).toBeGreaterThan(0);
      expect(boardClick({ ...s, status: "won" }, 0).status).toBe("won");
      expect(boardClick(s, -1)).toBe(s);
    });
  for (const id of ["latin", "takuzu", "sky", "futoshiki", "magic"] as const)
    it(`${id} can be completed using its real constraints`, () => {
      for (const difficulty of [0, 1, 2]) {
        let s = newBoard(id, difficulty, 3);
        for (let i = 0; i < s.cells.length; i++)
          if (!s.fixed[i]) s = boardClick(boardValue(s, s.goal[i]), i);
        expect(s.status).toBe("won");
        expect(boardSolved(s)).toBe(true);
      }
    });
  it("validates queens globally, with no duplicate lines or diagonals", () => {
    let s = newBoard("queens");
    [0, 4, 7, 5, 2, 6, 1, 3].forEach((c, r) => (s = boardClick(s, r * 8 + c)));
    expect(s.status).toBe("won");
    const wrong = newBoard("queens");
    wrong.cells.fill(0);
    for (let i = 0; i < 8; i++) wrong.cells[i * 8 + i] = 1;
    expect(boardSolved(wrong)).toBe(false);
  });
  it("knight tour visits each square once and rejects ordinary adjacency", () => {
    const initial = newBoard("knight");
    expect(boardClick(initial, 1).cells).toEqual(initial.cells);
    function tour(s: BoardState): BoardState | null {
      if (s.status === "won") return s;
      if (s.status === "lost") return null;
      const candidates = knightMoves(s.selected, s.cells, s.size).sort(
        (a, b) =>
          knightMoves(a, s.cells, s.size).length -
          knightMoves(b, s.cells, s.size).length,
      );
      for (const i of candidates) {
        const result = tour(boardClick(s, i));
        if (result) return result;
      }
      return null;
    }
    expect(tour(initial)?.cells.filter(Boolean)).toHaveLength(25);
  });
  it("peg jumping removes exactly one middle piece and can finish", () => {
    const s = newBoard("peg");
    const [from, mid, to] = pegMoves(s.cells, s.size)[0];
    const next = boardClick(boardClick(s, from), to);
    expect(next.cells[from]).toBe(0);
    expect(next.cells[mid]).toBe(0);
    expect(next.cells[to]).toBe(1);
    expect(next.cells.filter((x) => x === 1).length).toBe(
      s.cells.filter((x) => x === 1).length - 1,
    );
    const last = { ...s, cells: Array(25).fill(-1) };
    last.cells[10] = last.cells[11] = 1;
    last.cells[12] = 0;
    expect(boardClick(boardClick(last, 10), 12).status).toBe("won");
  });
  it("same-game gravity preserves paired columns so generated levels are solvable", () => {
    for (let seed = 1; seed <= 30; seed++) {
      let s = newBoard("same", 2, seed);
      while (s.status === "playing") {
        const i = s.cells.findIndex((v, i) => v > 0 && i % 2 === 0);
        s = boardClick(s, i);
      }
      expect(s.status).toBe("won");
    }
  });
  it("flood fills its connected region without recoloring distant islands", () => {
    const s = newBoard("flood");
    s.size = 2;
    s.cells = [1, 2, 3, 2];
    const a = boardValue(s, 2);
    expect(a.cells).toEqual([2, 2, 3, 2]);
    expect(s.cells).toEqual([1, 2, 3, 2]);
    expect(boardValue(a, 3).status).toBe("won");
  });
  for (const id of ["pipes", "laser"] as const)
    it(`${id} has a reachable solution for every difficulty and seed`, () => {
      for (let seed = 1; seed <= 12; seed++)
        for (const d of [0, 1, 2]) {
          let s = newBoard(id, d, seed);
          expect(boardSolved(s)).toBe(false);
          for (let i = 0; i < s.cells.length; i++) {
            let turns = 0;
            while (s.cells[i] !== s.goal[i] && turns++ < 4)
              s = boardClick(s, i);
          }
          expect(s.status).toBe("won");
        }
    });
  it("a circuit must be one connected loop rather than two smaller loops", () => {
    let s = newBoard("loop");
    const tour = [0, 1, 2, 3, 7, 6, 5, 9, 10, 11, 15, 14, 13, 12, 8, 4, 0];
    for (let k = 1; k < tour.length; k++) {
      const i = loopEdges().findIndex(
        ([a, b]) =>
          (a === tour[k - 1] && b === tour[k]) ||
          (b === tour[k - 1] && a === tour[k]),
      );
      s = boardClick(s, i);
    }
    expect(s.status).toBe("won");
  });
  it("numberlink covers every square with non-branching terminal paths", () => {
    let s = newBoard("links");
    for (const color of [1, 2, 3, 4]) {
      const terminal = s.fixed.findIndex((x) => x === color);
      s = boardClick(s, terminal);
      let pos = terminal;
      const seen = new Set([pos]);
      for (let steps = 0; steps < 16; steps++) {
        const next = [pos - 4, pos + 4, pos - 1, pos + 1].find(
          (i) =>
            i >= 0 &&
            i < 16 &&
            s.goal[i] === color &&
            !seen.has(i) &&
            (Math.abs(i - pos) !== 1 ||
              Math.floor(i / 4) === Math.floor(pos / 4)),
        );
        if (next === undefined) break;
        seen.add(next);
        s = boardClick(s, next);
        pos = next;
      }
    }
    expect(s.status).toBe("won");
  });
  for (const id of ["colorsort", "watersort"] as const)
    it(`${id} permits legal pours and rejects incompatible colors`, () => {
      let s = newBoard(id);
      const original = [...s.cells];
      s = boardClick(boardClick(s, 0), 4);
      expect(s.cells).toEqual(original);
      s = newBoard(id);
      s = boardClick(boardClick(s, 0), 16);
      expect(s.cells[16]).toBe(original[3]);
      expect(s.cells[3]).toBe(0);
    });
  it("liquid pours move a full top run while color stacks move one piece", () => {
    for (const id of ["colorsort", "watersort"] as const) {
      let s = newBoard(id);
      s.cells = [1, 1, 2, 2, 2, 2, 0, 0, ...Array(16).fill(0)];
      s = boardClick(boardClick(s, 0), 4);
      expect(s.cells.slice(4, 8)).toEqual(
        id === "watersort" ? [2, 2, 2, 2] : [2, 2, 2, 0],
      );
    }
  });
  it("sliding cars respect their orientation, obstacles and exit", () => {
    let s = newBoard("slideblock");
    s = boardClick(s, 21);
    expect(slideVehicle(s, -6)).toBe(s);
    s = slideVehicle(s, 1);
    s = boardClick(s, 3);
    s = slideVehicle(s, 6);
    s = slideVehicle(s, 6);
    s = slideVehicle(s, 6);
    s = boardClick(s, 12);
    for (let i = 0; i < 4; i++) s = slideVehicle(s, 1);
    expect(s.status).toBe("won");
  });
  it("memory path requires observation, exact order and no duplicate scoring", () => {
    let s = newBoard("memorypath");
    expect(boardClick(s, 0).moves).toBe(0);
    s = { ...s, phase: 1, selected: 0 };
    for (const i of s.goal) s = boardClick(s, i);
    expect(s.status).toBe("won");
    expect(boardClick(s, 0)).toBe(s);
  });
  it("fifteen only slides a neighbor and rotate applies a reversible permutation", () => {
    let s = newBoard("fifteen");
    s.cells = [...s.goal];
    [s.cells[14], s.cells[15]] = [s.cells[15], s.cells[14]];
    expect(boardClick(s, 0).cells).toEqual(s.cells);
    expect(boardClick(s, 15).status).toBe("won");
    let r = newBoard("rotate");
    r.cells = [...r.goal];
    r = boardClick(r, 0);
    for (let i = 0; i < 3; i++) r = boardClick(r, 0);
    expect(r.status).toBe("won");
  });
  it("skyscraper clues count only successive height records", () =>
    expect(visibleTowers([2, 1, 3, 4])).toBe(3));
  it("isolation rival removes a free square even when the player is already boxed in", () => {
    const s = newBoard("isolation");
    s.cells = Array(s.size * s.size).fill(-1);
    s.cells[22] = 1;
    s.cells[2] = 2;
    s.cells[6] = 0;
    s.cells[7] = 0;
    s.phase = 1;
    const blocked = s.cells.filter((x) => x === -1).length;
    const next = boardClick(s, 6);
    expect(next.cells.filter((x) => x === -1)).toHaveLength(blocked + 2);
    expect(next.status).toBe("lost");
  });
  for (const id of [
    "gomoku",
    "hex",
    "ataxx",
    "isolation",
    "breakthrough",
    "mancala",
    "chomp",
    "territory",
  ] as const)
    it(`${id} responds with a legal rival turn and reaches a terminal state`, () => {
      let s = newBoard(id),
        steps = 0;
      const before = structuredClone(s);
      while (s.status === "playing" && steps++ < 300) {
        if (id === "isolation" && s.phase === 1) {
          const i = s.cells.findIndex((x) => x === 0);
          s = boardClick(s, i);
          continue;
        }
        const moves = strategyMoves(s, 1);
        if (!moves.length) break;
        const [a, b] = moves[steps % moves.length];
        if (["ataxx", "isolation", "breakthrough"].includes(id))
          s = boardClick(s, a);
        s = boardClick(s, b);
      }
      expect(before).toEqual(newBoard(id));
      expect(s.moves).toBeGreaterThan(0);
      expect(s.status).not.toBe("playing");
    });
});
describe("logic and word sessions", () => {
  it("24 parser accepts exact arithmetic and rejects reused numbers, junk and executable text", () => {
    expect(evaluate24("(1+2+3)*4", [1, 2, 3, 4])).toBe(true);
    expect(evaluate24("8/(3-8/3)", [3, 3, 8, 8])).toBe(true);
    for (const text of [
      "24",
      "1+2+3+4+14",
      "alert(24)",
      "(1+2+3)*4)",
      "1/0+2+3+4",
    ])
      expect(evaluate24(text, [1, 2, 3, 4])).toBe(false);
  });
  it("primality handles 1, squares and larger primes", () => {
    expect(isPrime(1)).toBe(false);
    expect(isPrime(49)).toBe(false);
    expect(isPrime(97)).toBe(true);
  });
  for (const game of newGames.filter((g) => g.family === "quiz"))
    it(`${game.id} generates repeatable questions and valid choice sets`, () => {
      for (const d of [0, 1, 2])
        for (let r = 0; r < 10; r++) {
          const q = question(game.id, d, 2, r);
          expect(q).toEqual(question(game.id, d, 2, r));
          expect(q.prompt.length).toBeGreaterThan(0);
          if (q.choices.length) {
            expect(q.choices).toContain(q.answer);
            expect(new Set(q.choices).size).toBe(q.choices.length);
          }
        }
    });
  it("word search contains every actual listed word and rejects bent paths", () => {
    const q = question("wordsearch", 1, 1, 0);
    for (const w of q.words) {
      expect(
        q.grid.some((_, a) =>
          q.grid.some((_, b) => selectedWord(q.grid, a, b).word === w),
        ),
      ).toBe(true);
    }
    expect(selectedWord(q.grid, 0, 8).word).toBe("");
  });
});
describe("fixed-step motion, collision fairness and pause", () => {
  it("shooting cooldown cannot suppress enemy damage and overlapping impacts cost one life", () => {
    const s = {
      ...newMotion("turret"),
      status: "running" as const,
      cooldown: 0.2,
      spawn: 1,
    };
    s.objects = [0, 1].map(() => ({
      x: 100,
      y: 326,
      vx: 0,
      vy: 1,
      r: 14,
      kind: "enemy",
      lane: 0,
      active: true,
    }));
    expect(motionStep(s, { ...emptyInput(), action: true }, 0.01).lives).toBe(
      2,
    );
  });
  for (const game of newGames.filter((g) => g.family === "motion"))
    it(`${game.id} pauses its simulation and has finite positions`, () => {
      const initial = newMotion(game.id);
      expect(motionStep(initial, emptyInput(), 1 / 60)).toBe(initial);
      let s = { ...initial, status: "running" as const };
      for (let i = 0; i < 180; i++)
        s = motionStep(
          s,
          { ...emptyInput(), right: i < 90, action: i % 20 === 0, lane: i % 4 },
          1 / 60,
        ) as typeof s;
      expect(Number.isFinite(s.x + s.y + s.score)).toBe(true);
      expect(s.time).toBeGreaterThan(0);
      const paused = { ...s, status: "paused" as const };
      expect(motionStep(paused, emptyInput(), 1 / 60)).toBe(paused);
    });
  it("stack preserves only the supported overlap and wins after twelve placements", () => {
    let s = { ...newMotion("stack"), status: "running" as const };
    for (let i = 0; i < 12; i++) {
      s.x = s.base;
      s.lastAction = false;
      s = motionStep(s, { ...emptyInput(), action: true }, 0) as typeof s;
    }
    expect(s.status).toBe("won");
    expect(s.progress).toBe(12);
  });
  it("rhythm scores a timed lane press and never hits another lane", () => {
    let s = { ...newMotion("rhythm"), status: "running" as const, spawn: 1 };
    s.objects = [
      {
        x: 60,
        y: 300,
        vx: 0,
        vy: 100,
        r: 18,
        kind: "note",
        lane: 0,
        active: true,
      },
    ];
    const correct = motionStep(s, { ...emptyInput(), lane: 0 }, 0);
    expect(correct.score).toBe(105);
    expect(s.score).toBe(0);
    expect(motionStep(s, { ...emptyInput(), lane: 1 }, 0).lives).toBe(2);
  });
  it("balloon targeting uses actual radius and differentiates bombs", () => {
    const s = { ...newMotion("balloons"), status: "running" as const };
    s.objects = [
      {
        x: 100,
        y: 100,
        vx: 0,
        vy: 0,
        r: 24,
        kind: "balloon",
        lane: 0,
        active: true,
      },
    ];
    expect(motionTarget(s, 100, 100).score).toBe(22);
    expect(motionTarget(s, 200, 200).score).toBe(0);
    s.objects[0].kind = "bomb";
    expect(motionTarget(s, 100, 100).lives).toBe(2);
  });
  it("ricochet spends a single shot per press and reverses at walls", () => {
    let s = { ...newMotion("ricochet"), status: "running" as const };
    s = motionStep(s, { ...emptyInput(), action: true }, 0.01) as typeof s;
    expect(s.shots).toBe(7);
    expect(motionStep(s, { ...emptyInput(), action: true }, 0.01).shots).toBe(
      7,
    );
    const bullet = s.objects.find((o) => o.kind === "bullet")!;
    bullet.x = 479;
    bullet.vx = 100;
    expect(
      motionStep(s, emptyInput(), 0.01).objects.find(
        (o) => o.kind === "bullet",
      )!.vx,
    ).toBe(-100);
  });
});
