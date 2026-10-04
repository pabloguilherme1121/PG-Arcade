export const arcadeSessionStorageKey = "pablo-pg-arcade-session-v1";

export const arcadeGames = [
  "velha",
  "domino",
  "futebol",
  "damas",
  "xadrez",
] as const;
export type ArcadeGame = (typeof arcadeGames)[number];

export type ArcadeSession = {
  lastGame: ArcadeGame;
  visits: Record<ArcadeGame, number>;
  explored: ArcadeGame[];
};

export const emptyArcadeSession: ArcadeSession = {
  lastGame: "velha",
  visits: {
    velha: 0,
    domino: 0,
    futebol: 0,
    damas: 0,
    xadrez: 0,
  },
  explored: [],
};

function isArcadeGame(value: unknown): value is ArcadeGame {
  return typeof value === "string" && arcadeGames.includes(value as ArcadeGame);
}

function normalizeVisitCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

export function normalizeArcadeSession(value: unknown): ArcadeSession {
  if (!value || typeof value !== "object") {
    return {
      lastGame: emptyArcadeSession.lastGame,
      visits: { ...emptyArcadeSession.visits },
      explored: [...emptyArcadeSession.explored],
    };
  }

  const candidate = value as {
    lastGame?: unknown;
    visits?: Partial<Record<ArcadeGame, unknown>>;
    explored?: unknown;
  };

  const visits: Record<ArcadeGame, number> = {
    velha: normalizeVisitCount(candidate.visits?.velha),
    domino: normalizeVisitCount(candidate.visits?.domino),
    futebol: normalizeVisitCount(candidate.visits?.futebol),
    damas: normalizeVisitCount(candidate.visits?.damas),
    xadrez: normalizeVisitCount(candidate.visits?.xadrez),
  };

  const storedExplored = Array.isArray(candidate.explored)
    ? candidate.explored.filter(isArcadeGame)
    : [];

  const explored = arcadeGames.filter(
    (game) => storedExplored.includes(game) || visits[game] > 0,
  );

  return {
    lastGame: isArcadeGame(candidate.lastGame)
      ? candidate.lastGame
      : emptyArcadeSession.lastGame,
    visits,
    explored,
  };
}

export function markArcadeGameExplored(
  session: ArcadeSession,
  game: ArcadeGame,
): ArcadeSession {
  if (session.explored.includes(game)) return session;

  return {
    ...session,
    explored: [...session.explored, game],
  };
}

export function recordArcadeGameVisit(
  session: ArcadeSession,
  game: ArcadeGame,
): ArcadeSession {
  const explored = session.explored.includes(game)
    ? session.explored
    : [...session.explored, game];

  return {
    lastGame: game,
    visits: {
      ...session.visits,
      [game]: session.visits[game] + 1,
    },
    explored,
  };
}

export function getMostVisitedArcadeGame(
  session: ArcadeSession,
): ArcadeGame | null {
  const highest = Math.max(...arcadeGames.map((game) => session.visits[game]));
  if (highest <= 0) return null;
  if (session.visits[session.lastGame] === highest) return session.lastGame;
  return arcadeGames.find((game) => session.visits[game] === highest) ?? null;
}

export function getSuggestedArcadeGame(
  session: ArcadeSession,
  activeGame: ArcadeGame,
): ArcadeGame {
  const candidates = arcadeGames.filter((game) => game !== activeGame);

  return candidates.reduce((best, candidate) => {
    const bestExplored = session.explored.includes(best);
    const candidateExplored = session.explored.includes(candidate);

    if (bestExplored !== candidateExplored) {
      return candidateExplored ? best : candidate;
    }

    return session.visits[candidate] < session.visits[best] ? candidate : best;
  });
}

export function resetArcadeSessionProgress(
  _session: ArcadeSession,
  activeGame: ArcadeGame,
): ArcadeSession {
  return {
    lastGame: activeGame,
    visits: { ...emptyArcadeSession.visits },
    explored: [activeGame],
  };
}
