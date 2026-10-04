import {
  Bot,
  Crown,
  RotateCcw,
  Sparkles,
  Swords,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ArcadeDifficultyNotice from "./ArcadeDifficultyNotice";
import {
  applyCheckersMove,
  chooseCheckersBotMove,
  createCheckersBoard,
  getCheckersCoordinates,
  getCheckersLegalMoves,
  getCheckersMovesFrom,
  getCheckersWinner,
  type CheckersBoard,
  type CheckersDifficulty,
  type CheckersMove,
  type CheckersPlayer,
  type CheckersVariant,
} from "@/features/portfolio/utils/checkers";

type GameMode = "bot" | "local";
type MatchTarget = 1 | 2 | 3;

const difficultyLabel: Record<CheckersDifficulty, string> = {
  easy: "fácil",
  normal: "normal",
  hard: "difícil",
  master: "mestre",
  expert: "especialista",
};

const targetLabel: Record<MatchTarget, string> = {
  1: "única",
  2: "MD3",
  3: "MD5",
};

export default function PortfolioCheckers() {
  const [mode, setMode] = useState<GameMode>("bot");
  const [variant, setVariant] = useState<CheckersVariant>("quick");
  const [difficulty, setDifficulty] = useState<CheckersDifficulty>("normal");
  const [matchTarget, setMatchTarget] = useState<MatchTarget>(2);
  const [board, setBoard] = useState<CheckersBoard>(() =>
    createCheckersBoard("quick"),
  );
  const [turn, setTurn] = useState<CheckersPlayer>("blue");
  const [selected, setSelected] = useState<number | null>(null);
  const [botForcedFrom, setBotForcedFrom] = useState<number | null>(null);
  const [winner, setWinner] = useState<CheckersPlayer | null>(null);
  const [matchWinner, setMatchWinner] = useState<CheckersPlayer | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState({ blue: 0, red: 0 });

  const legalMoves = useMemo(
    () => getCheckersLegalMoves(board, turn),
    [board, turn],
  );
  const selectedMoves = useMemo(
    () =>
      selected === null
        ? []
        : legalMoves.filter((move) => move.from === selected),
    [legalMoves, selected],
  );

  const restart = (resetScore = false) => {
    setBoard(createCheckersBoard(variant));
    setTurn("blue");
    setSelected(null);
    setBotForcedFrom(null);
    setWinner(null);
    if (resetScore) {
      setRound(1);
      setScore({ blue: 0, red: 0 });
      setMatchWinner(null);
    }
  };

  useEffect(() => {
    restart(true);
    // Variant alone controls the initial board.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const finish = (nextWinner: CheckersPlayer) => {
    if (winner) return;
    setWinner(nextWinner);
    setSelected(null);
    setBotForcedFrom(null);
    setScore((currentScore) => {
      const nextScore = {
        ...currentScore,
        [nextWinner]: currentScore[nextWinner] + 1,
      };
      if (nextScore[nextWinner] >= matchTarget) setMatchWinner(nextWinner);
      return nextScore;
    });
  };

  const commitMove = (
    move: CheckersMove,
    player: CheckersPlayer,
    allowContinuation = true,
  ) => {
    const next = applyCheckersMove(board, move);
    setBoard(next);

    if (move.capture !== undefined && allowContinuation) {
      const continuation = getCheckersMovesFrom(next, move.to, true);
      if (continuation.length) {
        setSelected(move.to);
        return;
      }
    }

    const nextTurn: CheckersPlayer = player === "blue" ? "red" : "blue";
    const nextWinner = getCheckersWinner(next, nextTurn);
    setSelected(null);
    if (nextWinner) finish(nextWinner);
    else setTurn(nextTurn);
  };

  const handleCell = (index: number) => {
    if (winner || (mode === "bot" && turn === "red")) return;
    const piece = board[index];

    if (piece?.player === turn) {
      if (
        selected !== null &&
        selectedMoves.some((move) => move.capture !== undefined) &&
        index !== selected
      )
        return;
      setSelected(index);
      return;
    }

    if (selected === null) return;
    const move = selectedMoves.find((candidate) => candidate.to === index);
    if (move) commitMove(move, turn);
  };

  useEffect(() => {
    if (mode !== "bot" || turn !== "red" || winner) return;

    const timer = window.setTimeout(
      () => {
        const move = chooseCheckersBotMove(
          board,
          "red",
          difficulty,
          Math.random,
          botForcedFrom ?? undefined,
        );

        if (!move) {
          setBotForcedFrom(null);
          if (botForcedFrom !== null) {
            const nextWinner = getCheckersWinner(board, "blue");
            if (nextWinner) finish(nextWinner);
            else setTurn("blue");
          } else {
            finish("blue");
          }
          return;
        }

        const next = applyCheckersMove(board, move);
        setBoard(next);
        setSelected(null);

        if (move.capture !== undefined) {
          const continuation = getCheckersMovesFrom(next, move.to, true);
          if (continuation.length) {
            setBotForcedFrom(move.to);
            return;
          }
        }

        setBotForcedFrom(null);
        const nextWinner = getCheckersWinner(next, "blue");
        if (nextWinner) finish(nextWinner);
        else setTurn("blue");
      },
      difficulty === "master" ? 540 : 420,
    );

    return () => window.clearTimeout(timer);
  }, [board, botForcedFrom, difficulty, mode, turn, winner]);

  const status = matchWinner
    ? matchWinner === "blue"
      ? mode === "bot"
        ? "Série encerrada: você venceu."
        : "Série encerrada: jogador 1 venceu."
      : mode === "bot"
        ? "Série encerrada: PG Bot venceu."
        : "Série encerrada: jogador 2 venceu."
    : winner
      ? winner === "blue"
        ? mode === "bot"
          ? "Você venceu a partida."
          : "Jogador 1 venceu a partida."
        : mode === "bot"
          ? "PG Bot venceu a partida."
          : "Jogador 2 venceu a partida."
      : mode === "bot" && turn === "red"
        ? botForcedFrom !== null
          ? "PG Bot continua a sequência de captura."
          : "PG Bot está calculando."
        : turn === "blue"
          ? mode === "bot"
            ? "Sua vez · peças azuis."
            : "Vez do jogador 1 · azul."
          : "Vez do jogador 2 · vermelho.";

  const optionClass = (active: boolean) =>
    `inline-flex min-h-11 items-center justify-center rounded-[10px] border px-3 font-mono text-[8px] font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5f3fc] ${active ? "border-[#67e8f9] bg-[#0b2746] text-white" : "border-white/10 text-[#91adbf] hover:border-[#67e8f9]/60 hover:text-white"}`;

  return (
    <section
      data-checkers-game="true"
      aria-labelledby="checkers-title"
      className="border-y border-white/[0.07] bg-[#06111e]"
    >
      <div className="mx-auto grid max-w-[1180px] gap-7 px-4 py-9 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12 lg:py-14">
        <div
          data-arcade-arena
          className="min-w-0 rounded-[18px] border border-white/10 bg-[#071827]/85 p-4 sm:p-5"
        >
          <ArcadeDifficultyNotice
            game="damas"
            level={difficulty}
            local={mode === "local"}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              data-checkers-status="true"
              role="status"
              aria-live="polite"
              className="font-mono text-[9px] uppercase tracking-[0.09em] text-[#d9fbff]"
            >
              {status}
            </p>
            <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-[#7191a8]">
              rodada {round} · meta {matchTarget} ·{" "}
              {legalMoves.some((move) => move.capture !== undefined)
                ? "captura obrigatória"
                : "movimento diagonal"}
            </span>
          </div>

          <div
            data-checkers-board="true"
            role="grid"
            aria-label="Tabuleiro de damas"
            className="mx-auto mt-4 grid aspect-square w-full max-w-[560px] grid-cols-8 overflow-hidden rounded-[12px] border border-white/10 bg-[#09121c]"
          >
            {board.map((piece, index) => {
              const { row, col } = getCheckersCoordinates(index);
              const dark = (row + col) % 2 === 1;
              const legalDestination = selectedMoves.some(
                (move) => move.to === index,
              );
              const active = selected === index;
              return (
                <button
                  key={index}
                  type="button"
                  role="gridcell"
                  aria-selected={active}
                  data-checkers-cell="true"
                  data-legal-destination={legalDestination ? "true" : "false"}
                  aria-label={
                    piece
                      ? `${piece.player === "blue" ? "Peça azul" : "Peça vermelha"}${piece.king ? " dama" : ""}, linha ${row + 1}, coluna ${col + 1}`
                      : `Casa vazia, linha ${row + 1}, coluna ${col + 1}`
                  }
                  onClick={() => handleCell(index)}
                  className={`relative grid aspect-square place-items-center focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a5f3fc] ${dark ? "bg-[#10283a]" : "bg-[#d7e2e8]/90"} ${legalDestination ? "after:absolute after:h-3 after:w-3 after:rounded-full after:bg-[#67e8f9]/75" : ""} ${active ? "ring-2 ring-inset ring-[#67e8f9]" : ""}`}
                >
                  {piece && (
                    <span
                      className={`relative z-[1] grid h-[68%] w-[68%] place-items-center rounded-full border-2 shadow-[0_5px_12px_rgba(0,0,0,0.35)] ${piece.player === "blue" ? "border-[#a5f3fc] bg-[#1679a8]" : "border-[#fecaca] bg-[#b83e4b]"}`}
                    >
                      {piece.king && (
                        <Crown
                          className="h-[45%] w-[45%] text-white"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="font-body text-xs leading-5 text-[#8fa8c7]">
              Toque em uma peça e depois em uma casa marcada. Capturas
              encadeadas mantêm a mesma peça ativa até a sequência terminar.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => restart(false)}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[10px] border border-white/15 px-4 font-mono text-[9px] uppercase tracking-[0.08em] text-white"
              >
                <RotateCcw className="h-4 w-4" />
                reiniciar
              </button>
              {winner && !matchWinner && (
                <button
                  type="button"
                  onClick={() => {
                    setRound((value) => value + 1);
                    restart(false);
                  }}
                  className="min-h-11 rounded-[10px] bg-[#38bdf8] px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[#02111f]"
                >
                  próxima rodada
                </button>
              )}
              {matchWinner && (
                <button
                  type="button"
                  onClick={() => restart(true)}
                  className="min-h-11 rounded-[10px] bg-[#38bdf8] px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[#02111f]"
                >
                  nova série
                </button>
              )}
            </div>
          </div>
        </div>
        <div data-arcade-settings>
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[#67e8f9]">
            PG Arcade · damas
          </p>
          <h2
            id="checkers-title"
            className="mt-3 font-display text-[clamp(2.3rem,10vw,4.2rem)] font-medium leading-[0.92] tracking-[-0.055em] text-white"
          >
            Damas.
            <br />
            Ataque e leitura.
          </h2>
          <p className="mt-4 max-w-xl font-body text-sm leading-6 text-[#a8c4d7]">
            Versão rápida ou clássica, cinco níveis do PG Bot, séries MD3/MD5 e
            modo 1 × 1 local. Capturas são obrigatórias, sequências múltiplas
            são respeitadas e peças promovem ao chegar à última linha.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
                modo
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  data-checkers-mode="bot"
                  type="button"
                  aria-pressed={mode === "bot"}
                  onClick={() => {
                    setMode("bot");
                    restart(true);
                  }}
                  className={optionClass(mode === "bot")}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  contra bot
                </button>
                <button
                  data-checkers-mode="local"
                  type="button"
                  aria-pressed={mode === "local"}
                  onClick={() => {
                    setMode("local");
                    restart(true);
                  }}
                  className={optionClass(mode === "local")}
                >
                  <UsersRound className="mr-2 h-4 w-4" />1 × 1 local
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
                tabuleiro
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={variant === "quick"}
                  onClick={() => setVariant("quick")}
                  className={optionClass(variant === "quick")}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  rápida · 8 peças
                </button>
                <button
                  type="button"
                  aria-pressed={variant === "classic"}
                  onClick={() => setVariant("classic")}
                  className={optionClass(variant === "classic")}
                >
                  <Swords className="mr-2 h-4 w-4" />
                  clássica · 12 peças
                </button>
              </div>
            </div>

            {mode === "bot" && (
              <div>
                <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
                  dificuldade
                </p>
                <div className="grid grid-cols-2 gap-2 min-[430px]:grid-cols-4">
                  {(
                    ["easy", "normal", "hard", "master", "expert"] as const
                  ).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={difficulty === value}
                      onClick={() => {
                        setDifficulty(value);
                        restart(true);
                      }}
                      className={optionClass(difficulty === value)}
                    >
                      {difficultyLabel[value]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
                série
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 3] as MatchTarget[]).map((target) => (
                  <button
                    key={target}
                    data-checkers-series={targetLabel[target]}
                    type="button"
                    aria-pressed={matchTarget === target}
                    onClick={() => {
                      setMatchTarget(target);
                      restart(true);
                    }}
                    className={optionClass(matchTarget === target)}
                  >
                    {targetLabel[target]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            data-checkers-score="true"
            className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-white/10"
          >
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[7px] uppercase text-[#7191a8]">
                {mode === "bot" ? "você" : "jogador 1"}
              </p>
              <p className="mt-1 font-display text-2xl text-[#67e8f9]">
                {score.blue}
              </p>
            </div>
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[7px] uppercase text-[#7191a8]">
                {mode === "bot" ? "PG Bot" : "jogador 2"}
              </p>
              <p className="mt-1 font-display text-2xl text-[#f7a8a8]">
                {score.red}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
