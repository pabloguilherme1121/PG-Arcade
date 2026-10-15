import { createContext, useCallback, useContext } from "react";
const RecordScope = createContext<{ records: Record<string, number>; session: string; save: (variant: string, score: number) => void } | null>(null);
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
