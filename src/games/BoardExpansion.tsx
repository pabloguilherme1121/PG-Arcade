import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  boardClick,
  boardScore,
  boardValue,
  knightMoves,
  laserPath,
  loopEdges,
  newBoard,
  slideVehicle,
  type BoardState,
} from "../lib/boardExpansion";
import { newGames, type BoardId } from "../lib/newCatalog";
import { useAutoPause } from "./useAutoPause";
import "./newGames.css";
type Props = { gameId: BoardId; record: number; onRecord: (n: number) => void };
const pipeChars: Record<number, string> = {
  3: "┌",
  6: "┐",
  12: "┘",
  9: "└",
  5: "─",
  10: "│",
  1: "╶",
  2: "╷",
  4: "╴",
  8: "╵",
};
const strategic = [
  "gomoku",
  "hex",
  "ataxx",
  "isolation",
  "breakthrough",
  "territory",
];
export default function BoardExpansion({ gameId, record, onRecord }: Props) {
  const [difficulty, setDifficulty] = useState(1),
    [seed, setSeed] = useState(1);
  const [state, setState] = useState(() => newBoard(gameId, 1, 1)),
    [history, setHistory] = useState<BoardState[]>([]),
    [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(0);
  const board = useRef<HTMLDivElement>(null),
    awarded = useRef(false);
  const meta = newGames.find((g) => g.id === gameId)!;
  const pause = useCallback(() => setPaused(true), []);
  useAutoPause(pause);
  useEffect(() => {
    if (state.status === "won" && !awarded.current) {
      awarded.current = true;
      onRecord(boardScore(state));
    }
  }, [state, onRecord]);
  function reset(d = difficulty, next = seed) {
    setDifficulty(d);
    setSeed(next);
    setState(newBoard(gameId, d, next));
    setHistory([]);
    setPaused(false);
    awarded.current = false;
  }
  function update(next: BoardState) {
    if (next === state) return;
    setHistory((h) => [...h.slice(-199), state]);
    setState(next);
  }
  const n = state.size,
    numeric = ["latin", "sky", "futoshiki", "magic", "takuzu"].includes(gameId),
    sort = ["colorsort", "watersort"].includes(gameId);
  const path = gameId === "laser" ? laserPath(state.cells, n) : null;
  function cellText(i: number, v: number): string {
    if (gameId === "pipes") return pipeChars[v] || "·";
    if (gameId === "laser") return v === 1 ? "/" : v === 2 ? "\\" : "·";
    if (gameId === "queens") return v ? "♛" : "·";
    if (gameId === "peg") return v === 1 ? "●" : v === 0 ? "○" : "";
    if (gameId === "takuzu") return v ? String(v - 1) : "·";
    if (gameId === "memorypath")
      return state.phase === 0
        ? state.goal.includes(i)
          ? String(state.goal.indexOf(i) + 1)
          : "·"
        : v
          ? String(v)
          : "·";
    if (gameId === "knight")
      return v
        ? String(v)
        : knightMoves(state.selected, state.cells, n).includes(i)
          ? "•"
          : "·";
    if (strategic.includes(gameId))
      return v === 1 ? "X" : v === 2 ? "O" : v === -1 ? "×" : "·";
    if (gameId === "chomp") return v ? (i === 0 ? "☠" : "▣") : "";
    if (gameId === "same" || gameId === "flood") return v ? String(v) : "";
    return v ? String(v) : "·";
  }
  function keys(e: React.KeyboardEvent<HTMLDivElement>) {
    const index = Number((e.target as HTMLElement).dataset.index);
    if (!Number.isFinite(index)) {
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(
          e.key,
        )
      ) {
        e.preventDefault();
        board.current
          ?.querySelector<HTMLButtonElement>(
            "button[data-index]:not(:disabled)",
          )
          ?.focus();
      }
      return;
    }
    const delta: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -n,
      ArrowDown: n,
      a: -1,
      d: 1,
      w: -n,
      s: n,
    };
    if (e.key === "Escape") {
      e.preventDefault();
      setPaused((p) => !p);
      return;
    }
    if (
      delta[e.key.toLowerCase()] !== undefined ||
      delta[e.key] !== undefined
    ) {
      e.preventDefault();
      const d = delta[e.key] ?? delta[e.key.toLowerCase()];
      if (gameId === "slideblock") {
        update(slideVehicle(state, d));
        return;
      }
      const target = index + d;
      if (
        target < 0 ||
        target >= state.cells.length ||
        (Math.abs(d) === 1 && Math.floor(target / n) !== Math.floor(index / n))
      )
        return;
      board.current
        ?.querySelector<HTMLButtonElement>(`[data-index="${target}"]`)
        ?.focus();
    }
    if (numeric && /^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const value = Number(e.key) + (gameId === "takuzu" ? 1 : 0);
      if (value <= (gameId === "magic" ? 9 : gameId === "takuzu" ? 2 : 4))
        update(boardClick({ ...state, value }, index));
    }
  }
  return (
    <section className="new-game board-expansion" data-new-game={gameId}>
      <div className="new-options">
        <label>
          Dificuldade
          <select
            aria-label="Dificuldade"
            value={difficulty}
            onChange={(e) => reset(Number(e.target.value), seed)}
          >
            <option value={0}>Iniciante</option>
            <option value={1}>Normal</option>
            <option value={2}>Avançado</option>
          </select>
        </label>
        <button aria-pressed={expanded} onClick={() => setExpanded((p) => !p)}>
          {expanded ? "Ajustar à tela" : "Ampliar tabuleiro"}
        </button>
        <button onClick={() => reset(difficulty, seed + 1)}>
          Novo desafio
        </button>
      </div>
      <div className="new-hud">
        <span>
          Jogadas <strong>{state.moves}</strong>
        </span>
        <span>
          Recorde <strong>{record}</strong>
        </span>
        <span>
          Desafio <strong>{seed}</strong>
        </span>
      </div>
      <div role="status" className="new-status">
        {paused ? "Partida pausada" : state.message}
      </div>
      <div className="new-workspace">
        <div
          className={`new-board-wrap ${expanded ? "board-scale-expanded" : ""}`}
          data-expanded-board
          tabIndex={0}
          ref={board}
          onKeyDown={keys}
        >
          {paused ? (
            <div className="new-pause">
              <p>O tabuleiro está pausado.</p>
              <button className="primary" onClick={() => setPaused(false)}>
                Continuar
              </button>
            </div>
          ) : gameId === "loop" ? (
            <div className="loop-board">
              <svg viewBox="0 0 400 400" aria-hidden="true">
                {loopEdges().map(([a, b], i) => (
                  <line
                    key={i}
                    x1={40 + (a % 4) * 105}
                    y1={40 + Math.floor(a / 4) * 105}
                    x2={40 + (b % 4) * 105}
                    y2={40 + Math.floor(b / 4) * 105}
                    stroke={state.cells[i] ? "#c9f65a" : "#42505e"}
                    strokeWidth={state.cells[i] ? 9 : 3}
                  />
                ))}
                {Array.from({ length: 16 }, (_, i) => (
                  <circle
                    key={i}
                    cx={40 + (i % 4) * 105}
                    cy={40 + Math.floor(i / 4) * 105}
                    r={10}
                    fill="#fff"
                  />
                ))}
              </svg>
              {loopEdges().map(([a, b], i) => (
                <button
                  key={i}
                  aria-label={`Segmento ${a + 1} a ${b + 1}`}
                  aria-pressed={!!state.cells[i]}
                  onClick={() => update(boardClick(state, i))}
                  disabled={state.status !== "playing"}
                  style={{
                    left: `${(40 + ((a % 4) + (b % 4)) * 52.5) / 4}%`,
                    top: `${(40 + (Math.floor(a / 4) + Math.floor(b / 4)) * 52.5) / 4}%`,
                  }}
                >
                  {state.cells[i] ? "✓" : "+"}
                </button>
              ))}
            </div>
          ) : sort ? (
            <div className="sort-board">
              {Array.from({ length: 6 }, (_, tube) => (
                <button
                  key={tube}
                  className={state.selected === tube ? "selected" : ""}
                  disabled={state.status !== "playing"}
                  onClick={() => update(boardClick(state, tube * 4))}
                  aria-label={`Pilha ${tube + 1}: ${
                    state.cells
                      .slice(tube * 4, tube * 4 + 4)
                      .filter(Boolean)
                      .join(", ") || "vazia"
                  }`}
                >
                  {state.cells.slice(tube * 4, tube * 4 + 4).map((v, k) => (
                    <span key={k} className={`new-color color-${v}`}>
                      {v || "·"}
                    </span>
                  ))}
                </button>
              ))}
            </div>
          ) : (
            <div
              className={`new-grid grid-${gameId}`}
              role="group"
              aria-label={`Tabuleiro de ${meta.name}`}
              style={{ "--new-size": n } as CSSProperties}
            >
              {state.cells.map((v, i) => (
                <button
                  key={i}
                  data-index={i}
                  data-value={v}
                  tabIndex={
                    i ===
                    (state.cells[focused] === -1
                      ? state.cells.findIndex((x) => x >= 0)
                      : focused)
                      ? 0
                      : -1
                  }
                  onFocus={() => setFocused(i)}
                  className={`${["same", "flood", "links", "slideblock"].includes(gameId) ? `color-${v}` : ""} ${state.selected === i ? "selected" : ""} ${state.fixed[i] ? "fixed" : ""}`}
                  disabled={state.status !== "playing" || v === -1}
                  aria-disabled={
                    (numeric || gameId === "laser" || gameId === "queens") &&
                    !!state.fixed[i]
                  }
                  aria-label={`Linha ${Math.floor(i / n) + 1}, coluna ${(i % n) + 1}: ${cellText(i, v) || "vazia"}${state.fixed[i] ? ", pista" : ""}`}
                  onClick={() => update(boardClick(state, i))}
                >
                  {cellText(i, v)}
                </button>
              ))}
              {path && (
                <svg
                  className="laser-ray"
                  viewBox={`-1 -1 ${n + 2} ${n + 2}`}
                  aria-hidden="true"
                >
                  <polyline
                    points={path.points
                      .map(([x, y]) => `${x + 0.5},${y + 0.5}`)
                      .join(" ")}
                    fill="none"
                    stroke="#ffc766"
                    strokeWidth=".07"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
        <aside className="new-instructions">
          <h2>Como jogar</h2>
          <p>{meta.help}</p>
          {gameId === "sky" && (
            <div className="clue-panel">
              <p>Topo: {state.aux.slice(0, 4).join(" · ")}</p>
              <p>Esquerda: {state.aux.slice(4, 8).join(" · ")}</p>
              <p>Direita: {state.aux.slice(8, 12).join(" · ")}</p>
              <p>Base: {state.aux.slice(12, 16).join(" · ")}</p>
            </div>
          )}
          {gameId === "futoshiki" && (
            <ul>
              {[0, 3, 6].map((i) => (
                <li key={i}>
                  Casa {state.aux[i] + 1} {state.aux[i + 2] < 0 ? "<" : ">"}{" "}
                  casa {state.aux[i + 1] + 1}
                </li>
              ))}
            </ul>
          )}
          {gameId === "rotate" && <p>Referência: {state.goal.join(" · ")}</p>}
          {gameId === "flood" && (
            <p>{24 - state.moves} movimentos restantes.</p>
          )}
          {(numeric || ["links", "flood"].includes(gameId)) && (
            <div className="value-picker" aria-label="Escolher valor">
              {Array.from(
                {
                  length:
                    gameId === "magic"
                      ? 10
                      : gameId === "flood"
                        ? 4 + difficulty
                        : gameId === "takuzu"
                          ? 3
                          : 5,
                },
                (_, v) => v,
              )
                .filter((v) => gameId !== "flood" || v > 0)
                .map((v) => (
                  <button
                    key={v}
                    disabled={paused || state.status !== "playing"}
                    aria-pressed={state.value === v}
                    onClick={() => update(boardValue(state, v))}
                  >
                    {v === 0 ? "Apagar" : gameId === "takuzu" ? v - 1 : v}
                  </button>
                ))}
            </div>
          )}
          {gameId === "memorypath" && state.phase === 0 && (
            <button
              disabled={paused}
              onClick={() =>
                update({
                  ...state,
                  phase: 1,
                  selected: 0,
                  message: "Repita a trilha na ordem observada.",
                })
              }
            >
              Ocultar trilha
            </button>
          )}
          {gameId === "slideblock" && (
            <div className="value-picker">
              {[
                ["←", -1],
                ["↑", -6],
                ["↓", 6],
                ["→", 1],
              ].map(([label, d]) => (
                <button
                  key={label}
                  disabled={paused || state.status !== "playing"}
                  aria-label={`Deslizar ${label}`}
                  onClick={() => update(slideVehicle(state, Number(d)))}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="new-actions">
            <button
              disabled={!history.length || paused}
              onClick={() => {
                setState(history.at(-1)!);
                setHistory((h) => h.slice(0, -1));
              }}
            >
              Desfazer
            </button>
            <button onClick={() => setPaused((p) => !p)}>
              {paused ? "Continuar" : "Pausar"}
            </button>
            <button onClick={() => reset()}>Reiniciar</button>
          </div>
          <p className="new-tip">
            Setas navegam entre casas. Enter confirma. Desfazer recupera a
            última jogada e a resposta do adversário.
          </p>
        </aside>
      </div>
    </section>
  );
}
