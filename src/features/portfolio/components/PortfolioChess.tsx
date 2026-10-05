import { Bot, Crown, RotateCcw, Swords, Undo2, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useAutoPause } from "@/games/useAutoPause";
import ArcadeDifficultyNotice from "./ArcadeDifficultyNotice";
import {
  applyChessMove,
  chooseChessBotMove,
  createInitialChessState,
  getChessLegalMoves,
  getChessStatus,
  isChessKingInCheck,
  type ChessState,
  type ChessColor,
  type ChessDifficulty,
  type ChessMove,
  type ChessPieceType,
} from "@/features/portfolio/utils/chess";
type Mode = "bot" | "local";
const glyph: Record<ChessColor, Record<ChessPieceType, string>> = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};
const labels: Record<ChessDifficulty, string> = {
  easy: "fácil",
  normal: "normal",
  hard: "difícil",
  master: "mestre",
  expert: "especialista",
};
const pieceLabels: Record<ChessPieceType, string> = {
  king: "rei",
  queen: "rainha",
  rook: "torre",
  bishop: "bispo",
  knight: "cavalo",
  pawn: "peão",
};
const squareName = (index: number) =>
  `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
function handleBoardKey(
  event: KeyboardEvent<HTMLButtonElement>,
  index: number,
) {
  const rowStart = Math.floor(index / 8) * 8;
  const destinations: Record<string, number> = {
    ArrowUp: Math.max(index % 8, index - 8),
    ArrowDown: Math.min(56 + (index % 8), index + 8),
    ArrowLeft: Math.max(rowStart, index - 1),
    ArrowRight: Math.min(rowStart + 7, index + 1),
    Home: rowStart,
    End: rowStart + 7,
  };
  const next = destinations[event.key];
  if (next === undefined) return;
  event.preventDefault();
  event.currentTarget
    .closest('[role="grid"]')
    ?.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')
    [next]?.focus();
}

export default function PortfolioChess() {
  const [focusedSquare, setFocusedSquare] = useState(52);
  const [paused, setPaused] = useState(false);
  const [botError, setBotError] = useState("");
  const [promotion, setPromotion] = useState<NonNullable<ChessMove["promotion"]>>("queen");
  const pause = useCallback(() => setPaused(true), []);
  useAutoPause(pause);
  const [mode, setMode] = useState<Mode>("bot"),
    [difficulty, setDifficulty] = useState<ChessDifficulty>("normal");
  const [state, setState] = useState(createInitialChessState);
  const { board, turn } = state;
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<ChessState[]>([]);
  const legal = useMemo(() => getChessLegalMoves(state), [state]);
  const statusKind = getChessStatus(state).kind;
  const outcome =
    statusKind === "checkmate" || statusKind === "stalemate"
      ? statusKind
      : null;
  const restart = () => {
    setState(createInitialChessState());
    setPaused(false); setBotError("");
    setSelected(null);
    setHistory([]);
  };
  const commit = (move: ChessMove) => {
    const next = applyChessMove(state, move);
    if (!next) return;
    setHistory((current) => [...current, state]);
    setState(next);
    setSelected(null);
  };
  const undo = () => {
    const count = mode === "bot" && turn === "white" ? 2 : 1;
    const index = Math.max(0, history.length - count);
    const previous = history[index];
    if (!previous) return;
    setState(previous);
    setSelected(null);
    setHistory(history.slice(0, index));
  };
  const click = (i: number) => {
    if (paused || outcome || (mode === "bot" && turn === "black")) return;
    const p = board[i];
    if (p?.color === turn) {
      setSelected(i);
      return;
    }
    const m = legal.find((x) => x.from === selected && x.to === i && (!x.promotion || x.promotion === promotion));
    if (m) commit(m);
  };
  useEffect(() => {
    if (mode !== "bot" || turn !== "black" || outcome || paused) return;
    let worker: Worker | undefined;
    let cancelled = false;
    const t = window.setTimeout(() => {
      // Keep deeper analysis off the UI thread so touch, pause and undo remain responsive.
      if (typeof Worker === "undefined") {
        const move = chooseChessBotMove(state, "black", "normal");
        if (move) commit(move);
        return;
      }
      try {
        worker = new Worker(new URL("../utils/chess.worker.ts", import.meta.url), { type: "module" });
        worker.onmessage = (event: MessageEvent<ChessMove | null>) => {
          if (!cancelled && event.data) commit(event.data);
          worker?.terminate();
        };
        worker.onerror = () => {
          if (!cancelled) { setBotError("O bot não respondeu. Continue para tentar novamente ou escolha 1 × 1 local."); setPaused(true); }
          worker?.terminate();
        };
        worker.postMessage({ state, difficulty });
      } catch {
        setBotError("A análise do bot está indisponível. Escolha 1 × 1 local para continuar."); setPaused(true);
      }
    }, 360);
    return () => { cancelled = true; clearTimeout(t); worker?.terminate(); };
  }, [state, difficulty, mode, outcome, turn, paused]);
  const selectedMoves =
    selected === null
      ? []
      : legal.filter((m) => m.from === selected).map((m) => m.to);
  const status = paused ? "Partida pausada" :
    outcome === "checkmate"
      ? turn === "white"
        ? mode === "bot"
          ? "PG Bot venceu por xeque-mate."
          : "Pretas venceram por xeque-mate."
        : "Brancas venceram por xeque-mate."
      : outcome === "stalemate"
        ? "Empate por afogamento."
        : `${turn === "white" ? (mode === "bot" ? "Sua vez" : "Vez das brancas") : mode === "bot" ? "PG Bot pensando" : "Vez das pretas"}${isChessKingInCheck(board, turn) ? " · xeque!" : ""}`;
  const option = (on: boolean) =>
    `min-h-11 rounded-[10px] border px-3 font-mono text-[9px] uppercase tracking-[.08em] ${on ? "border-cyan-300 bg-[#0b2746] text-white" : "border-white/10 text-[#9db5c8]"}`;
  return (
    <section
      data-chess-game="true"
      aria-labelledby="chess-title"
      className="border-y border-white/[.07] bg-[#06111e]"
    >
      <div className="mx-auto grid max-w-[1180px] gap-7 px-4 py-9 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
        <div className="mx-auto w-full max-w-[620px]">
          <ArcadeDifficultyNotice
            game="xadrez"
            level={difficulty}
            local={mode === "local"}
          />
          <p
            role="status"
            aria-live="polite"
            className="mb-3 min-h-6 text-sm font-medium text-cyan-100"
          >
            {status}
          </p>
          <div
            data-chess-board="true"
            role="grid"
            aria-label="Tabuleiro de xadrez"
            className="grid aspect-square grid-cols-8 overflow-hidden rounded-[18px] border border-white/15 shadow-2xl"
          >
            {Array.from({ length: 8 }, (_, rank) => (
              <div
                key={rank}
                role="row"
                aria-rowindex={rank + 1}
                style={{ display: "contents" }}
              >
                {board.slice(rank * 8, rank * 8 + 8).map((piece, file) => {
                  const i = rank * 8 + file;
                  const { row, col } = { row: Math.floor(i / 8), col: i % 8 };
                  const active = selected === i,
                    target = selectedMoves.includes(i);
                  return (
                    <button
                      key={i}
                      role="gridcell"
                      tabIndex={focusedSquare === i ? 0 : -1}
                      onFocus={() => setFocusedSquare(i)}
                      onKeyDown={(event) => handleBoardKey(event, i)}
                      aria-label={
                        piece
                          ? `${squareName(i)} · ${pieceLabels[piece.type]} ${piece.color === "white" ? "branco" : "preto"}`
                          : `${squareName(i)} · vazia${target ? " · destino disponível" : ""}`
                      }
                      aria-selected={active}
                      onClick={() => click(i)}
                      className={`relative grid min-h-0 place-items-center text-[clamp(1.35rem,7vw,3rem)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${(row + col) % 2 ? "bg-[#31506a]" : "bg-[#d7e3e8]"} ${active ? "ring-4 ring-inset ring-cyan-300" : ""}`}
                    >
                      <span
                        className={
                          piece?.color === "white"
                            ? "text-white drop-shadow-[0_2px_2px_#10263a]"
                            : "text-[#07111d]"
                        }
                      >
                        {piece ? glyph[piece.color][piece.type] : ""}
                      </span>
                      {target && (
                        <span
                          aria-hidden
                          className="absolute h-3 w-3 rounded-full bg-cyan-300/80"
                        />
                      )}
                      {row === 7 && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0.5 right-1 text-[9px] font-semibold text-[#07111d]"
                        >
                          {"abcdefgh"[col]}
                        </span>
                      )}
                      {col === 0 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-1 top-0.5 text-[9px] font-semibold text-[#07111d]"
                        >
                          {8 - row}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {botError && <p role="status">{botError}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="min-h-11 rounded-xl border border-cyan-300/30 px-3 text-sm text-cyan-100" disabled={!!outcome} onClick={() => { setPaused((p) => !p); setBotError(""); }}>{paused ? "Continuar" : "Pausar"}</button>
            <button
              type="button"
              onClick={undo}
              disabled={!history.length}
              className="min-h-11 rounded-xl border border-cyan-300/30 px-3 text-sm text-cyan-100 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            >
              <Undo2 className="mr-2 inline h-4 w-4" aria-hidden="true" />
              Desfazer jogada
            </button>
            <button
              type="button"
              onClick={restart}
              className="min-h-11 rounded-xl border border-white/15 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            >
              <RotateCcw className="mr-2 inline h-4 w-4" aria-hidden="true" />
              nova partida
            </button>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-[#8fa8bd]">
            <Swords className="h-4 w-4" />
            Selecione uma peça; os destinos legais são marcados no tabuleiro.
          </p>
        </div>
        <div data-arcade-settings>
          <label className="session-options">Promoção do peão<select aria-label="Promoção do peão" value={promotion} onChange={(e) => setPromotion(e.target.value as NonNullable<ChessMove["promotion"]>)}>
            <option value="queen">Rainha</option><option value="rook">Torre</option><option value="bishop">Bispo</option><option value="knight">Cavalo</option>
          </select></label>
          <p className="font-mono text-[9px] uppercase tracking-[.15em] text-cyan-300">
            PG Arcade · xadrez
          </p>
          <h2
            id="chess-title"
            className="mt-3 font-display text-[clamp(2.3rem,10vw,4.2rem)] leading-[.92] text-white"
          >
            Xadrez.
            <br />
            Pense à frente.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#a8c4d7]">
            Xadrez rápido com xeque, xeque-mate, promoção automática, 1×1 local
            roque, en passant e cinco níveis de bot.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              data-chess-mode="bot"
              aria-pressed={mode === "bot"}
              onClick={() => {
                setMode("bot");
                restart();
              }}
              className={option(mode === "bot")}
            >
              <Bot className="mr-2 inline h-4 w-4" />
              vs PG Bot
            </button>
            <button
              data-chess-mode="local"
              aria-pressed={mode === "local"}
              onClick={() => {
                setMode("local");
                restart();
              }}
              className={option(mode === "local")}
            >
              <UsersRound className="mr-2 inline h-4 w-4" />1 × 1 local
            </button>
          </div>
          {mode === "bot" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  "easy",
                  "normal",
                  "hard",
                  "master",
                  "expert",
                ] as ChessDifficulty[]
              ).map((d) => (
                <button
                  key={d}
                  aria-pressed={difficulty === d}
                  onClick={() => {
                    setDifficulty(d);
                    restart();
                  }}
                  className={option(difficulty === d)}
                >
                  {d === "master" && <Crown className="mr-1 inline h-3 w-3" />}
                  {labels[d]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
