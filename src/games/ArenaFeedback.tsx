import { useEffect, useRef } from "react";
import "./arenaFeedback.css";

export function ArenaProgress({ label, value, target, unit, detail }: {
  label: string; value: number; target: number; unit: string; detail?: string;
}) {
  const current = Math.max(0, Math.min(target, value));
  return <div className="arena-progress">
    <div><span>{label}</span><strong>{current} / {target} {unit}</strong>{detail && <small>{detail}</small>}</div>
    <progress aria-label={`Progresso: ${label}`} value={current} max={target} />
  </div>;
}

export function ArenaFeedback({ phase, title, context, objective, hint, score, time, lives, action, onAction }: {
  phase: "ready" | "paused" | "done";
  title: string; context: string; objective: string; hint?: string;
  score: number; time: number; lives: number; action: string; onAction: () => void;
}) {
  const primary = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (phase === "done") primary.current?.focus({ preventScroll: true });
  }, [phase]);
  return <div className="arena-feedback" data-arena-phase={phase}>
    <span className="arena-context">{context}</span>
    <strong className="arena-title">{title}</strong>
    <p className="arena-summary">{objective}</p>
    {phase === "ready" ? <p className="arena-hint">{hint}</p> : <dl className="arena-result">
      <div><dt>Pontos</dt><dd>{score}</dd></div>
      <div><dt>Tempo</dt><dd>{Math.floor(time)} s</dd></div>
      <div><dt>Vidas</dt><dd>{Math.max(0, lives)}</dd></div>
    </dl>}
    <button className="primary" ref={primary} onClick={onAction}>{action}</button>
  </div>;
}
