import {
  Award,
  Bot,
  Flame,
  Gauge,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Trophy,
  UsersRound,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ArcadeDifficultyNotice from "./ArcadeDifficultyNotice";
import { trackPortfolioEvent } from "@/features/portfolio/utils/portfolioAnalytics";
import {
  chooseTicTacToeBotMoveByDifficulty,
  emptyTicTacToeLifetimeStats,
  getTicTacToeAchievements,
  getTicTacToeHintMove,
  getTicTacToePresetConfig,
  getTicTacToeWinner,
  getTicTacToeWinningLine,
  getTicTacToeStreakGoal,
  getTicTacToeStreakProgress,
  getTicTacToeWinRate,
  normalizeTicTacToeLifetimeStats,
  updateTicTacToeLifetimeStats,
  type TicTacToeBoard,
  type TicTacToeDifficulty,
  type TicTacToeLifetimeStats,
  type TicTacToeMark,
  type TicTacToePreset,
} from "@/features/portfolio/utils/ticTacToe";

const emptyBoard = (): TicTacToeBoard => Array.from({ length: 9 }, () => null);
const arcadeStatsStorageKey = "pablo-pg-arcade-stats";
type GameResult = "player" | "bot" | "draw" | null;
type GameMode = "bot" | "local";
type SeriesLength = 1 | 3 | 5;

function giveMobileFeedback(pattern: number | number[] = 20) {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof navigator.vibrate === "function") navigator.vibrate(pattern);
}

function readLifetimeStats(): TicTacToeLifetimeStats {
  if (typeof window === "undefined") return emptyTicTacToeLifetimeStats;
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(arcadeStatsStorageKey) || "{}",
    );
    return normalizeTicTacToeLifetimeStats(
      parsed && typeof parsed === "object" ? parsed : null,
    );
  } catch {
    return emptyTicTacToeLifetimeStats;
  }
}

const achievementCopy = {
  "primeira-vitoria": { label: "primeira vitória", icon: Trophy },
  trinca: { label: "sequência x3", icon: Flame },
  invicto: { label: "5 jogos invicto", icon: Award },
  "sem-ajuda": { label: "vitória sem dica", icon: Zap },
  estrategista: { label: "3 partidas com dica", icon: Lightbulb },
} as const;

export default function PortfolioTicTacToe() {
  const [board, setBoard] = useState<TicTacToeBoard>(emptyBoard);
  const [result, setResult] = useState<GameResult>(null);
  const [mode, setMode] = useState<GameMode>("bot");
  const [difficulty, setDifficulty] = useState<TicTacToeDifficulty>("normal");
  const [playerMark, setPlayerMark] = useState<TicTacToeMark>("X");
  const [turn, setTurn] = useState<TicTacToeMark>("X");
  const [seriesLength, setSeriesLength] = useState<SeriesLength>(1);
  const [score, setScore] = useState({ player: 0, opponent: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const [started, setStarted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<TicTacToePreset | null>(
    "quick",
  );
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [usedHintThisRound, setUsedHintThisRound] = useState(false);
  const [lastResult, setLastResult] = useState<Exclude<
    GameResult,
    null
  > | null>(null);
  const [lifetimeStats, setLifetimeStats] =
    useState<TicTacToeLifetimeStats>(readLifetimeStats);

  const opponentMark: TicTacToeMark = playerMark === "X" ? "O" : "X";
  const winsNeeded = Math.ceil(seriesLength / 2);
  const winningLine = useMemo(() => getTicTacToeWinningLine(board), [board]);
  const achievements = useMemo(
    () => getTicTacToeAchievements(lifetimeStats),
    [lifetimeStats],
  );
  const winRate = useMemo(
    () => getTicTacToeWinRate(lifetimeStats),
    [lifetimeStats],
  );
  const nextStreakGoal = useMemo(
    () => getTicTacToeStreakGoal(lifetimeStats.bestWinStreak),
    [lifetimeStats.bestWinStreak],
  );
  const streakProgress = useMemo(
    () =>
      getTicTacToeStreakProgress(
        lifetimeStats.currentWinStreak,
        nextStreakGoal,
      ),
    [lifetimeStats.currentWinStreak, nextStreakGoal],
  );
  const matchWinner =
    score.player >= winsNeeded
      ? "player"
      : score.opponent >= winsNeeded
        ? "opponent"
        : null;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        arcadeStatsStorageKey,
        JSON.stringify(lifetimeStats),
      );
    } catch {
      // A partida continua funcionando mesmo sem armazenamento local.
    }
  }, [lifetimeStats]);

  useEffect(() => {
    if (
      mode !== "bot" ||
      playerMark !== "O" ||
      started ||
      result ||
      matchWinner ||
      board.some(Boolean)
    )
      return;
    const botMove = chooseTicTacToeBotMoveByDifficulty(
      board,
      difficulty,
      Math.random,
      "X",
    );
    if (botMove < 0) return;
    const next = [...board];
    next[botMove] = "X";
    setBoard(next);
    setTurn("O");
  }, [board, difficulty, matchWinner, mode, playerMark, result, started]);

  const status =
    matchWinner === "player"
      ? mode === "bot"
        ? "Série vencida. Você superou o PG Bot."
        : "Jogador 1 venceu a série."
      : matchWinner === "opponent"
        ? mode === "bot"
          ? "PG Bot venceu a série. Hora da revanche."
          : "Jogador 2 venceu a série."
        : result === "player"
          ? mode === "bot"
            ? "Você venceu esta rodada."
            : "Jogador 1 venceu esta rodada."
          : result === "bot"
            ? mode === "bot"
              ? "PG Bot fechou a rodada."
              : "Jogador 2 venceu esta rodada."
            : result === "draw"
              ? "Empate. A série continua."
              : mode === "local"
                ? `Vez do jogador ${turn === "X" ? (playerMark === "X" ? "1" : "2") : playerMark === "O" ? "1" : "2"} · ${turn}`
                : `Sua vez · você joga com ${playerMark}`;

  function recordRound(nextResult: Exclude<GameResult, null>) {
    setLastResult(nextResult);
    setResult(nextResult);
    if (nextResult === "player") giveMobileFeedback([25, 35, 45]);
    setScore((current) => ({
      player: current.player + (nextResult === "player" ? 1 : 0),
      opponent: current.opponent + (nextResult === "bot" ? 1 : 0),
      draws: current.draws + (nextResult === "draw" ? 1 : 0),
    }));
    if (mode === "bot") {
      setLifetimeStats((current) =>
        updateTicTacToeLifetimeStats(current, nextResult, {
          usedHint: usedHintThisRound,
          perfectWin: nextResult === "player" && !usedHintThisRound,
        }),
      );
    }
    trackPortfolioEvent("tic_tac_toe_completed", { gameResult: nextResult });
  }

  function resolveBoard(next: TicTacToeBoard, mark: TicTacToeMark) {
    const winner = getTicTacToeWinner(next);
    if (winner) {
      recordRound(winner === playerMark ? "player" : "bot");
      return true;
    }
    if (next.every(Boolean)) {
      recordRound("draw");
      return true;
    }
    setTurn(mark === "X" ? "O" : "X");
    return false;
  }

  function play(index: number) {
    if (board[index] || result || matchWinner) return;
    giveMobileFeedback(12);
    setHintIndex(null);
    if (!started) {
      setStarted(true);
      trackPortfolioEvent("tic_tac_toe_started");
    }

    if (mode === "local") {
      const next = [...board];
      next[index] = turn;
      setBoard(next);
      resolveBoard(next, turn);
      return;
    }

    const next = [...board];
    next[index] = playerMark;
    if (resolveBoard(next, playerMark)) {
      setBoard(next);
      return;
    }

    const botMove = chooseTicTacToeBotMoveByDifficulty(
      next,
      difficulty,
      Math.random,
      opponentMark,
    );
    if (botMove >= 0) next[botMove] = opponentMark;
    setBoard(next);

    const winner = getTicTacToeWinner(next);
    if (winner === opponentMark) recordRound("bot");
    else if (next.every(Boolean)) recordRound("draw");
    else setTurn(playerMark);
  }

  function resetRound() {
    setBoard(emptyBoard());
    setResult(null);
    setStarted(false);
    setHintIndex(null);
    setUsedHintThisRound(false);
    setTurn("X");
  }

  function nextRound() {
    resetRound();
    setRound((current) => current + 1);
    trackPortfolioEvent("tic_tac_toe_restarted");
  }

  function restartMatch() {
    resetRound();
    setScore({ player: 0, opponent: 0, draws: 0 });
    setRound(1);
    trackPortfolioEvent("tic_tac_toe_restarted");
  }

  function changeMode(next: GameMode) {
    setSelectedPreset(null);
    setMode(next);
    restartMatch();
  }

  function changeMark() {
    setSelectedPreset(null);
    setPlayerMark((current) => (current === "X" ? "O" : "X"));
    restartMatch();
  }

  function applyPreset(preset: TicTacToePreset) {
    const config = getTicTacToePresetConfig(preset);
    setSelectedPreset(preset);
    setMode(config.mode);
    setDifficulty(config.difficulty);
    setSeriesLength(config.seriesLength);
    restartMatch();
    trackPortfolioEvent("tic_tac_toe_preset_selected", {
      arcadePreset: preset,
    });
  }

  function showHint() {
    if (mode !== "bot" || result || matchWinner) return;
    const nextHint = getTicTacToeHintMove(board, playerMark);
    setHintIndex(nextHint >= 0 ? nextHint : null);
    if (nextHint >= 0) {
      setUsedHintThisRound(true);
      trackPortfolioEvent("tic_tac_toe_hint_used");
    }
  }

  const optionClass = (active: boolean) =>
    `inline-flex min-h-12 items-center justify-center rounded-[10px] border px-3 font-mono text-[8px] font-semibold uppercase tracking-[0.08em] transition-[border-color,background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5f3fc] active:scale-[0.98] motion-reduce:transition-none ${active ? "border-[#67e8f9] bg-[#0b2746] text-white" : "border-white/10 text-[#91adbf] hover:border-[#67e8f9]/60 hover:text-white"}`;

  return (
    <section
      data-tic-tac-toe="true"
      aria-labelledby="tic-tac-toe-title"
      className="archive-chapter border-y border-white/[0.07] bg-[#06111e]"
    >
      <div className="mx-auto grid max-w-[1180px] gap-7 px-4 py-10 sm:px-8 sm:py-18 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:px-12 lg:py-20">
        <div
          className="mx-auto w-full max-w-[540px] rounded-[16px] border border-[#67e8f9]/20 bg-[#071827]/80 p-3.5 min-[360px]:p-4 sm:p-6"
        >
          <ArcadeDifficultyNotice
            game="velha"
            level={difficulty}
            local={mode === "local"}
          />
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#67e8f9]">
                arena ·{" "}
                {selectedPreset === "survival"
                  ? "sobrevivência"
                  : selectedPreset === "competitive"
                    ? "competitiva"
                    : selectedPreset === "local"
                      ? "dupla"
                      : "rápida"}
              </p>
              <p
                data-game-status="true"
                role="status"
                aria-live="polite"
                className="mt-1 font-body text-sm text-[#d5edf7]"
              >
                {status}
              </p>
            </div>
            <Swords className="h-5 w-5 text-[#67e8f9]" aria-hidden="true" />
          </div>

          <div
            className="grid grid-cols-3 gap-2"
            role="group"
            aria-label="Tabuleiro do jogo da velha"
          >
            {board.map((cell, index) => {
              const row = Math.floor(index / 3) + 1;
              const column = (index % 3) + 1;
              const won = winningLine?.includes(index) ?? false;
              const hinted = hintIndex === index && !cell;
              return (
                <button
                  key={index}
                  type="button"
                  data-game-cell="true"
                  data-winning-cell={won ? "true" : undefined}
                  data-hint-cell={hinted ? "true" : undefined}
                  disabled={
                    Boolean(cell) || Boolean(result) || Boolean(matchWinner)
                  }
                  onClick={() => play(index)}
                  aria-label={`Linha ${row}, coluna ${column}: ${cell ?? "vazio"}${hinted ? ", dica sugerida" : ""}`}
                  className={`aspect-square min-h-16 rounded-[12px] border font-display text-[clamp(2rem,8vw,4.5rem)] font-medium transition-[border-color,background-color,transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5f3fc] disabled:cursor-default motion-reduce:transition-none ${won ? "border-[#67e8f9] bg-[#0d3850] shadow-[inset_0_0_28px_rgba(103,232,249,0.12)]" : hinted ? "border-[#f4d67a] bg-[#3a3318]/60 shadow-[inset_0_0_24px_rgba(244,214,122,0.12)]" : "border-white/10 bg-[#08111d] hover:-translate-y-0.5 hover:border-[#67e8f9]/60 hover:bg-[#0a2034] disabled:hover:translate-y-0"}`}
                >
                  <span
                    className={
                      cell === playerMark ? "text-[#67e8f9]" : "text-white"
                    }
                  >
                    {cell ?? ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {mode === "bot" && !result && !matchWinner && (
              <button
                data-arcade-hint="true"
                type="button"
                onClick={showHint}
                className={optionClass(false)}
              >
                <Lightbulb className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                dica estratégica
              </button>
            )}
            {result && !matchWinner && (
              <button
                type="button"
                onClick={nextRound}
                className={optionClass(true)}
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                próxima rodada
              </button>
            )}
            <button
              type="button"
              onClick={restartMatch}
              className={optionClass(false)}
              aria-label="Reiniciar partida"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              reiniciar
            </button>
          </div>
        </div>
        <div data-arcade-settings>
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[#67e8f9]">
            PG Lab · arcade experimental
          </p>
          <h2
            id="tic-tac-toe-title"
            className="mt-3 font-display text-[clamp(2.35rem,11vw,4.6rem)] font-medium leading-[0.92] tracking-[-0.055em] text-white"
          >
            Jogo da velha.
            <br />
            Estratégia em 1 toque.
          </h2>
          <p className="mt-4 max-w-xl font-body text-sm leading-6 text-[#a8c4d7] sm:leading-7">
            Escolha um modo e jogue sem cadastro. O Arcade acompanha evolução,
            taxa de vitória, sequência e conquistas neste dispositivo.
          </p>

          <div data-arcade-presets="true" className="mt-6">
            <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
              começar rápido
            </p>
            <div
              data-arcade-preset-grid="true"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              <button
                data-arcade-preset="quick"
                data-arcade-preset-card="true"
                type="button"
                aria-pressed={selectedPreset === "quick"}
                onClick={() => applyPreset("quick")}
                className={`${optionClass(selectedPreset === "quick")} min-h-[82px] flex-col gap-1 px-2 py-2.5`}
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                <span>rápido</span>
                <span className="font-body text-[9px] font-normal normal-case tracking-normal text-[#8fa8c7]">
                  contra bot
                </span>
              </button>
              <button
                data-arcade-preset="competitive"
                data-arcade-preset-card="true"
                type="button"
                aria-pressed={selectedPreset === "competitive"}
                onClick={() => applyPreset("competitive")}
                className={`${optionClass(selectedPreset === "competitive")} min-h-[82px] flex-col gap-1 px-2 py-2.5`}
              >
                <Swords className="h-4 w-4" aria-hidden="true" />
                <span>competir</span>
                <span className="font-body text-[9px] font-normal normal-case tracking-normal text-[#8fa8c7]">
                  impossível · MD3
                </span>
              </button>
              <button
                data-arcade-preset="local"
                data-arcade-preset-card="true"
                type="button"
                aria-pressed={selectedPreset === "local"}
                onClick={() => applyPreset("local")}
                className={`${optionClass(selectedPreset === "local")} min-h-[82px] flex-col gap-1 px-2 py-2.5`}
              >
                <UsersRound className="h-4 w-4" aria-hidden="true" />
                <span>dupla</span>
                <span className="font-body text-[9px] font-normal normal-case tracking-normal text-[#8fa8c7]">
                  1 × 1 local
                </span>
              </button>
              <button
                data-arcade-preset="survival"
                data-arcade-preset-card="true"
                type="button"
                aria-pressed={selectedPreset === "survival"}
                onClick={() => applyPreset("survival")}
                className={`${optionClass(selectedPreset === "survival")} min-h-[82px] flex-col gap-1 px-2 py-2.5`}
              >
                <Flame className="h-4 w-4" aria-hidden="true" />
                <span>sobrevivência</span>
                <span className="font-body text-[9px] font-normal normal-case tracking-normal text-[#8fa8c7]">
                  impossível · MD5
                </span>
              </button>
            </div>
          </div>

          <details
            data-arcade-advanced="true"
            className="mt-3 rounded-[12px] border border-white/10 bg-[#071827]/55"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#b7d5e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5f3fc]">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal
                  className="h-4 w-4 text-[#67e8f9]"
                  aria-hidden="true"
                />
                configurações avançadas
              </span>
              <span className="text-[#7191a8]">modo · série · símbolo</span>
            </summary>
            <div className="space-y-5 border-t border-white/10 px-3 pb-4 pt-4">
              <div>
                <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
                  modo
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={mode === "bot"}
                    onClick={() => changeMode("bot")}
                    className={optionClass(mode === "bot")}
                  >
                    <Bot className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                    contra bot
                  </button>
                  <button
                    type="button"
                    aria-pressed={mode === "local"}
                    onClick={() => changeMode("local")}
                    className={optionClass(mode === "local")}
                  >
                    <UsersRound
                      className="mr-2 h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    duas pessoas
                  </button>
                </div>
              </div>

              {mode === "bot" && (
                <div>
                  <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
                    dificuldade
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["easy", "fácil"],
                        ["normal", "normal"],
                        ["impossible", "impossível"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={difficulty === value}
                        onClick={() => {
                          setSelectedPreset(null);
                          setDifficulty(value);
                          restartMatch();
                        }}
                        className={optionClass(difficulty === value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
                    série
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 3, 5] as const).map((length) => (
                      <button
                        key={length}
                        type="button"
                        aria-pressed={seriesLength === length}
                        onClick={() => {
                          setSelectedPreset(null);
                          setSeriesLength(length);
                          restartMatch();
                        }}
                        className={optionClass(seriesLength === length)}
                      >
                        {length === 1 ? "1 jogo" : `MD${length}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#7191a8]">
                    símbolo do jogador 1
                  </p>
                  <button
                    type="button"
                    onClick={changeMark}
                    className={`${optionClass(true)} w-full`}
                    aria-label={`Jogar com o símbolo ${playerMark}. Clique para trocar`}
                  >
                    jogar com {playerMark} · trocar
                  </button>
                </div>
              </div>
            </div>
          </details>

          <div
            data-arcade-stats="true"
            className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-white/10 sm:grid-cols-4"
          >
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#7191a8]">
                partidas
              </p>
              <p className="mt-1 font-display text-xl text-white">
                {lifetimeStats.games}
              </p>
            </div>
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#7191a8]">
                vitórias
              </p>
              <p className="mt-1 font-display text-xl text-[#67e8f9]">
                {lifetimeStats.wins}
              </p>
            </div>
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#7191a8]">
                melhor sequência
              </p>
              <p className="mt-1 font-display text-xl text-[#f4d67a]">
                {lifetimeStats.bestWinStreak}
              </p>
            </div>
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#7191a8]">
                taxa de vitória
              </p>
              <p className="mt-1 inline-flex items-center justify-center gap-1 font-display text-xl text-white">
                <Gauge className="h-4 w-4 text-[#67e8f9]" aria-hidden="true" />
                {winRate}%
              </p>
            </div>
          </div>

          <div
            data-arcade-streak-progress="true"
            className="mt-3 rounded-[10px] border border-white/10 bg-[#071827] px-3 py-3"
          >
            <div className="flex items-center justify-between gap-3 font-mono text-[7px] uppercase tracking-[0.08em] text-[#7191a8]">
              <span>sequência atual {lifetimeStats.currentWinStreak}</span>
              <span>meta {nextStreakGoal}</span>
            </div>
            <div
              role="progressbar"
              aria-label="Progresso da sequência de vitórias"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={streakProgress}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full bg-[#67e8f9] transition-[width] duration-200 motion-reduce:transition-none"
                style={{ width: `${streakProgress}%` }}
              />
            </div>
          </div>

          {achievements.length > 0 && (
            <div
              data-arcade-achievements="true"
              className="mt-3 flex flex-wrap gap-2"
            >
              {achievements.map((achievement) => {
                const item = achievementCopy[achievement];
                const Icon = item.icon;
                return (
                  <span
                    key={achievement}
                    data-arcade-achievement={achievement}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#f4d67a]/25 bg-[#f4d67a]/5 px-2.5 font-mono text-[7px] font-semibold uppercase tracking-[0.08em] text-[#f4d67a]"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          )}

          <div
            data-match-score="true"
            className="mt-5 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-[12px] bg-white/10"
          >
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#7191a8]">
                {mode === "bot" ? "você" : "jogador 1"}
              </p>
              <p className="mt-1 font-display text-2xl text-[#67e8f9]">
                {score.player}
              </p>
            </div>
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#7191a8]">
                {mode === "bot" ? "PG Bot" : "jogador 2"}
              </p>
              <p className="mt-1 font-display text-2xl text-white">
                {score.opponent}
              </p>
            </div>
            <div className="bg-[#071827] p-3 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#7191a8]">
                empates
              </p>
              <p className="mt-1 font-display text-2xl text-[#b8cce0]">
                {score.draws}
              </p>
            </div>
          </div>
          {lastResult && (
            <div
              data-arcade-last-result="true"
              className="mt-3 flex min-h-11 items-center justify-between rounded-[10px] border border-white/10 bg-[#071827] px-3"
            >
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#7191a8]">
                última rodada
              </span>
              <span className="font-mono text-[9px] font-semibold uppercase text-[#d9fbff]">
                {lastResult === "player"
                  ? "vitória"
                  : lastResult === "bot"
                    ? "derrota"
                    : "empate"}
              </span>
            </div>
          )}
          <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.1em] text-[#7191a8]">
            rodada {round} · primeiro a {winsNeeded} vitória
            {winsNeeded > 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
