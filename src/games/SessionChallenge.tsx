import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { formatSessionTime, sessionSeconds, type SessionLevel, type SessionMode } from "../lib/sessionChallenge";
import { useAutoPause } from "./useAutoPause";

export default function SessionChallenge({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SessionMode>("free");
  const [level, setLevel] = useState<SessionLevel>("normal");
  const [phase, setPhase] = useState<"ready" | "running" | "paused" | "done">("ready");
  const [round, setRound] = useState(0);
  const [remaining, setRemaining] = useState(120);
  const left = useRef(120);
  const running = useRef(false);
  const last = useRef(0);
  const controls = useRef<HTMLDivElement>(null);
  const settle = useCallback(() => {
    if (!running.current) return;
    left.current = Math.max(0, left.current - (performance.now() - last.current) / 1000);
    last.current = performance.now();
    setRemaining(left.current);
  }, []);
  const pause = useCallback(() => {
    if (!running.current) return;
    settle();
    running.current = false;
    setPhase(left.current <= 0 ? "done" : "paused");
    window.dispatchEvent(new Event("pg-arcade-pause"));
  }, [settle]);
  useAutoPause(pause);
  useEffect(() => {
    if (mode === "free" || phase !== "running") return;
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
    return () => { window.clearInterval(tick); running.current = false; };
  }, [phase, mode, settle]);
  function configure(nextMode: SessionMode, nextLevel: SessionLevel) {
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
      setRound((n) => n + 1);
      left.current = sessionSeconds(mode, level);
      setRemaining(left.current);
    }
    setPhase("running");
  }
  const blocked = mode !== "free" && phase !== "running";
  return (
    <div className="session-challenge" data-session-mode={mode} data-session-phase={phase}>
      <div className="session-options" ref={controls}>
        <label>Modo de sessão
          <select aria-label="Modo de sessão" value={mode} disabled={phase === "running" || phase === "paused"} onChange={(e) => configure(e.target.value as SessionMode, level)}>
            <option value="free">Livre · no seu ritmo</option>
            <option value="sprint">Sprint · partida rápida</option>
            <option value="marathon">Maratona · sessão longa</option>
          </select>
        </label>
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
          {(phase === "paused" || phase === "done") && <button onClick={() => configure("free", level)}>Voltar à sessão livre</button>}
        </>}
      </div>
      {mode !== "free" && <p className="session-note" role="status">
        {phase === "done" ? "Tempo encerrado. A sessão foi bloqueada; seus recordes já conquistados continuam salvos." : phase === "paused" ? "Sessão pausada. Retome a sessão e use Continuar no jogo, se necessário." : "O relógio limita a sessão inteira. Iniciar abre uma nova partida; use os controles do jogo para jogar. Pausar sessão também pausa o relógio."}
      </p>}
      <div key={round} inert={blocked} data-session-content>
        {children}
      </div>
    </div>
  );
}
