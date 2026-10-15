import { createContext, useCallback, useContext, useLayoutEffect } from "react";
const RecordScope = createContext<{ records: Record<string, number>; session: string; activity?: (active: boolean | null) => void; save: (variant: string, score: number) => void } | null>(null);
export const RecordScopeProvider = RecordScope.Provider;
export function useScopedRecord(variant: string, legacy: number, saveLegacy: (score: number) => void): [number, (score: number) => void] {
  const scope = useContext(RecordScope);
  const save = scope?.save;
  const onRecord = useCallback((score: number) => {
    saveLegacy(score);
    save?.(variant, score);
  }, [saveLegacy, save, variant]);
  return [scope ? scope.records[`${scope.session}|${variant}`] || 0 : legacy, onRecord];
}

/** Engines report active play explicitly; untimed boards retain session-clock behavior. */
export function useGameActivity(active?: boolean) {
  const report = useContext(RecordScope)?.activity;
  useLayoutEffect(() => {
    if (active !== undefined) report?.(active);
  }, [active, report]);
  useLayoutEffect(() => () => { if (active !== undefined) report?.(null); }, [report]);
}
