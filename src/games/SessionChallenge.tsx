import { recordUnits } from "../lib/gameHelp";
import OrientationControl from "./OrientationControl";
import { RecordScopeProvider } from "./RecordScope";
import { addScopedRecord } from "../lib/scopedRecords";
import type { Progress } from "../lib/progress";
import type { GameId } from "../lib/catalog";
import "../studio.css";
import './quality.css';
import "./playerMotion.css";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { formatSessionTime, sessionSeconds, improvedSessionRecords, improvedGeneralRecord, type SessionLevel, type SessionMode } from "../lib/sessionChallenge";
import { useAutoPause } from "./useAutoPause";

const sessionModes = [
  ['free', 'Livre', 'Explore e pratique no seu ritmo.'],
  ['sprint', 'Sprint', 'Uma sessão curta contra o relógio.'],
  ['marathon', 'Maratona', 'Mais tempo para construir sua melhor marca.'],
] as const;

export default function SessionChallenge({ children, gameId, progress, update }: { children: ReactNode; gameId: GameId; progress: Progress; update: (fn: (p: Progress) => Progress) => void }) {
  const [mode, setMode] = useState<SessionMode>("free");
  const [level, setLevel] = useState<SessionLevel>("normal");
  const [phase, setPhase] = useState<"ready" | "running" | "paused" | "done">("ready");
  const [results, setResults] = useState<number[]>([]);
  const baseline = useRef(progress.recordsV2 || {});
  const generalBaseline = useRef(progress.records[gameId] || 0);
  const addResult = useCallback((score: number) => {
    if (mode !== "free" && phase === "running") setResults(previous => [...previous, score]);
  }, [mode, phase]);
  const [gameActive, setGameActive] = useState<boolean | null>(null);
  const [round, setRound] = useState(0);
  const [remaining, setRemaining] = useState(120);
  const left = useRef(120);
  const running = useRef(false);
  const pausing = useRef(false);
  const last = useRef(0);
  const controls = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase === "done") controls.current?.querySelector<HTMLButtonElement>("[data-session-start]")?.focus({ preventScroll: true });
  }, [phase]);
  const settle = useCallback(() => {
    if (!running.current) return;
    left.current = Math.max(0, left.current - (performance.now() - last.current) / 1000);
    last.current = performance.now();
    setRemaining(left.current);
  }, []);
  const pause = useCallback(() => {
    if (phase !== "running" || mode === "free" || pausing.current) return;
    pausing.current = true;
    if (running.current) settle();
    running.current = false;
    setPhase(left.current <= 0 ? "done" : "paused");
    try { window.dispatchEvent(new Event("pg-arcade-pause")); }
    finally { pausing.current = false; }
  }, [settle, phase, mode]);
  useAutoPause(pause);
  useEffect(() => {
    if (mode === "free" || phase !== "running" || gameActive === false) return;
    running.current = true;
    last.current = performance.now();
    const tick = window.setInterval(() => {
      settle();
      if (left.current <= 0) {
        running.current = false;
        setPhase("done");
        window.dispatchEvent(new Event("pg-arcade-pause"));
        controls.current?.querySelector<HTMLButtonElement>("[data-session-start]")?.focus({ preventScroll: true });
      }
    }, 200);
    return () => {
      if (running.current) settle();
      window.clearInterval(tick); running.current = false;
    };
  }, [phase, mode, settle, gameActive]);
  function configure(nextMode: SessionMode, nextLevel: SessionLevel) {
    setResults([]);
    baseline.current = progress.recordsV2 || {};
    generalBaseline.current = progress.records[gameId] || 0;
    setGameActive(null);
    setRound(n => n + 1);
    running.current = false;
    window.dispatchEvent(new Event("pg-arcade-pause"));
    setMode(nextMode);
    setLevel(nextLevel);
    setPhase("ready");
    left.current = sessionSeconds(nextMode, nextLevel);
    setRemaining(left.current);
  }
  function start() {
    if (phase !== "paused") {
      setResults([]);
      baseline.current = progress.recordsV2 || {};
      generalBaseline.current = progress.records[gameId] || 0;
      setRound((n) => n + 1);
      left.current = sessionSeconds(mode, level);
      setRemaining(left.current);
    }
    setPhase("running");
  }
  function finish() {
    if (mode === "free" || (phase !== "running" && phase !== "paused")) return;
    settle();
    running.current = false;
    window.dispatchEvent(new Event("pg-arcade-pause"));
    setPhase("done");
  }
  const sessionKey = mode === "free" ? "free" : `${mode}-${level}`;
  const saveRecord = useCallback((variant: string, score: number) => {
    const key = `${gameId}|${sessionKey}|${variant}`;
    update(p => {
      const previous = p.recordsV2 || {};
      const next = addScopedRecord(previous, key, score);
      return next === previous ? p : { ...p, recordsV2: next };
    });
  }, [gameId, sessionKey, update]);
  const scoped = Object.fromEntries(Object.entries(progress.recordsV2 || {})
    .filter(([key]) => key.startsWith(`${gameId}|`)).map(([key, value]) => [key.slice(gameId.length + 1), value]));
  const blocked = mode !== "free" && phase !== "running";
  const duration = sessionSeconds(mode, level);
  const elapsed = mode === 'free' ? 0 : Math.max(0, duration - remaining);
  const urgent = mode !== 'free' && phase === 'running' && remaining <= 15;
  return (
    <div className="session-challenge" data-session-mode={mode} data-session-phase={phase} data-session-urgent={urgent} data-session-playing={gameActive === true}>
      <div className="session-mode-cards" role="group" aria-label="Escolha seu ritmo de partida">
        {sessionModes.map(([value,title,description])=><button key={value} type="button" aria-label={`${title}: ${description}`} aria-pressed={mode===value}
          disabled={phase==='running' || phase==='paused'} onClick={()=>{if(value!==mode) configure(value,level);}}>
          <strong>{title}</strong><span>{description}</span>
        </button>)}
      </div>
      <p className="session-selected-mode" aria-live="polite">
        {sessionModes.find(([value]) => value === mode)?.[2]}
      </p>
      <div className="session-options" ref={controls}>
        <OrientationControl/>
        {mode !== "free" && <>
          <label>Pressão de tempo
            <select aria-label="Dificuldade do desafio de tempo" value={level} disabled={phase === "running" || phase === "paused"} onChange={(e) => configure(mode, e.target.value as SessionLevel)}>
              <option value="easy">Fácil · {formatSessionTime(sessionSeconds(mode, "easy"))}</option>
              <option value="normal">Normal · {formatSessionTime(sessionSeconds(mode, "normal"))}</option>
              <option value="hard">Difícil · {formatSessionTime(sessionSeconds(mode, "hard"))}</option>
            </select>
          </label>
          <span className="session-clock" role="timer" aria-label="Tempo restante da sessão">{formatSessionTime(remaining)}</span>
          <button data-session-start onClick={phase === "running" ? pause : start}>
            {phase === "running" ? "Pausar sessão" : phase === "paused" ? "Retomar sessão" : phase === "done" ? "Repetir desafio de tempo" : "Iniciar desafio de tempo"}
          </button>
          {(phase === "running" || phase === "paused") && <button onClick={finish}>Encerrar sessão</button>}
          {(phase === "paused" || phase === "done") && <button onClick={() => configure("free", level)}>Voltar à sessão livre</button>}
        </>}
      </div>
      {mode !== 'free' && <div className="session-progress">
        <div><strong>{mode === 'sprint' ? 'Sprint' : 'Maratona'}</strong><span>{phase === 'running' ? 'Em jogo' : phase === 'paused' ? 'Em pausa' : phase === 'done' ? 'Sessão concluída' : 'Pronto para começar'}</span><span>{formatSessionTime(duration)} de sessão</span></div>
        <progress max={duration} value={elapsed} aria-label="Tempo utilizado na sessão" />
        {urgent && <span className="session-final-warning" role="status">Últimos 15 segundos. Continue no seu ritmo.</span>}
      </div>}
      {mode !== "free" && <p className="session-note" role="status">
        {phase === "done" ? `${remaining > 0 ? "Sessão encerrada" : "Tempo encerrado"}. A sessão foi bloqueada; seus recordes já conquistados continuam salvos.` : phase === "paused" ? "Sessão pausada. Libere a sessão e continue no jogo. O relógio dos jogos com pausa aguarda a retomada." : "Iniciar libera uma nova partida. Nos jogos com início e pausa, o relógio acompanha a atividade do jogo; nos tabuleiros, conta o tempo da sessão."}
      </p>}
      {mode !== "free" && phase === "done" && <section aria-label="Resumo da sessão" className="session-summary">
        <h2>Resultado da sessão</h2>
        <p>Conclusões registradas pelo jogo: {results.length}.</p>
        <p>{results.length ? `Melhor resultado registrado: ${["puzzle", "memoria"].includes(gameId) ? Math.min(...results) : Math.max(...results)} ${recordUnits[gameId] || "pontos"}.` : "Nenhuma conclusão foi registrada nesta sessão."}</p>
        <p>Configurações com novo recorde: {improvedSessionRecords(gameId, sessionKey, baseline.current, progress.recordsV2 || {})}.</p>
        <p>{improvedGeneralRecord(gameId, generalBaseline.current, progress.records[gameId] || 0) ? "Você também melhorou sua marca geral." : "Sua marca geral anterior foi preservada."}</p>
        <small>O total inclui somente jogos que informam sua conclusão. A comparação por configuração aparece onde há suporte.</small>
      </section>}
      {blocked && <section className="session-checkpoint" aria-label="Estado do desafio de tempo">
        <div><strong>{phase === 'paused' ? 'Uma pausa no desafio' : phase === 'done' ? remaining > 0 ? 'Sua sessão foi encerrada' : 'Seu tempo de sessão terminou' : 'Sua arena está pronta'}</strong>
          <p>{phase === 'ready' ? 'Inicie o desafio para liberar o jogo. O tempo começa a contar ao iniciar.' : `Tempo de jogo nesta sessão: ${formatSessionTime(elapsed)}. ${phase === 'paused' ? 'O relógio está parado.' : 'Os recordes conquistados permanecem salvos.'}`}</p></div>
        <button type="button" onClick={start}>{phase === 'paused' ? 'Retomar desafio' : phase === 'done' ? 'Jogar outro desafio' : 'Liberar arena'}</button>
      </section>}
      <div key={round} inert={blocked} data-session-content>
        <RecordScopeProvider value={{ records: scoped, session: sessionKey, save: saveRecord, activity: setGameActive, result: addResult }}>{children}</RecordScopeProvider>
      </div>
    </div>
  );
}
