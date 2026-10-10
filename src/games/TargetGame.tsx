import { useState, useEffect, useCallback, useRef } from "react";
import { Star } from "lucide-react";
import {
  hitScore,
  targetGameRules,
  type TargetDifficulty,
} from "../lib/actionGames";
import { useAutoPause, type PlayStatus } from "./useAutoPause";
import "./gameplay.css";
type Target = { id: number; cell: number };
export default function TargetGame({
  kind,
  record,
  onRecord,
}: {
  kind: "shoot" | "casual";
  record: number;
  onRecord: (n: number) => void;
}) {
  const shoot = kind === "shoot";
  const [difficulty, setDifficulty] = useState<TargetDifficulty>("normal");
  const rules = targetGameRules(kind, difficulty);
  const duration = rules.duration;
  const [status, setStatus] = useState<PlayStatus>("ready");
  const [remaining, setRemaining] = useState(() =>
    targetGameRules(kind, "normal").duration,
  );
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [feedback, setFeedback] = useState<{cell:number;points:number} | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [message, setMessage] = useState("Comece quando estiver pronto.");
  const id = useRef(0);
  const board = useRef<HTMLDivElement>(null);
  const timeLeft = useRef(duration * 1000);
  const deadline = useRef<number | null>(null);
  const settle = useCallback(() => {
    if (deadline.current === null) return;
    timeLeft.current = Math.max(0, deadline.current - performance.now());
    setRemaining(Math.ceil(timeLeft.current / 1000));
  }, []);
  const pause = useCallback(() => {
    settle();
    deadline.current = null;
    setStatus((s) => (s === "running" ? "paused" : s));
  }, [settle]);
  useAutoPause(pause);
  function freshTargets() {
    const cells = Array.from({ length: 9 }, (_, i) => i);
    const next: Target[] = [];
    for (let n = 0; n < rules.targets; n++) {
      const at = Math.floor(Math.random() * cells.length);
      next.push({ id: ++id.current, cell: cells.splice(at, 1)[0] });
    }
    return next;
  }
  useEffect(() => {
    if (status !== "running") return;
    deadline.current ??= performance.now() + timeLeft.current;
    const timer = setInterval(settle, 100);
    return () => clearInterval(timer);
  }, [status, settle]);
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 400);
    return () => clearTimeout(timer);
  }, [feedback]);
  useEffect(() => {
    if (shoot || status !== "running") return;
    const timer = setInterval(
      () => setTargets(freshTargets()),
      rules.relocateMs,
    );
    return () => clearInterval(timer);
  }, [shoot, status, rules.relocateMs]);
  useEffect(() => {
    if (remaining === 0 && status === "running") {
      onRecord(score);
      deadline.current = null;
      setStatus("done");
    }
  }, [remaining, status, score, onRecord]);
  function start() {
    if (status === "ready") setTargets(freshTargets());
    deadline.current = performance.now() + timeLeft.current;
    setStatus("running");
    board.current?.focus();
  }
  function hit(cell: number) {
    if (status !== "running" || deadline.current === null || performance.now() >= deadline.current) return;
    setAttempts((n) => n + 1);
    const target = targets.find((t) => t.cell === cell);
    if (!target) {
      setCombo(0);
      setFeedback({cell,points:0});
      setMessage("Não acertou. Procure o próximo alvo.");
      return;
    }
    const nextScore = shoot ? hitScore(score, combo) : score + 1;
    setScore(nextScore);
    setHits((n) => n + 1);
    setFeedback({cell,points:nextScore-score});
    setCombo((c) => c + 1);
    setMessage(
      shoot
        ? `Alvo acertado! ${nextScore} pontos.`
        : `Estrela coletada! ${nextScore} pontos.`,
    );
    if (shoot) {
      const free = Array.from({ length: 9 }, (_, i) => i).filter(
        (i) => i !== cell && !targets.some((t) => t.cell === i),
      );
      const next = free[Math.floor(Math.random() * free.length)];
      setTargets((t) =>
        t.map((x) =>
          x.id === target.id ? { id: ++id.current, cell: next } : x,
        ),
      );
    } else setTargets(freshTargets());
  }
  function reset(nextDifficulty: TargetDifficulty = difficulty) {
    deadline.current = null;
    timeLeft.current = targetGameRules(kind, nextDifficulty).duration * 1000;
    setStatus("ready");
    setRemaining(targetGameRules(kind, nextDifficulty).duration);
    setScore(0);
    setCombo(0);
    setAttempts(0);
    setHits(0);
    setFeedback(null);
    setTargets([]);
    setMessage("Nova rodada. Comece quando quiser.");
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Pontos<strong>{score}</strong>
          </div>
          <div>
            Tempo<strong>{remaining}s</strong>
          </div>
        </div>
        <p className="targets-summary">Sequência <strong>{combo}</strong> · Acertos <strong>{hits}/{attempts}</strong></p>
        <div
          ref={board}
          className={`targets-board ${shoot ? "space-targets" : "casual-targets"}`}
          tabIndex={0}
          role="group"
          aria-label={
            shoot
              ? "Arena de tiro. Use os números de 1 a 9 ou toque nos alvos."
              : "Campo de estrelas. Use os números de 1 a 9 ou toque na estrela."
          }
          onKeyDown={(e) => {
            if (/^[1-9]$/.test(e.key)) {
              e.preventDefault();
              hit(Number(e.key) - 1);
            }
            if (e.key === " " && e.target === e.currentTarget) {
              e.preventDefault();
              status === "running" ? pause() : status !== "done" && start();
            }
          }}
        >
          {Array.from({ length: 9 }, (_, i) => {
            const active = targets.some((t) => t.cell === i);
            return (
              <button
                key={i}
                disabled={status !== "running"}
                aria-label={`${shoot ? "Alvo" : "Estrela"} ${i + 1}: ${active ? "presente" : "vazio"}`}
                className={active ? "target-present" : ""}
                data-feedback={feedback?.cell === i ? feedback.points > 0 ? "hit" : "miss" : undefined}
                onClick={() => hit(i)}
              >
                <small>{i + 1}</small>
                {active ? (
                  shoot ? (
                    <img
                      className="target-ship"
                      src={`${import.meta.env.BASE_URL}art/ship.webp`}
                      alt=""
                    />
                  ) : (
                    <Star size={42} fill="currentColor" />
                  )
                ) : (
                  <span aria-hidden="true">·</span>
                )}
                {feedback?.cell === i && <span className="hit-feedback" aria-hidden="true">{feedback.points > 0 ? `+${feedback.points}` : "Erro"}</span>}
              </button>
            );
          })}
          {status !== "running" && (
            <div className="action-overlay">
              <strong>
                {status === "ready"
                  ? shoot
                    ? "Alvos Espaciais"
                    : "Caça-estrelas"
                  : status === "paused"
                    ? "Rodada pausada"
                    : "Rodada concluída!"}
              </strong>
              <span>
                {status === "done"
                  ? `${score} pontos • recorde ${Math.max(record, score)}`
                  : `${duration} segundos para fazer pontos`}
              </span>
            </div>
          )}
        </div>
        <p className="game-status" role="status">
          {status === "done"
            ? `Fim da rodada: ${score} pontos.`
            : status === "paused"
              ? "Rodada pausada."
              : message}
        </p>
        <div className="game-actions">
          <button
            className="primary"
            disabled={status === "done"}
            onClick={() => (status === "running" ? pause() : start())}
          >
            {status === "running"
              ? "Pausar"
              : status === "paused"
                ? "Continuar"
                : "Começar rodada"}
          </button>
          <button onClick={() => reset()}>Nova rodada</button>
        </div>
      </div>
      <aside className="instructions">
        <label>
          Dificuldade
          <select
            aria-label="Dificuldade"
            value={difficulty}
            disabled={status === "running" || status === "paused"}
            onChange={(e) => {
              const next = e.target.value as TargetDifficulty;
              setDifficulty(next);
              reset(next);
            }}
          >
            <option value="easy">Fácil</option>
            <option value="normal">Normal</option>
            <option value="hard">Difícil</option>
          </select>
        </label>
        <h2>{shoot ? "Mire nos alvos" : "Uma pausa divertida"}</h2>
        <p>
          {shoot
            ? `Acerte os ${rules.targets} alvos espalhados pela arena. Cada acerto reposiciona um alvo. Sequências sem errar rendem bônus. A rodada dura ${duration} segundos.`
            : `Toque na estrela antes que ela mude de lugar. Cada estrela vale um ponto; a rodada dura ${duration} segundos e o intervalo muda com a dificuldade.`}
        </p>
        <p>
          Toque, clique ou use os números 1 a 9 na disposição do tabuleiro. Tab
          e Enter também funcionam. Espaço no tabuleiro pausa.
        </p>
        <p>
          Recorde: {record} pontos. A rodada pausa ao trocar de aba ou sair da
          janela.
        </p>
      </aside>
    </div>
  );
}
