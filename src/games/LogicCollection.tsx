import { useState, Children, isValidElement, cloneElement } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  logicGames,
  codeFeedback,
  sudokuSolution,
  validSudoku,
  runs,
  hanoiMove,
  reversiFlips,
  maze,
  path,
  boxEdges,
  completedBoxes,
  sokobanStep,
  fleet,
} from "../lib/logicCollection";
import "./logicCollection.css";
type Props = { gameId: string; record: number; onRecord: (n: number) => void };
type Settings = {
  difficulty: number;
  round: number;
  mode: string;
  onWin: () => void;
};

function Grid({
  size,
  children,
  onMove,
}: {
  size: number;
  children: ReactNode;
  onMove?: (delta: number) => void;
}) {
  const [focus, setFocus] = useState(0);
  function keys(e: KeyboardEvent<HTMLDivElement>) {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -size,
      ArrowDown: size,
    };
    const d = deltas[e.key];
    if (d === undefined) return;
    e.preventDefault();
    if (onMove) {
      onMove(d);
      return;
    }
    const rowStart = Math.floor(focus / size) * size;
    const next = e.key === "ArrowLeft" ? Math.max(rowStart, focus - 1)
      : e.key === "ArrowRight" ? Math.min(rowStart + size - 1, focus + 1)
      : Math.max(focus % size, Math.min((size - 1) * size + focus % size, focus + d));
    setFocus(next);
    const buttons =
      e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
    buttons.forEach((b, i) => (b.tabIndex = i === next ? 0 : -1));
    buttons[next]?.focus();
  }
  return (
    <div
      className="lc-grid"
      data-expanded-board
      tabIndex={0}
      style={{ "--lc-size": size } as CSSProperties}
      onKeyDown={keys}
      onFocus={(e) => {
        const list = Array.from(e.currentTarget.querySelectorAll("button"));
        const i =
          e.target instanceof HTMLButtonElement ? list.indexOf(e.target) : -1;
        if (i >= 0) {
          setFocus(i);
          list.forEach((b, n) => (b.tabIndex = n === i ? 0 : -1));
        }
      }}
    >
      {Children.map(children, (child, index) =>
        isValidElement<{ tabIndex?: number }>(child) && child.type === "button"
          ? cloneElement(child, { tabIndex: index === focus ? 0 : -1 })
          : child,
      )}
    </div>
  );
}
const cellTab = (i: number) => (i === 0 ? 0 : -1);
export default function LogicCollection({ gameId, record, onRecord }: Props) {
  const [difficulty, setDifficulty] = useState(1),
    [mode, setMode] = useState("livre"),
    [round, setRound] = useState(1),
    [generation, setGeneration] = useState(0),
    [won, setWon] = useState(false),
    [score, setScore] = useState(0);
  const metadata = logicGames.find((g) => g.id === gameId)!;
  const win = () => {
    if (won) return;
    const points = score + 100 * (difficulty + 1);
    onRecord(points);
    setScore(points);
    setWon(true);
  };
  const settings = { difficulty, mode, round, onWin: win };
  const reset = () => {
    setGeneration((n) => n + 1);
    setWon(false);
  };
  return (
    <section className="logic-collection">
      <div className="lc-settings">
        <label>
          Dificuldade
          <select
            aria-label="Dificuldade"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(+e.target.value);
              setScore(0);
              setRound(1);
              reset();
            }}
          >
            <option value={0}>Fácil</option>
            <option value={1}>Normal</option>
            <option value={2}>Difícil</option>
          </select>
        </label>
        <label>
          Modo
          <select
            aria-label="Modo"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setScore(0);
              setRound(1);
              reset();
            }}
          >
            <option value="livre">Desafio livre</option>
            <option value="serie">Série de 5 desafios</option>
            {gameId === "nim" && (
              <option value="reverso">Última peça perde</option>
            )}
          </select>
        </label>
      </div>
      <p className="lc-instructions">{metadata.help}</p>
      <p className="lc-stats">
        Desafio {round}
        {mode === "serie" ? " / 5" : ""} · Pontos {score} · Recorde {record}
      </p>
      <div key={`${gameId}-${difficulty}-${mode}-${round}-${generation}`}>
        {gameId === "sudoku" ? (
          <Sudoku {...settings} />
        ) : gameId === "nonograma" ? (
          <Nonogram {...settings} />
        ) : gameId === "labirinto" ? (
          <Maze {...settings} />
        ) : gameId === "sokoban" ? (
          <Sokoban {...settings} />
        ) : gameId === "hanoi" ? (
          <Hanoi {...settings} />
        ) : gameId === "senha" ? (
          <Code {...settings} />
        ) : gameId === "nim" ? (
          <Nim {...settings} />
        ) : gameId === "reversi" ? (
          <Reversi {...settings} />
        ) : gameId === "batalha" ? (
          <Battleship {...settings} />
        ) : (
          <Boxes {...settings} />
        )}
      </div>
      {won && (
        <div className="lc-success" role="status">
          Desafio vencido!{" "}
          {mode === "serie" && round === 5 ? (
            "Série concluída."
          ) : (
            <button
              onClick={() => {
                setRound((n) => n + 1);
                setWon(false);
              }}
            >
              Próximo desafio
            </button>
          )}
        </div>
      )}
      <button
        className="lc-reset"
        onClick={() => {
          setScore(0);
          setRound(1);
          reset();
        }}
      >
        Recomeçar série
      </button>
    </section>
  );
}
function Sudoku({ difficulty, round, onWin }: Settings) {
  const size = difficulty === 0 ? 4 : 9,
    solution = sudokuSolution(size, round),
    fixed = solution.map(
      (_, i) =>
        (i * 7 + round) % 10 <
        (difficulty === 0 ? 5 : difficulty === 1 ? 6 : 4),
    );
  const [values, setValues] = useState(
      solution.map((v, i) => (fixed[i] ? v : 0)),
    ),
    [selected, setSelected] = useState(fixed.findIndex((v) => !v)),
    [message, setMessage] = useState("Preencha as casas vazias."),
    [done, setDone] = useState(false),
    [hints, setHints] = useState(0);
  const conflict = (index: number) => {
    const value = values[index];
    if (!value) return false;
    const row = Math.floor(index / size),
      col = index % size,
      box = Math.sqrt(size);
    return values.some(
      (v, i) =>
        i !== index &&
        v === value &&
        (Math.floor(i / size) === row ||
          i % size === col ||
          (Math.floor(Math.floor(i / size) / box) === Math.floor(row / box) &&
            Math.floor((i % size) / box) === Math.floor(col / box))),
    );
  };
  function fill(n: number) {
    if (fixed[selected] || done) return;
    const next = values.map((v, i) => (i === selected ? n : v));
    setValues(next);
    if (validSudoku(next, size)) {
      onWin();
      setDone(true);
      setMessage("Todas as linhas e regiões completas.");
    }
  }
  return (
    <>
      <Grid size={size}>
        {values.map((v, i) => (
          <button
            key={i}
            tabIndex={cellTab(i)}
            aria-label={`Linha ${Math.floor(i / size) + 1}, coluna ${(i % size) + 1}, ${v || "vazia"}${fixed[i] ? ", pista fixa" : ""}`}
            aria-pressed={selected === i}
            className={`${fixed[i] ? "lc-fixed" : ""} ${conflict(i) ? "lc-error" : ""}`}
            style={{
              borderRightWidth:
                ((i % size) + 1) % Math.sqrt(size) === 0 ? 3 : 1,
              borderBottomWidth:
                (Math.floor(i / size) + 1) % Math.sqrt(size) === 0 ? 3 : 1,
            }}
            onClick={() => setSelected(i)}
            onFocus={() => setSelected(i)}
            onKeyDown={(e) => {
              if (/^[1-9]$/.test(e.key) && +e.key <= size) {
                e.preventDefault();
                fill(+e.key);
              } else if (e.key === "Backspace" || e.key === "Delete") {
                e.preventDefault();
                fill(0);
              }
            }}
          >
            {v || "·"}
          </button>
        ))}
      </Grid>
      <div className="lc-actions">
        {Array.from({ length: size }, (_, i) => (
          <button key={i} onClick={() => fill(i + 1)} disabled={done}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => fill(0)} disabled={done}>
          Apagar
        </button>
        <button
          disabled={done || hints >= 3 || fixed[selected]}
          onClick={() => {
            fill(solution[selected]);
            setHints((n) => n + 1);
          }}
        >
          Dica ({3 - hints})
        </button>
      </div>
      <p role="status">{message} Números repetidos ficam destacados.</p>
    </>
  );
}
function Nonogram({ difficulty, round, onWin }: Settings) {
  const size = 5 + difficulty,
    solution = Array.from(
      { length: size * size },
      (_, i) => (Math.floor(i / size) * 3 + (i % size) * 5 + round) % 7 < 3,
    );
  const [values, setValues] = useState(Array(size * size).fill(0) as number[]),
    [cross, setCross] = useState(false),
    [done, setDone] = useState(false);
  function mark(i: number) {
    if (done) return;
    const next = values.map((v, n) =>
      n === i ? (v === (cross ? 2 : 1) ? 0 : cross ? 2 : 1) : v,
    );
    setValues(next);
    if (next.every((v, n) => (v === 1) === solution[n])) {
      onWin();
      setDone(true);
    }
  }
  return (
    <>
      <div className="lc-clues">
        <p>
          Colunas:{" "}
          {Array.from({ length: size }, (_, c) =>
            runs(solution.filter((_, i) => i % size === c)).join("·"),
          ).join(" | ")}
        </p>
        <p>
          Linhas:{" "}
          {Array.from(
            { length: size },
            (_, r) =>
              `${r + 1}: ${runs(solution.slice(r * size, (r + 1) * size)).join("·")}`,
          ).join(" | ")}
        </p>
      </div>
      <button aria-pressed={cross} onClick={() => setCross(!cross)}>
        {cross ? "Modo X (vazio)" : "Modo pintar"}
      </button>
      <Grid size={size}>
        {values.map((v, i) => (
          <button
            key={i}
            tabIndex={cellTab(i)}
            onClick={() => mark(i)}
            className={v === 1 ? "lc-painted" : ""}
            aria-label={`Linha ${Math.floor(i / size) + 1}, coluna ${(i % size) + 1}: ${v === 1 ? "pintada" : v === 2 ? "vazia marcada" : "sem marca"}`}
          >
            {v === 2 ? "×" : v === 1 ? "■" : "·"}
          </button>
        ))}
      </Grid>
      <p role="status">
        {done
          ? "Figura completa!"
          : "Pinte apenas as casas indicadas; marcar todos os vazios é opcional."}
      </p>
    </>
  );
}
function Direction({ move }: { move: (d: string) => void }) {
  return (
    <div className="lc-actions">
      {[
        ["cima", "↑"],
        ["esquerda", "←"],
        ["baixo", "↓"],
        ["direita", "→"],
      ].map(([d, s]) => (
        <button key={d} aria-label={`Mover para ${d}`} onClick={() => move(d)}>
          {s}
        </button>
      ))}
    </div>
  );
}
function Maze({ difficulty, round, onWin }: Settings) {
  const size = 9 + difficulty * 2,
    walls = maze(size, round * 13 + difficulty),
    end = (size - 2) * size + size - 2;
  const [position, setPosition] = useState(size + 1),
    [trail, setTrail] = useState([size + 1]),
    [hint, setHint] = useState(-1),
    [done, setDone] = useState(false);
  function move(delta: number) {
    if (done) return;
    const next = position + delta;
    if (
      next < 0 ||
      next >= size * size ||
      walls[next] ||
      (Math.abs(delta) === 1 &&
        Math.floor(next / size) !== Math.floor(position / size))
    )
      return;
    setPosition(next);
    setTrail((t) => [...t, next]);
    setHint(-1);
    if (next === end) {
      onWin();
      setDone(true);
    }
  }
  return (
    <>
      <Grid size={size} onMove={move}>
        {walls.map((v, i) => (
          <span
            key={i}
            className={`lc-square ${v ? "lc-wall" : ""} ${i === hint ? "lc-hint" : ""}`}
            aria-hidden="true"
          >
            {i === position
              ? "●"
              : i === end
                ? "★"
                : trail.includes(i)
                  ? "·"
                  : ""}
          </span>
        ))}
      </Grid>
      <Direction
        move={(d) =>
          move({ cima: -size, baixo: size, esquerda: -1, direita: 1 }[d]!)
        }
      />
      <button
        disabled={done}
        onClick={() => setHint(path(walls, size, position, end)[1] ?? -1)}
      >
        Mostrar próximo passo
      </button>
      <p role="status">
        {done
          ? "Saída encontrada!"
          : `Passos: ${trail.length - 1}. Sua posição: linha ${Math.floor(position / size) + 1}, coluna ${(position % size) + 1}.`}
      </p>
    </>
  );
}
function Sokoban({ difficulty, round, onWin }: Settings) {
  const size = 7;
  const walls = Array.from({ length: 49 }, (_, i) => i).filter(
    (i) =>
      i < 7 ||
      i >= 42 ||
      i % 7 === 0 ||
      i % 7 === 6 ||
      (difficulty > 0 && [17, 31].includes(i)),
  );
  const count = difficulty + 1,
    targets = Array.from({ length: count }, (_, i) => 8 + i * 14),
    initialBoxes = Array.from({ length: count }, (_, i) => 11 + i * 14);
  const mirrored = round % 2 === 0;
  const transform = (i: number) =>
    mirrored ? Math.floor(i / 7) * 7 + 6 - (i % 7) : i;
  const [state, setState] = useState({
      position: transform(12),
      boxes: initialBoxes.map(transform),
    }),
    [history, setHistory] = useState<(typeof state)[]>([]),
    [done, setDone] = useState(false);
  function move(delta: number) {
    if (done) return;
    const next = sokobanStep(state.position, state.boxes, walls, delta);
    if (!next) return;
    setHistory((h) => [...h, state]);
    if (targets.map(transform).every((t) => next.boxes.includes(t))) {
      onWin();
      setDone(true);
    }
    setState(next);
  }
  return (
    <>
      <Grid size={7} onMove={move}>
        {Array.from({ length: 49 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`lc-square ${walls.includes(i) ? "lc-wall" : ""} ${targets.map(transform).includes(i) ? "lc-goal" : ""}`}
          >
            {i === state.position
              ? "●"
              : state.boxes.includes(i)
                ? "▣"
                : targets.map(transform).includes(i)
                  ? "◇"
                  : ""}
          </span>
        ))}
      </Grid>
      <Direction
        move={(d) => move({ cima: -7, baixo: 7, esquerda: -1, direita: 1 }[d]!)}
      />
      <button
        disabled={!history.length || done}
        onClick={() => {
          setState(history.at(-1)!);
          setHistory((h) => h.slice(0, -1));
        }}
      >
        Desfazer
      </button>
      <p role="status">
        {done
          ? "Todos os depósitos ocupados!"
          : `Caixas: ${count}. Movimentos: ${history.length}. Depósitos dourados à ${mirrored ? "direita" : "esquerda"}.`}
      </p>
    </>
  );
}
function Hanoi({ difficulty, onWin }: Settings) {
  const count = 3 + difficulty * 2;
  const [towers, setTowers] = useState<number[][]>([
      Array.from({ length: count }, (_, i) => count - i),
      [],
      [],
    ]),
    [from, setFrom] = useState<number | null>(null),
    [history, setHistory] = useState<number[][][]>([]),
    [message, setMessage] = useState("Escolha uma torre de origem."),
    [done, setDone] = useState(false);
  function pick(to: number) {
    if (done) return;
    if (from === null) {
      if (!towers[to].length) {
        setMessage("Esta torre está vazia.");
        return;
      }
      setFrom(to);
      setMessage("Agora escolha a torre de destino.");
      return;
    }
    if (from === to) {
      setFrom(null);
      return;
    }
    const next = hanoiMove(towers, from, to);
    setFrom(null);
    if (!next) {
      setMessage("Um disco maior não cabe sobre um menor.");
      return;
    }
    setHistory((h) => [...h, towers]);
    if (next[2].length === count) {
      onWin();
      setDone(true);
      setMessage("Todos os discos chegaram à terceira torre!");
    } else setMessage("Escolha a próxima origem.");
    setTowers(next);
  }
  return (
    <>
      <div className="lc-towers" data-expanded-board tabIndex={0}>
        {towers.map((tower, i) => (
          <button
            key={i}
            aria-pressed={from === i}
            aria-label={`Torre ${i + 1}, discos ${tower.join(", ") || "nenhum"}`}
            onClick={() => pick(i)}
          >
            {tower
              .slice()
              .reverse()
              .map((d) => (
                <span key={d} style={{ width: `${30 + (d / count) * 65}%` }}>
                  {d}
                </span>
              ))}
            <strong>Torre {i + 1}</strong>
          </button>
        ))}
      </div>
      <button
        disabled={!history.length || done}
        onClick={() => {
          setTowers(history.at(-1)!);
          setHistory((h) => h.slice(0, -1));
          setFrom(null);
        }}
      >
        Desfazer
      </button>
      <p role="status">
        {message} Movimentos: {history.length}. Mínimo possível:{" "}
        {2 ** count - 1}.
      </p>
    </>
  );
}
function Code({ difficulty, round, onWin }: Settings) {
  const length = 3 + difficulty,
    limit = 12 - difficulty * 2;
  const [secret] = useState(() =>
      Array.from({ length }, () => Math.floor(Math.random() * 6) + 1),
    ),
    [guess, setGuess] = useState(Array(length).fill(1) as number[]),
    [history, setHistory] = useState<
      { guess: number[]; exact: number; misplaced: number }[]
    >([]),
    [done, setDone] = useState(false),
    [won, setWon] = useState(false);
  return (
    <>
      <div className="lc-actions" data-expanded-board tabIndex={0}>
        {guess.map((n, i) => (
          <label key={i}>
            Posição {i + 1}
            <select
              value={n}
              disabled={done}
              onChange={(e) =>
                setGuess((g) =>
                  g.map((v, j) => (i === j ? +e.target.value : v)),
                )
              }
            >
              {[1, 2, 3, 4, 5, 6].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <button
        disabled={done}
        onClick={() => {
          const feedback = codeFeedback(secret, guess),
            success = feedback.exact === length;
          if (success) {
            onWin();
            setWon(true);
          }
          setHistory((h) => [...h, { guess: [...guess], ...feedback }]);
          setDone(success || history.length + 1 >= limit);
        }}
      >
        Testar código
      </button>
      <ol className="lc-history">
        {history.map((h, i) => (
          <li key={i}>
            {h.guess.join(" ")} — {h.exact} exatos, {h.misplaced} deslocados
          </li>
        ))}
      </ol>
      <p role="status">
        {done
          ? won
            ? "Código decifrado!"
            : `Tentativas esgotadas. Código: ${secret.join(" ")}.`
          : `Tentativa ${history.length + 1} de ${limit}. Código novo no desafio ${round}.`}
      </p>
    </>
  );
}
function Nim({ difficulty, round, mode, onWin }: Settings) {
  const [piles, setPiles] = useState([3 + (round % 2), 5, 7 + difficulty]),
    [done, setDone] = useState(false),
    [message, setMessage] = useState("Sua vez: escolha uma retirada.");
  function take(index: number, count: number) {
    if (done) return;
    const next = piles.map((v, i) => (i === index ? v - count : v));
    if (next.every((v) => !v)) {
      setPiles(next);
      setDone(true);
      if (mode !== "reverso") {
        onWin();
        setMessage("Você retirou a última e venceu!");
      } else setMessage("Você retirou a última e perdeu.");
      return;
    }
    let candidates: { i: number; n: number }[] = [];
    next.forEach((v, i) => {
      for (let n = 1; n <= v; n++) candidates.push({ i, n });
    });
    let choice = candidates[Math.floor(Math.random() * candidates.length)];
    if (difficulty > 0) {
      const optimal = candidates.find(({ i, n }) => {
        const after = next.map((v, j) => (j === i ? v - n : v)),
          nonzero = after.filter(Boolean);
        if (mode === "reverso" && nonzero.every((v) => v === 1))
          return nonzero.length % 2 === 1;
        return after.reduce((a, b) => a ^ b, 0) === 0;
      });
      if (optimal && (difficulty === 2 || Math.random() < 0.65))
        choice = optimal;
    }
    next[choice.i] -= choice.n;
    setPiles(next);
    if (next.every((v) => !v)) {
      setDone(true);
      if (mode === "reverso") {
        onWin();
        setMessage("O adversário retirou a última. Você venceu!");
      } else setMessage("O adversário retirou a última e venceu.");
    } else
      setMessage(
        `Adversário retirou ${choice.n} da pilha ${choice.i + 1}. Sua vez.`,
      );
  }
  return (
    <>
      <div className="lc-nim" data-expanded-board tabIndex={0}>
        {piles.map((n, i) => (
          <div key={i}>
            <h3>
              Pilha {i + 1}: {n} peças
            </h3>
            <p aria-hidden="true">{"● ".repeat(n)}</p>
            <div className="lc-actions">
              {Array.from({ length: n }, (_, j) => (
                <button key={j} disabled={done} onClick={() => take(i, j + 1)}>
                  −{j + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p role="status">{message}</p>
    </>
  );
}
function Reversi({ difficulty, onWin }: Settings) {
  const size = difficulty === 2 ? 8 : 6,
    initial = Array(size * size).fill(0) as number[],
    middle = size / 2;
  initial[(middle - 1) * size + middle - 1] = 2;
  initial[middle * size + middle] = 2;
  initial[(middle - 1) * size + middle] = 1;
  initial[middle * size + middle - 1] = 1;
  const [board, setBoard] = useState(initial),
    [message, setMessage] = useState(
      "Você joga com peças claras. Casas com ponto são jogadas legais.",
    ),
    [done, setDone] = useState(false);
  function legal(b: number[], p: number) {
    return b.map((_, i) => i).filter((i) => reversiFlips(b, i, p, size).length);
  }
  function apply(b: number[], i: number, p: number) {
    const next = [...b];
    next[i] = p;
    reversiFlips(b, i, p, size).forEach((j) => (next[j] = p));
    return next;
  }
  function finish(b: number[]) {
    const mine = b.filter((v) => v === 1).length,
      theirs = b.filter((v) => v === 2).length;
    setDone(true);
    if (mine > theirs) {
      onWin();
      setMessage(`Você venceu: ${mine} a ${theirs}.`);
    } else
      setMessage(
        mine === theirs
          ? `Empate: ${mine} a ${theirs}.`
          : `Adversário venceu: ${theirs} a ${mine}.`,
      );
  }
  function play(i: number) {
    if (done || !reversiFlips(board, i, 1, size).length) return;
    let next = apply(board, i, 1),
      moves = legal(next, 2),
      botCount = 0;
    while (moves.length) {
      let choice = moves[Math.floor(Math.random() * moves.length)];
      if (difficulty > 0)
        choice = [...moves].sort((a, b) => {
          const value = (n: number) => {
            const r = Math.floor(n / size),
              c = n % size;
            return (r === 0 || r === size - 1) && (c === 0 || c === size - 1)
              ? 100
              : reversiFlips(next, n, 2, size).length;
          };
          return value(b) - value(a);
        })[0];
      next = apply(next, choice, 2);
      botCount++;
      if (legal(next, 1).length) break;
      moves = legal(next, 2);
    }
    setBoard(next);
    if (!legal(next, 1).length && !legal(next, 2).length) finish(next);
    else
      setMessage(
        botCount
          ? `Adversário jogou ${botCount} vez${botCount > 1 ? "es" : ""}. Sua vez.`
          : "Adversário sem jogadas: sua vez novamente.",
      );
  }
  return (
    <>
      <Grid size={size}>
        {board.map((v, i) => (
          <button
            key={i}
            tabIndex={cellTab(i)}
            onClick={() => play(i)}
            aria-label={`Linha ${Math.floor(i / size) + 1}, coluna ${(i % size) + 1}, ${v === 1 ? "sua peça" : v === 2 ? "peça adversária" : reversiFlips(board, i, 1, size).length ? "jogada legal" : "vazia"}`}
            className={`lc-reversi lc-side-${v}`}
          >
            {v
              ? "●"
              : !done && reversiFlips(board, i, 1, size).length
                ? "·"
                : ""}
          </button>
        ))}
      </Grid>
      <p role="status">{message}</p>
      <p>
        Você: {board.filter((v) => v === 1).length} · Adversário:{" "}
        {board.filter((v) => v === 2).length}
      </p>
    </>
  );
}
function Battleship({ difficulty, round, onWin }: Settings) {
  const size = 6 + difficulty,
    count = 3 + difficulty;
  const [ships] = useState(() =>
      fleet(size, count, Math.floor(Math.random() * size * (size - 1)) + round),
    ),
    [shots, setShots] = useState<number[]>([]),
    [done, setDone] = useState(false),
    [message, setMessage] = useState("Localize os barcos de dois segmentos.");
  const limit = Math.ceil(size * size * (0.9 - difficulty * 0.1));
  function fire(i: number) {
    if (done || shots.includes(i)) return;
    const next = [...shots, i],
      won = ships.every((v) => next.includes(v));
    if (won) {
      onWin();
      setDone(true);
      setMessage("Frota inteira atingida. Vitória!");
    } else if (next.length >= limit) {
      setDone(true);
      setMessage("Munição esgotada. A frota restante foi revelada.");
    } else
      setMessage(
        ships.includes(i) ? "Acertou um segmento!" : "Água. Tente outra casa.",
      );
    setShots(next);
  }
  return (
    <>
      <Grid size={size}>
        {Array.from({ length: size * size }, (_, i) => (
          <button
            key={i}
            tabIndex={cellTab(i)}
            onClick={() => fire(i)}
            className={shots.includes(i) && ships.includes(i) ? "lc-hit" : ""}
            aria-label={`Linha ${Math.floor(i / size) + 1}, coluna ${(i % size) + 1}, ${shots.includes(i) ? (ships.includes(i) ? "acerto" : "água") : "não explorada"}`}
          >
            {shots.includes(i)
              ? ships.includes(i)
                ? "✕"
                : "≈"
              : done && ships.includes(i)
                ? "▰"
                : "·"}
          </button>
        ))}
      </Grid>
      <p role="status">{message}</p>
      <p>
        Munição: {limit - shots.length} · Segmentos atingidos:{" "}
        {shots.filter((v) => ships.includes(v)).length} / {ships.length}
      </p>
    </>
  );
}
function Boxes({ difficulty, onWin }: Settings) {
  const size = 2 + difficulty,
    total = 2 * size * (size + 1);
  const [edges, setEdges] = useState(Array(total).fill(0) as number[]),
    [owners, setOwners] = useState(Array(size * size).fill(0) as number[]),
    [done, setDone] = useState(false),
    [message, setMessage] = useState(
      "Você é verde. Escolha uma aresta para ligar os pontos.",
    );
  function draw(e: number) {
    if (done || edges[e]) return;
    const next = [...edges],
      boxes = [...owners];
    const add = (i: number, player: number) => {
      next[i] = player;
      let gained = 0;
      completedBoxes(next, size).forEach((complete, j) => {
        if (complete && !boxes[j]) {
          boxes[j] = player;
          gained++;
        }
      });
      return gained;
    };
    let gained = add(e, 1);
    if (!gained) {
      let options = next.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      while (options.length) {
        let choice = options[Math.floor(Math.random() * options.length)];
        if (difficulty > 0) {
          const completing = options.find((i) =>
            boxes.some(
              (v, j) =>
                !v &&
                boxEdges(Math.floor(j / size), j % size, size).filter(
                  (k) => next[k] > 0 || k === i,
                ).length === 4,
            ),
          );
          const safe = options.filter(
            (i) =>
              !boxes.some(
                (v, j) =>
                  !v &&
                  boxEdges(Math.floor(j / size), j % size, size).filter(
                    (k) => next[k] > 0 || k === i,
                  ).length === 3,
              ),
          );
          choice =
            completing ??
            safe[Math.floor(Math.random() * safe.length)] ??
            choice;
        }
        gained = add(choice, 2);
        if (!gained) break;
        options = next.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      }
    }
    setEdges(next);
    setOwners(boxes);
    if (boxes.every(Boolean)) {
      setDone(true);
      const mine = boxes.filter((v) => v === 1).length,
        theirs = boxes.length - mine;
      if (mine > theirs) {
        onWin();
        setMessage(`Você venceu por ${mine} a ${theirs}!`);
      } else
        setMessage(
          mine === theirs
            ? "Empate. Todas as caixas fechadas."
            : `Adversário venceu por ${theirs} a ${mine}.`,
        );
    } else setMessage("Sua vez. Fechar uma caixa dá outra jogada.");
  }
  return (
    <>
      <div className="lc-boxes" data-expanded-board tabIndex={0}>
        <div className="lc-box-score">
          Você: {owners.filter((v) => v === 1).length} · Adversário:{" "}
          {owners.filter((v) => v === 2).length}
        </div>
        <div
          className="lc-territory"
          style={{
            gridTemplateColumns: `repeat(${size},12px minmax(44px,1fr)) 12px`,
          }}
        >
          {Array.from({ length: (size * 2 + 1) ** 2 }, (_, index) => {
            const width = size * 2 + 1,
              row = Math.floor(index / width),
              col = index % width;
            if (row % 2 === 0 && col % 2 === 0)
              return (
                <span className="lc-dot" key={index}>
                  ●
                </span>
              );
            if (row % 2 && col % 2) {
              const owner =
                owners[Math.floor(row / 2) * size + Math.floor(col / 2)];
              return (
                <span
                  key={index}
                  className={`lc-owned lc-owner-${owner}`}
                  aria-label={`Caixa: ${owner === 1 ? "você" : owner === 2 ? "adversário" : "aberta"}`}
                >
                  {owner ? (owner === 1 ? "V" : "A") : ""}
                </span>
              );
            }
            const horizontal = row % 2 === 0,
              e = horizontal
                ? (row / 2) * size + Math.floor(col / 2)
                : size * (size + 1) +
                  Math.floor(row / 2) * (size + 1) +
                  col / 2;
            return (
              <button
                key={index}
                aria-label={`${horizontal ? "Horizontal" : "Vertical"} linha ${Math.floor(row / 2) + 1}, coluna ${Math.floor(col / 2) + 1}${edges[e] ? ", ocupada" : ""}`}
                className={`lc-edge lc-side-${edges[e]}`}
                onClick={() => draw(e)}
                disabled={Boolean(edges[e]) || done}
              >
                {horizontal ? "━" : "┃"}
              </button>
            );
          })}
        </div>
        <p>V = você · A = adversário</p>
      </div>
      <p role="status">{message}</p>
    </>
  );
}
