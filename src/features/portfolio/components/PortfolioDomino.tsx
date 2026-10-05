import {
  ArrowLeft,
  ArrowRight,
  Bot,
  RotateCcw,
  Sparkles,
  Swords,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ArcadeDifficultyNotice from "./ArcadeDifficultyNotice";
import {
  chooseDominoBotMove,
  dealDominoRound,
  getDominoPipTotal,
  getDominoWinnerPoints,
  drawDominoUntilPlayable,
  sortDominoHand,
  getPlayableDominoSides,
  hasPlayableDominoTile,
  placeDominoTile,
  type DominoDifficulty,
  type DominoSide,
  type DominoTile,
} from "@/features/portfolio/utils/domino";

type GameMode = "bot" | "local";
type DominoVariant = "quick" | "classic";
type DominoRules = "draw" | "block";
type MatchTarget = 1 | 2 | 3;
type Turn = "player" | "opponent";
type Winner = Turn | "draw" | null;
type PendingMove = { owner: Turn; index: number; sides: DominoSide[] } | null;

const difficultyLabel: Record<DominoDifficulty, string> = {
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

const tileColors = [
  "#cbd5e1",
  "#fda4af",
  "#fdba74",
  "#fde047",
  "#6ee7b7",
  "#7dd3fc",
  "#c4b5fd",
];
function TileFace({ tile }: { tile: DominoTile }) {
  return (
    <span data-domino-face="true" className="inline-grid min-w-14 grid-cols-[1fr_auto_1fr] items-center gap-1 rounded-[9px] border border-white/15 bg-[#0a1b2b] px-2 py-2 font-display text-base text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
      <span
        className="rounded px-1.5 py-1"
        style={{
          color: tileColors[tile[0]],
          backgroundColor: `${tileColors[tile[0]]}20`,
        }}
      >
        {tile[0]}
      </span>
      <span className="h-5 w-px bg-white/20" aria-hidden="true" />
      <span
        className="rounded px-1.5 py-1"
        style={{
          color: tileColors[tile[1]],
          backgroundColor: `${tileColors[tile[1]]}20`,
        }}
      >
        {tile[1]}
      </span>
    </span>
  );
}

export default function PortfolioDomino() {
  const [mode, setMode] = useState<GameMode>("bot");
  const [variant, setVariant] = useState<DominoVariant>("quick");
  const [rules, setRules] = useState<DominoRules>("draw");
  const [difficulty, setDifficulty] = useState<DominoDifficulty>("normal");
  const [matchTarget, setMatchTarget] = useState<MatchTarget>(2);
  const [playerHand, setPlayerHand] = useState<DominoTile[]>([]);
  const [opponentHand, setOpponentHand] = useState<DominoTile[]>([]);
  const [boneyard, setBoneyard] = useState<DominoTile[]>([]);
  const [chain, setChain] = useState<DominoTile[]>([]);
  const [turn, setTurn] = useState<Turn>("player");
  const [winner, setWinner] = useState<Winner>(null);
  const [matchWinner, setMatchWinner] = useState<Turn | null>(null);
  const [passes, setPasses] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState({ player: 0, opponent: 0, draws: 0 });
  const [points, setPoints] = useState({ player: 0, opponent: 0 });
  const [lastMove, setLastMove] = useState(
    "Escolha uma pedra para abrir a mesa.",
  );
  const [handoffPending, setHandoffPending] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingMove>(null);

  const handSize = variant === "quick" ? 5 : 7;
  const currentHand = turn === "player" ? playerHand : opponentHand;
  const canPlay = hasPlayableDominoTile(currentHand, chain);
  const canDraw =
    !winner &&
    !handoffPending &&
    rules === "draw" &&
    !canPlay &&
    boneyard.length > 0;
  const canPass =
    !winner &&
    !handoffPending &&
    !canPlay &&
    (rules === "block" || boneyard.length === 0);

  const restartRound = (resetScore = false) => {
    const dealt = dealDominoRound(handSize);
    setPlayerHand(dealt.player);
    setOpponentHand(dealt.opponent);
    setBoneyard(dealt.boneyard);
    setChain([]);
    setTurn("player");
    setWinner(null);
    setPasses(0);
    setHandoffPending(false);
    setPendingMove(null);
    if (resetScore) {
      setRound(1);
      setScore({ player: 0, opponent: 0, draws: 0 });
      setPoints({ player: 0, opponent: 0 });
      setLastMove("Escolha uma pedra para abrir a mesa.");
      setMatchWinner(null);
    }
  };

  useEffect(() => {
    restartRound(true);
    // Variant alone controls the number of tiles in the opening hand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const finishRound = (nextWinner: Winner) => {
    if (!nextWinner || winner) return;
    setWinner(nextWinner);
    setPendingMove(null);
    setHandoffPending(false);

    setScore((currentScore) => {
      const nextScore = {
        player: currentScore.player + (nextWinner === "player" ? 1 : 0),
        opponent: currentScore.opponent + (nextWinner === "opponent" ? 1 : 0),
        draws: currentScore.draws + (nextWinner === "draw" ? 1 : 0),
      };

      if (nextWinner !== "draw" && nextScore[nextWinner] >= matchTarget) {
        setMatchWinner(nextWinner);
      }

      return nextScore;
    });
  };

  const resolveBlockedRound = (
    nextPlayerHand: DominoTile[],
    nextOpponentHand: DominoTile[],
  ) => {
    const playerPips = getDominoPipTotal(nextPlayerHand);
    const opponentPips = getDominoPipTotal(nextOpponentHand);
    finishRound(
      playerPips === opponentPips
        ? "draw"
        : playerPips < opponentPips
          ? "player"
          : "opponent",
    );
  };

  const commitTile = (owner: Turn, index: number, side: DominoSide) => {
    if (winner || owner !== turn) return;
    const hand = owner === "player" ? playerHand : opponentHand;
    const tile = hand[index];
    if (!tile || !getPlayableDominoSides(tile, chain).includes(side)) return;

    const nextChain = placeDominoTile(chain, tile, side);
    const nextHand = hand.filter((_, handIndex) => handIndex !== index);
    const nextTurn: Turn = owner === "player" ? "opponent" : "player";

    setChain(nextChain);
    setPasses(0);
    setPendingMove(null);

    if (owner === "player") setPlayerHand(nextHand);
    else setOpponentHand(nextHand);

    if (!nextHand.length) {
      const nextPlayerHand = owner === "player" ? nextHand : playerHand;
      const nextOpponentHand = owner === "opponent" ? nextHand : opponentHand;
      const wonPoints = getDominoWinnerPoints(
        owner,
        nextPlayerHand,
        nextOpponentHand,
      );
      setPoints((current) => ({
        ...current,
        [owner]: current[owner] + wonPoints,
      }));
      finishRound(owner);
      return;
    }

    setTurn(nextTurn);
    if (mode === "local") setHandoffPending(true);
  };

  const playTile = (owner: Turn, index: number) => {
    if (winner || owner !== turn || handoffPending) return;
    const hand = owner === "player" ? playerHand : opponentHand;
    const tile = hand[index];
    if (!tile) return;

    const sides = getPlayableDominoSides(tile, chain);
    if (!sides.length) return;

    if (chain.length > 0 && sides.length > 1) {
      setPendingMove({ owner, index, sides });
      return;
    }

    commitTile(owner, index, sides.includes("right") ? "right" : sides[0]);
  };

  const drawTile = () => {
    if (!canDraw || !boneyard.length) return;
    const result = drawDominoUntilPlayable(currentHand, chain, boneyard);
    setBoneyard(result.boneyard);
    if (turn === "player") setPlayerHand(result.hand);
    else setOpponentHand(result.hand);
    setLastMove(
      `${turn === "player" ? (mode === "bot" ? "Você" : "Jogador 1") : "Jogador 2"} comprou ${result.drawn} pedra${result.drawn === 1 ? "" : "s"}.`,
    );
  };

  const passTurn = () => {
    if (!canPass) return;
    if (passes >= 1) {
      resolveBlockedRound(playerHand, opponentHand);
      return;
    }

    const nextTurn: Turn = turn === "player" ? "opponent" : "player";
    setLastMove(
      `${turn === "player" ? (mode === "bot" ? "Você" : "Jogador 1") : mode === "bot" ? "PG Bot" : "Jogador 2"} passou a vez.`,
    );
    setPasses((value) => value + 1);
    setTurn(nextTurn);
    setPendingMove(null);
    if (mode === "local") setHandoffPending(true);
  };

  useEffect(() => {
    if (mode !== "bot" || turn !== "opponent" || winner) return;

    const timer = window.setTimeout(
      () => {
        let nextHand = [...opponentHand];
        let nextYard = [...boneyard];
        let move = chooseDominoBotMove(nextHand, chain, difficulty);

        if (rules === "draw") {
          while (!move && nextYard.length) {
            nextHand.push(nextYard.shift()!);
            move = chooseDominoBotMove(nextHand, chain, difficulty);
          }
        }

        setBoneyard(nextYard);

        if (!move) {
          setOpponentHand(nextHand);
          if (passes >= 1) resolveBlockedRound(playerHand, nextHand);
          else {
            setPasses((value) => value + 1);
            setTurn("player");
          }
          return;
        }

        const tile = nextHand[move.index];
        const nextChain = placeDominoTile(chain, tile, move.side);
        nextHand.splice(move.index, 1);
        setOpponentHand(nextHand);
        setChain(nextChain);
        setPasses(0);

        if (!nextHand.length) {
          setPoints((current) => ({
            ...current,
            opponent:
              current.opponent +
              getDominoWinnerPoints("opponent", playerHand, nextHand),
          }));
          finishRound("opponent");
        } else setTurn("player");
      },
      difficulty === "master" ? 520 : 360,
    );

    return () => window.clearTimeout(timer);
  }, [
    boneyard,
    chain,
    difficulty,
    mode,
    opponentHand,
    passes,
    playerHand,
    rules,
    turn,
    winner,
  ]);

  const settingsSummary = `${variant === "quick" ? "rápida" : "clássica"} · ${rules === "draw" ? "comprar" : "bloqueio"} · ${mode === "bot" ? difficultyLabel[difficulty] : "1 × 1 local"} · ${targetLabel[matchTarget]}`;

  const status = useMemo(() => {
    if (matchWinner === "player")
      return mode === "bot"
        ? "Série encerrada: você venceu."
        : "Série encerrada: jogador 1 venceu.";
    if (matchWinner === "opponent")
      return mode === "bot"
        ? "Série encerrada: PG Bot venceu."
        : "Série encerrada: jogador 2 venceu.";
    if (winner === "draw") return "Rodada bloqueada: empate por pontos.";
    if (winner === "player")
      return mode === "bot"
        ? "Você venceu a rodada."
        : "Jogador 1 venceu a rodada.";
    if (winner === "opponent")
      return mode === "bot"
        ? "PG Bot venceu a rodada."
        : "Jogador 2 venceu a rodada.";
    if (handoffPending && mode === "local")
      return turn === "player"
        ? "Passe o aparelho ao jogador 1."
        : "Passe o aparelho ao jogador 2.";
    if (mode === "bot" && turn === "opponent")
      return "PG Bot está calculando a jogada.";
    return turn === "player"
      ? mode === "bot"
        ? "Sua vez."
        : "Vez do jogador 1."
      : "Vez do jogador 2.";
  }, [handoffPending, matchWinner, mode, turn, winner]);

  const optionClass = (active: boolean) =>
    `inline-flex min-h-11 items-center justify-center rounded-[10px] border px-3 font-body text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5f3fc] ${active ? "border-[#67e8f9] bg-[#0b2746] text-white" : "border-white/10 text-[#91adbf] hover:border-[#67e8f9]/60 hover:text-white"}`;

  return (
    <section
      data-domino-game="true"
      aria-labelledby="domino-title"
      className="border-y border-white/[0.07] bg-[#06111e]"
    >
      <div className="mx-auto grid max-w-[1180px] gap-7 px-4 py-5 sm:px-8 lg:grid-cols-[0.76fr_1.24fr] lg:px-12 lg:py-14">
        <div
          data-arcade-arena
          className="min-w-0 rounded-[18px] border border-white/10 bg-[#071827]/85 p-4 sm:p-5"
        >
          <ArcadeDifficultyNotice
            game="domino"
            level={difficulty}
            local={mode === "local"}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              data-domino-status="true"
              role="status"
              aria-live="polite"
              className="font-body text-xs uppercase tracking-[0.09em] text-[#d9fbff]"
            >
              {status}
            </p>
            <p className="font-body text-xs uppercase tracking-[0.08em] text-[#7191a8]">
              rodada {round} · meta {matchTarget} vitória
              {matchTarget > 1 ? "s" : ""} · monte {boneyard.length}
            </p>
          </div>

          <div
            data-domino-color-legend
            className="mt-4 flex flex-wrap gap-3 text-xs text-slate-200"
            aria-label="Cores dos valores"
          >
            <span>Combine cores e números:</span>
            {tileColors.map((color, value) => (
              <span key={value} className="flex items-center gap-1">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {value}
              </span>
            ))}
          </div>
          <div
            data-domino-chain="true"
            aria-label="Mesa de dominó"
            className="mt-3 flex min-h-32 snap-x items-center gap-2 overflow-x-auto rounded-[16px] border border-white/10 bg-[radial-gradient(circle_at_center,_#0b2940,_#04101b_68%)] p-4 shadow-inner"
          >
            {chain.length ? (
              chain.map((tile, index) => (
                <span
                  className="snap-center"
                  key={`${tile.join("-")}-${index}`}
                >
                  <TileFace tile={tile} />
                </span>
              ))
            ) : (
              <p className="mx-auto font-body text-xs uppercase tracking-[0.1em] text-[#628097]">
                a primeira pedra abre as duas pontas
              </p>
            )}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-body text-xs uppercase tracking-[0.1em] text-[#7191a8]">
                {turn === "player"
                  ? mode === "bot"
                    ? "sua mão"
                    : "mão do jogador 1"
                  : mode === "bot"
                    ? "mão do PG Bot"
                    : "mão do jogador 2"}
              </p>
              <span className="font-body text-xs text-[#7191a8]">
                {currentHand.length} pedras
              </span>
            </div>

            {handoffPending && mode === "local" ? (
              <div
                data-domino-handoff="true"
                className="rounded-[12px] border border-[#67e8f9]/25 bg-[#071326] p-5 text-center"
              >
                <p className="font-body text-sm text-[#a8c4d7]">
                  A mão fica oculta durante a troca para não revelar as pedras
                  ao adversário.
                </p>
                <button
                  type="button"
                  onClick={() => setHandoffPending(false)}
                  className="mt-4 min-h-11 rounded-[10px] bg-[#38bdf8] px-4 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#02111f]"
                >
                  {turn === "player"
                    ? "jogador 1 · revelar mão"
                    : "jogador 2 · revelar mão"}
                </button>
              </div>
            ) : (
              <div data-domino-hand="true" className="flex flex-wrap gap-2">
                {sortDominoHand(currentHand, chain).map((tile) => {
                  const index = currentHand.indexOf(tile);
                  const playable =
                    !winner && getPlayableDominoSides(tile, chain).length > 0;
                  const hidden = mode === "bot" && turn === "opponent";
                  return (
                    <button
                      key={`${tile.join("-")}-${index}`}
                      type="button"
                      data-domino-tile="true"
                      disabled={!playable || hidden}
                      aria-label={
                        hidden
                          ? "Pedra oculta do PG Bot"
                          : `Pedra ${tile[0]} por ${tile[1]}`
                      }
                      onClick={() => playTile(turn, index)}
                      className={`min-h-12 rounded-[10px] transition ${playable && !hidden ? "scale-[1.02] ring-1 ring-cyan-300/50 hover:-translate-y-1" : ""} disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5f3fc]`}
                    >
                      {hidden ? (
                        <span className="grid h-12 min-w-14 place-items-center rounded-[9px] border border-white/10 bg-[#0b2236] font-mono text-xs text-[#628097]">
                          PG
                        </span>
                      ) : (
                        <TileFace tile={tile} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {pendingMove && !winner && (
            <div
              data-domino-side-picker="true"
              className="mt-4 rounded-[12px] border border-[#67e8f9]/20 bg-[#061421] p-3"
            >
              <p className="font-body text-xs uppercase tracking-[0.1em] text-[#9fc6d8]">
                essa pedra encaixa dos dois lados · escolha
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    commitTile(pendingMove.owner, pendingMove.index, "left")
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-white/15 text-sm text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  esquerda
                </button>
                <button
                  type="button"
                  onClick={() =>
                    commitTile(pendingMove.owner, pendingMove.index, "right")
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-white/15 text-sm text-white"
                >
                  direita
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {!winner && !handoffPending && !pendingMove && !canPlay && (
            <div className="mt-5 flex flex-wrap gap-2">
              {canDraw ? (
                <button
                  type="button"
                  onClick={drawTile}
                  className="min-h-11 rounded-[10px] bg-[#38bdf8] px-4 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#02111f]"
                >
                  comprar pedra
                </button>
              ) : canPass && (mode === "local" || turn === "player") ? (
                <button
                  type="button"
                  onClick={passTurn}
                  className="min-h-11 rounded-[10px] border border-white/15 px-4 font-body text-xs uppercase tracking-[0.08em] text-white"
                >
                  passar vez
                </button>
              ) : null}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => restartRound(false)}
              className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-white/15 px-4 font-body text-xs uppercase tracking-[0.08em] text-white"
            >
              <RotateCcw className="h-4 w-4" />
              reiniciar rodada
            </button>
            {winner && !matchWinner && (
              <button
                type="button"
                onClick={() => {
                  setRound((value) => value + 1);
                  restartRound(false);
                }}
                className="min-h-11 rounded-[10px] bg-[#38bdf8] px-4 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#02111f]"
              >
                próxima rodada
              </button>
            )}
            {matchWinner && (
              <button
                type="button"
                onClick={() => restartRound(true)}
                className="min-h-11 rounded-[10px] bg-[#38bdf8] px-4 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#02111f]"
              >
                nova série
              </button>
            )}
          </div>
        </div>
        <div data-arcade-settings>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-[#67e8f9]">
            PG Arcade · dominó
          </p>
          <h2
            id="domino-title"
            className="mt-3 font-display text-[clamp(2rem,8vw,3.5rem)] font-medium leading-[0.92] tracking-[-0.04em] text-white"
          >
            Dominó.
            <br />
            Conecte as cores.
          </h2>
          <p className="mt-4 max-w-xl font-body text-sm leading-6 text-[#a8c4d7]">
            Partida rápida ou clássica, regras de compra ou bloqueio, cinco
            níveis do PG Bot, séries MD3/MD5 e 1 × 1 local com troca de mão
            protegida.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 font-body text-xs uppercase tracking-[0.12em] text-[#7191a8]">
                modo
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  data-domino-mode="bot"
                  type="button"
                  aria-pressed={mode === "bot"}
                  onClick={() => {
                    setMode("bot");
                    restartRound(true);
                  }}
                  className={optionClass(mode === "bot")}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  contra bot
                </button>
                <button
                  data-domino-mode="local"
                  type="button"
                  aria-pressed={mode === "local"}
                  onClick={() => {
                    setMode("local");
                    restartRound(true);
                  }}
                  className={optionClass(mode === "local")}
                >
                  <UsersRound className="mr-2 h-4 w-4" />1 × 1 local
                </button>
              </div>
            </div>

            <details
              data-domino-settings
              className="rounded-xl border border-white/10 p-3"
            >
              <summary
                data-arcade-settings-control="domino"
                className="min-h-11 cursor-pointer py-3 text-sm text-[#d8e7f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              >
                <span className="flex flex-col gap-1 pr-4">
                  <span>Ajustar regras, dificuldade e série</span>
                  <span
                    data-domino-settings-summary="true"
                    className="font-body text-[11px] uppercase tracking-[0.08em] text-[#7191a8]"
                  >
                    {settingsSummary}
                  </span>
                </span>
              </summary>
              <div className="space-y-4 pt-3">
                <div>
                  <p className="mb-2 font-body text-xs uppercase tracking-[0.12em] text-[#7191a8]">
                    partida
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-pressed={variant === "quick"}
                      onClick={() => setVariant("quick")}
                      className={optionClass(variant === "quick")}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      rápida · 5 pedras
                    </button>
                    <button
                      type="button"
                      aria-pressed={variant === "classic"}
                      onClick={() => setVariant("classic")}
                      className={optionClass(variant === "classic")}
                    >
                      <Swords className="mr-2 h-4 w-4" />
                      clássica · 7 pedras
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 font-body text-xs uppercase tracking-[0.12em] text-[#7191a8]">
                    regra
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      data-domino-rules="draw"
                      type="button"
                      aria-pressed={rules === "draw"}
                      onClick={() => {
                        setRules("draw");
                        restartRound(true);
                      }}
                      className={optionClass(rules === "draw")}
                    >
                      comprar até jogar
                    </button>
                    <button
                      data-domino-rules="block"
                      type="button"
                      aria-pressed={rules === "block"}
                      onClick={() => {
                        setRules("block");
                        restartRound(true);
                      }}
                      className={optionClass(rules === "block")}
                    >
                      bloqueio sem compra
                    </button>
                  </div>
                </div>

                {mode === "bot" && (
                  <div>
                    <p className="mb-2 font-body text-xs uppercase tracking-[0.12em] text-[#7191a8]">
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
                            restartRound(true);
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
                  <p className="mb-2 font-body text-xs uppercase tracking-[0.12em] text-[#7191a8]">
                    série
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as MatchTarget[]).map((target) => (
                      <button
                        key={target}
                        data-domino-series={targetLabel[target]}
                        type="button"
                        aria-pressed={matchTarget === target}
                        onClick={() => {
                          setMatchTarget(target);
                          restartRound(true);
                        }}
                        className={optionClass(matchTarget === target)}
                      >
                        {targetLabel[target]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          </div>
          <div
            data-domino-score="true"
            className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-[12px] bg-white/10"
          >
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-body text-[11px] uppercase text-[#7191a8]">
                {mode === "bot" ? "você" : "jogador 1"}
              </p>
              <p className="mt-1 font-display text-2xl text-[#67e8f9]">
                {score.player}
              </p>
            </div>
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-body text-[11px] uppercase text-[#7191a8]">
                {mode === "bot" ? "bot" : "jogador 2"}
              </p>
              <p className="mt-1 font-display text-2xl text-white">
                {score.opponent}
              </p>
            </div>
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-body text-[11px] uppercase text-[#7191a8]">
                empates
              </p>
              <p className="mt-1 font-display text-2xl text-[#b8cce0]">
                {score.draws}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
