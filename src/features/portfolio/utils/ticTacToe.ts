export type TicTacToeMark = "X" | "O";
export type TicTacToeCell = TicTacToeMark | null;
export type TicTacToeBoard = TicTacToeCell[];
export type TicTacToeDifficulty = "easy" | "normal" | "impossible";

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export function getTicTacToeWinningLine(
  board: TicTacToeBoard,
): readonly [number, number, number] | null {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

export function getTicTacToeWinner(
  board: TicTacToeBoard,
): TicTacToeMark | null {
  const line = getTicTacToeWinningLine(board);
  return line ? board[line[0]] : null;
}

function findFinishingMove(board: TicTacToeBoard, mark: TicTacToeMark) {
  for (let index = 0; index < board.length; index += 1) {
    if (board[index]) continue;
    const candidate = [...board];
    candidate[index] = mark;
    if (getTicTacToeWinner(candidate) === mark) return index;
  }
  return null;
}

export function chooseTicTacToeBotMove(
  board: TicTacToeBoard,
  botMark: TicTacToeMark = "O",
) {
  const winningMove = findFinishingMove(board, botMark);
  if (winningMove !== null) return winningMove;

  const blockingMove = findFinishingMove(board, otherMark(botMark));
  if (blockingMove !== null) return blockingMove;

  if (!board[4]) return 4;

  for (const index of [0, 2, 6, 8]) {
    if (!board[index]) return index;
  }

  return board.findIndex((cell) => cell === null);
}

function chooseImpossibleMove(board: TicTacToeBoard, botMark: TicTacToeMark) {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let index = 0; index < board.length; index += 1) {
    if (board[index]) continue;
    const candidate = [...board];
    candidate[index] = botMark;
    const score = minimaxForMark(candidate, botMark, otherMark(botMark), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }
  return bestMove;
}

export function chooseTicTacToeBotMoveByDifficulty(
  board: TicTacToeBoard,
  difficulty: TicTacToeDifficulty,
  random: () => number = Math.random,
  botMark: TicTacToeMark = "O",
) {
  const available = board.flatMap((cell, index) =>
    cell === null ? [index] : [],
  );
  if (!available.length) return -1;
  if (difficulty === "easy") {
    return available[
      Math.min(available.length - 1, Math.floor(random() * available.length))
    ];
  }
  if (difficulty === "impossible") return chooseImpossibleMove(board, botMark);
  return chooseTicTacToeBotMove(board, botMark);
}

export type TicTacToePreset = "quick" | "competitive" | "local" | "survival";

export type TicTacToeLifetimeStats = {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  currentWinStreak: number;
  bestWinStreak: number;
  hintsUsed: number;
  perfectWins: number;
};

export const emptyTicTacToeLifetimeStats: TicTacToeLifetimeStats = {
  games: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  hintsUsed: 0,
  perfectWins: 0,
};

export function normalizeTicTacToeLifetimeStats(
  stats: Partial<TicTacToeLifetimeStats> | null | undefined,
): TicTacToeLifetimeStats {
  const safeCount = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0
      ? value
      : 0;
  return {
    games: safeCount(stats?.games),
    wins: safeCount(stats?.wins),
    losses: safeCount(stats?.losses),
    draws: safeCount(stats?.draws),
    currentWinStreak: safeCount(stats?.currentWinStreak),
    bestWinStreak: safeCount(stats?.bestWinStreak),
    hintsUsed: safeCount(stats?.hintsUsed),
    perfectWins: safeCount(stats?.perfectWins),
  };
}

export function getTicTacToePresetConfig(preset: TicTacToePreset) {
  if (preset === "competitive") {
    return {
      mode: "bot" as const,
      difficulty: "impossible" as const,
      seriesLength: 3 as const,
    };
  }
  if (preset === "local") {
    return {
      mode: "local" as const,
      difficulty: "normal" as const,
      seriesLength: 3 as const,
    };
  }
  if (preset === "survival") {
    return {
      mode: "bot" as const,
      difficulty: "impossible" as const,
      seriesLength: 5 as const,
    };
  }
  return {
    mode: "bot" as const,
    difficulty: "normal" as const,
    seriesLength: 1 as const,
  };
}

function otherMark(mark: TicTacToeMark): TicTacToeMark {
  return mark === "X" ? "O" : "X";
}

function minimaxForMark(
  board: TicTacToeBoard,
  maximizingMark: TicTacToeMark,
  currentMark: TicTacToeMark,
  depth = 0,
): number {
  const winner = getTicTacToeWinner(board);
  if (winner === maximizingMark) return 10 - depth;
  if (winner === otherMark(maximizingMark)) return depth - 10;
  if (board.every(Boolean)) return 0;

  const scores: number[] = [];
  for (let index = 0; index < board.length; index += 1) {
    if (board[index]) continue;
    const candidate = [...board];
    candidate[index] = currentMark;
    scores.push(
      minimaxForMark(
        candidate,
        maximizingMark,
        otherMark(currentMark),
        depth + 1,
      ),
    );
  }

  return currentMark === maximizingMark
    ? Math.max(...scores)
    : Math.min(...scores);
}

export function getTicTacToeHintMove(
  board: TicTacToeBoard,
  mark: TicTacToeMark,
) {
  if (getTicTacToeWinner(board) || board.every(Boolean)) return -1;

  let bestMove = -1;
  let bestScore = -Infinity;
  for (let index = 0; index < board.length; index += 1) {
    if (board[index]) continue;
    const candidate = [...board];
    candidate[index] = mark;
    const score = minimaxForMark(candidate, mark, otherMark(mark), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }
  return bestMove;
}

export function updateTicTacToeLifetimeStats(
  stats: TicTacToeLifetimeStats | undefined,
  result: "player" | "bot" | "draw",
  options: { usedHint?: boolean; perfectWin?: boolean } = {},
): TicTacToeLifetimeStats {
  const current = normalizeTicTacToeLifetimeStats(stats);
  const currentWinStreak =
    result === "player" ? current.currentWinStreak + 1 : 0;
  return {
    games: current.games + 1,
    wins: current.wins + (result === "player" ? 1 : 0),
    losses: current.losses + (result === "bot" ? 1 : 0),
    draws: current.draws + (result === "draw" ? 1 : 0),
    currentWinStreak,
    bestWinStreak: Math.max(current.bestWinStreak, currentWinStreak),
    hintsUsed: current.hintsUsed + (options.usedHint ? 1 : 0),
    perfectWins:
      current.perfectWins + (result === "player" && options.perfectWin ? 1 : 0),
  };
}

export function getTicTacToeAchievements(stats: TicTacToeLifetimeStats) {
  const current = normalizeTicTacToeLifetimeStats(stats);
  const achievements: Array<
    "primeira-vitoria" | "trinca" | "invicto" | "sem-ajuda" | "estrategista"
  > = [];
  if (current.wins >= 1) achievements.push("primeira-vitoria");
  if (current.bestWinStreak >= 3) achievements.push("trinca");
  if (current.games >= 5 && current.losses === 0) achievements.push("invicto");
  if (current.perfectWins >= 1) achievements.push("sem-ajuda");
  if (current.hintsUsed >= 3) achievements.push("estrategista");
  return achievements;
}

export function getTicTacToeWinRate(stats: TicTacToeLifetimeStats) {
  const current = normalizeTicTacToeLifetimeStats(stats);
  if (!current.games) return 0;
  return Math.round((current.wins / current.games) * 100);
}

export function getTicTacToeStreakGoal(bestWinStreak: number) {
  if (bestWinStreak < 3) return 3;
  if (bestWinStreak < 5) return 5;
  return 10;
}

export function getTicTacToeStreakProgress(
  currentWinStreak: number,
  goal: number,
) {
  if (!Number.isFinite(goal) || goal <= 0) return 0;
  const safeCurrent =
    Number.isFinite(currentWinStreak) && currentWinStreak > 0
      ? currentWinStreak
      : 0;
  return Math.min(100, Math.round((safeCurrent / goal) * 100));
}
