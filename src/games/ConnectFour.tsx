import { useCallback, useEffect, useRef, useState } from "react";
import { dropDisc, discWinner } from "../lib/puzzles";
import {
  chooseDiscMove,
  winningDiscs,
  discColumnFromKey,
  type DiscDifficulty,
} from "../lib/connectFour";
import { useAutoPause } from "./useAutoPause";
export default function ConnectFour() {
  const [board, setBoard] = useState<number[]>(Array(42).fill(0));
  const [turn, setTurn] = useState(1);
  const [history, setHistory] = useState<{ board: number[]; turn: number }[]>(
    [],
  );
  const [mode, setMode] = useState("local");
  const [difficulty, setDifficulty] = useState<DiscDifficulty>("normal");
  const [paused, setPaused] = useState(false);
  const pendingBot = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseFlag = useRef(false);
  const pause = useCallback(() => {
    pauseFlag.current = true;
    if (pendingBot.current !== null) clearTimeout(pendingBot.current);
    pendingBot.current = null;
    setPaused(true);
  }, []);
  useAutoPause(pause);
  const winner = discWinner(board);
  const over = !!winner || board.every(Boolean);
  const botTurn = mode === "bot" && turn === 2 && !over;
  const winning = winningDiscs(board);
  const last = history.length
    ? board.findIndex((v, i) => v !== history[history.length - 1].board[i])
    : -1;
  function reset() {
    if (pendingBot.current !== null) clearTimeout(pendingBot.current);
    pendingBot.current = null;
    pauseFlag.current = false;
    setBoard(Array(42).fill(0));
    setTurn(1);
    setHistory([]);
    setPaused(false);
  }
  function play(column: number) {
    if (over || paused || botTurn) return;
    const next = dropDisc(board, column, turn);
    if (next) {
      setHistory((h) => [...h, { board, turn }]);
      setBoard(next);
      setTurn((t) => 3 - t);
    }
  }
  useEffect(() => {
    if (!botTurn || paused) return;
    const timer = setTimeout(() => {
      if (pauseFlag.current) return;
      pendingBot.current = null;
      const column = chooseDiscMove(board, 2, difficulty);
      if (column === null) return;
      setHistory((h) => [...h, { board, turn: 2 }]);
      setBoard(dropDisc(board, column, 2)!);
      setTurn(1);
    }, 350);
    pendingBot.current = timer;
    return () => {
      clearTimeout(timer);
      if (pendingBot.current === timer) pendingBot.current = null;
    };
  }, [board, botTurn, paused, difficulty]);
  function undo() {
    if (pendingBot.current !== null) clearTimeout(pendingBot.current);
    pendingBot.current = null;
    const index =
      mode === "bot" && turn === 1 && history.length >= 2
        ? history.length - 2
        : history.length - 1;
    const previous = history[index];
    if (!previous) return;
    setBoard(previous.board);
    setTurn(previous.turn);
    setHistory((h) => h.slice(0, index));
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <p className="game-status" role="status">
          {winner
            ? `${mode === "bot" && winner === 2 ? "Bot" : `Jogador ${winner}`} venceu!`
            : over
              ? "Empate!"
              : paused
                ? "Partida pausada"
                : botTurn
                  ? "Bot pensando…"
                  : `Vez do jogador ${turn} — ${turn === 1 ? "coral" : "lima"}`}
        </p>
        <div className="connect-controls" aria-label="Escolha a coluna">
          {Array.from({ length: 7 }, (_, i) => (
            <button
              key={i}
              aria-label={`Jogar na coluna ${i + 1}`}
              disabled={over || paused || botTurn || !!board[i]}
              onClick={() => play(i)}
            >
              {i + 1} ↓
            </button>
          ))}
        </div>
        <div
          className="connect-board"
          role="group"
          tabIndex={0}
          aria-label={`Tabuleiro Liga 4. Use as teclas 1 a 7 para jogar. ${
            board
              .map((v, i) =>
                v
                  ? `Linha ${Math.floor(i / 7) + 1}, coluna ${(i % 7) + 1}: jogador ${v}`
                  : "",
              )
              .filter(Boolean)
              .join("; ") || "Tabuleiro vazio"
          }`}
          onKeyDown={(e) => {
            const column = discColumnFromKey(e.key);
            if (column !== null) {
              e.preventDefault();
              play(column);
            }
          }}
        >
          {board.map((v, i) => (
            <span
              key={i}
              className={`disc disc-${v} ${winning.includes(i) ? "disc-winning" : ""} ${last === i ? "disc-last" : ""}`}
            >
              {v || ""}
            </span>
          ))}
        </div>
        <div className="game-actions">
          <button disabled={!history.length} onClick={undo}>
            Desfazer jogada
          </button>
          <button
            disabled={over}
            onClick={() => {
              if (paused) {
                pauseFlag.current = false;
                setPaused(false);
              } else pause();
            }}
          >
            {paused ? "Continuar" : "Pausar"}
          </button>
          <button className="primary" onClick={reset}>
            Nova partida
          </button>
        </div>
      </div>
      <aside className="instructions">
        <div className="session-options">
          <label>
            Adversário
            <select
              aria-label="Adversário do Liga 4"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                reset();
              }}
            >
              <option value="local">1 × 1 local</option>
              <option value="bot">Contra o bot</option>
            </select>
          </label>
          <label>
            Dificuldade
            <select
              aria-label="Dificuldade do Liga 4"
              value={difficulty}
              disabled={mode !== "bot"}
              onChange={(e) => {
                setDifficulty(e.target.value as DiscDifficulty);
                reset();
              }}
            >
              <option value="easy">Fácil</option>
              <option value="normal">Normal</option>
              <option value="hard">Difícil</option>
            </select>
          </label>
        </div>
        <h2>Quatro em linha</h2>
        <p>
          Forme quatro peças na horizontal, vertical ou diagonal. Coral começa.
          A última peça tem um contorno; a linha vencedora ganha destaque.
        </p>
        <p>
          Jogue com outra pessoa ou enfrente o bot. Fácil escolhe colunas
          livres; Normal procura vitórias e bloqueios; Difícil planeja cinco
          jogadas à frente.
        </p>
        <h3>Toque ou teclado</h3>
        <p>
          Toque no número da coluna, pressione 1–7 diretamente ou use Tab e
          Enter. Contra o bot, desfazer volta seu turno inteiro. Trocar
          adversário ou dificuldade inicia outra partida.
        </p>
      </aside>
    </div>
  );
}
