export type ScopedRecords = Record<string, number>;
// Explicit versioned schema: accepting a key must not depend on mutable catalog copy.
const logicRecordGames = new Set(['sudoku', 'nonograma', 'labirinto', 'sokoban', 'hanoi', 'senha', 'nim', 'reversi', 'batalha', 'pontes']);
const actionRecordGames = new Set(['breakout', 'pong', 'asteroides', 'invasores', 'runner', 'voo', 'jetpack', 'esquiva', 'pouso', 'drift']);
const casualRecordGames = new Set(['vinteum', 'dados', 'boliche', 'basquete', 'golfe', 'arco', 'pesca', 'match3']);
const quizRecordGames = new Set(['arithmetic', 'fractions', 'primes', 'equation', 'twentyfour', 'numsequence', 'anagram', 'hangman', 'wordsearch', 'stroop', 'oddone', 'estimate']);
const boardRecordGames = new Set(['flood', 'same', 'peg', 'knight', 'queens', 'latin', 'takuzu', 'sky', 'futoshiki', 'magic', 'fifteen', 'rotate', 'pipes', 'laser', 'loop', 'links', 'colorsort', 'watersort', 'slideblock', 'memorypath', 'gomoku', 'hex', 'ataxx', 'isolation', 'breakthrough', 'territory', 'mancala', 'chomp']);
export const scopedRecordFamily = (game: string): 'logic' | 'action' | 'casual' | 'quiz' | 'board' | null =>
  logicRecordGames.has(game) ? 'logic' : actionRecordGames.has(game) ? 'action' : casualRecordGames.has(game) ? 'casual' : quizRecordGames.has(game) ? 'quiz' : boardRecordGames.has(game) ? 'board' : null;
export function isScopedRecordKey(key: string) {
  const [game, session, variant, ...extra] = key.split("|");
  if (extra.length || !/^(free|(?:sprint|marathon)-(?:easy|normal|hard))$/.test(session ?? "")) return false;
  if (logicRecordGames.has(game)) return /^[012]-(livre|serie)$/.test(variant ?? '') || (game === 'nim' && /^[012]-reverso$/.test(variant ?? ''));
  if (actionRecordGames.has(game)) return /^(easy|normal|hard|master|expert)-(mission|endless)$/.test(variant ?? '');
  if (casualRecordGames.has(game)) return /^[012]-(treino|classico|maratona)$/.test(variant ?? '');
  if (game === 'links') return /^(?:[012]|paths2-[012])$/.test(variant ?? '');
  if (quizRecordGames.has(game) || boardRecordGames.has(game)) return /^[012]$/.test(variant ?? '');
  return (game === "2048" || game === "reflexo") ? /^(easy|normal|hard)$/.test(variant ?? "")
    : game === "memoria" ? /^(4|8|12)-(500|900|1500)$/.test(variant ?? "")
    : game === "palavra" ? /^(4|6)$/.test(variant ?? "")
    : game === "minas" ? /^(6|10|16)$/.test(variant ?? "")
    : game === "puzzle" ? /^(12|40|100)$/.test(variant ?? "")
    : game === "blocos" ? /^[012]$/.test(variant ?? "")
    : game === "snake" && /^(classic|wrap)-(100|160|220)-(constant|progressive)$/.test(variant ?? "");
}
export function normalizeScopedRecords(raw: unknown): ScopedRecords {
  const clean: ScopedRecords = {};
  if (raw && typeof raw === "object") for (const [key, value] of Object.entries(raw)) {
    if (isScopedRecordKey(key) && typeof value === "number" && Number.isSafeInteger(value) && value > 0) clean[key] = value;
  }
  return clean;
}
export function addScopedRecord(records: ScopedRecords, key: string, value: number): ScopedRecords {
  if (!isScopedRecordKey(key) || !Number.isSafeInteger(value) || value <= 0) return records;
  const old = records[key] || 0;
  const better = (key.startsWith("memoria|") || key.startsWith("puzzle|")) ? !old || value < old : value > old;
  return better ? { ...records, [key]: value } : records;
}
