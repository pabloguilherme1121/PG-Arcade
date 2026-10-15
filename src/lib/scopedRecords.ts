export type ScopedRecords = Record<string, number>;
export function isScopedRecordKey(key: string) {
  const [game, session, variant, ...extra] = key.split("|");
  if (extra.length || !/^(free|(?:sprint|marathon)-(?:easy|normal|hard))$/.test(session ?? "")) return false;
  return (game === "2048" || game === "reflexo") ? /^(easy|normal|hard)$/.test(variant ?? "")
    : game === "memoria" ? /^(4|8|12)-(500|900|1500)$/.test(variant ?? "")
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
export function scopedRecordLabel(key: string) {
  const [game, session, variant] = key.split("|");
  const levels: Record<string, string> = { easy: "Fácil", normal: "Normal", hard: "Difícil", "0": "Fácil", "1": "Normal", "2": "Difícil" };
  const rhythm = session === "free" ? "Livre" : `${session.startsWith("sprint") ? "Sprint" : "Maratona"} · ${levels[session.split("-")[1]]}`;
  const detail = game === "minas" ? `${variant} minas` : game === "puzzle" ? ({ "12": "Fácil", "40": "Normal", "100": "Difícil" } as Record<string, string>)[variant] : game === "memoria" ? `${variant.split("-")[0]} pares · ${Number(variant.split("-")[1]) / 1000} s`
    : game === "snake" ? `${variant.startsWith("wrap") ? "Portal" : "Clássico"} · ${variant.split("-")[1]} ms · ${variant.endsWith("progressive") ? "progressivo" : "constante"}`
    : levels[variant];
  return `${rhythm} · ${detail}`;
}
