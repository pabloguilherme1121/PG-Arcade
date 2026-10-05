import { useState, useEffect, useRef } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import {
  queueSnakeDirection,
  directionFromKey,
  directionFromSwipe,
  samePoint,
  stepSnake,
  snakeFood,
  type Direction,
  type Point,
} from "../lib/engines";
import Controls from "./Controls";
const initialBody = () => [
  { x: 7, y: 8 },
  { x: 6, y: 8 },
  { x: 5, y: 8 },
];
export default function Snake({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [body, setBody] = useState(initialBody);
  const [food, setFood] = useState<Point | null>({ x: 11, y: 8 });
  const [status, setStatus] = useState<
    "ready" | "running" | "paused" | "over" | "won"
  >("ready");
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(160);
  const current = useRef<Direction>("right");
  const queued = useRef<Direction[]>([]);
  const touch = useRef<[number, number] | null>(null);
  function direction(d: Direction) {
    queued.current = queueSnakeDirection(current.current, queued.current, d);
  }
  function reset() {
    setBody(initialBody());
    setFood({ x: 11, y: 8 });
    setScore(0);
    current.current = "right";
    queued.current = [];
    setStatus("ready");
  }
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      if (!food) return;
      const nextDirection = queued.current.shift();
      if (nextDirection) current.current = nextDirection;
      const result = stepSnake(body, current.current, food);
      if (result.collision) {
        setStatus("over");
        return;
      }
      setBody(result.body);
      if (result.ate) {
        const n = score + 10;
        setScore(n);
        onRecord(n);
        const next = snakeFood(result.body);
        setFood(next);
        if (!next) setStatus("won");
      }
    }, speed);
    return () => clearInterval(id);
  }, [body, food, status, score, speed, onRecord]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setStatus((s) => (s === "running" ? "paused" : s));
    };
    const blur = () => setStatus((s) => (s === "running" ? "paused" : s));
    document.addEventListener("visibilitychange", pause);
    window.addEventListener("blur", blur);
    window.addEventListener("pg-arcade-pause", blur);
    return () => {
      document.removeEventListener("visibilitychange", pause);
      window.removeEventListener("blur", blur);
      window.removeEventListener("pg-arcade-pause", blur);
    };
  }, []);
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Pontos<strong>{score}</strong>
          </div>
          <div>
            Recorde<strong>{record}</strong>
          </div>
        </div>
        <div
          className="snake-board"
          tabIndex={0}
          role="group"
          aria-label="Tabuleiro Snake. Use as setas ou WASD para mover e espaço para pausar."
          onKeyDown={(e) => {
            const d = directionFromKey(e.key);
            if (d) {
              e.preventDefault();
              direction(d);
            }
            if (e.code === "Space") {
              e.preventDefault();
              setStatus((s) =>
                s === "running"
                  ? "paused"
                  : s === "ready" || s === "paused"
                    ? "running"
                    : s,
              );
            }
          }}
          onTouchStart={(e) => {
            touch.current = [e.touches[0].clientX, e.touches[0].clientY];
          }}
          onTouchEnd={(e) => {
            if (!touch.current) return;
            const dx = e.changedTouches[0].clientX - touch.current[0],
              dy = e.changedTouches[0].clientY - touch.current[1];
            touch.current = null;
            const d = directionFromSwipe(dx, dy, 15);
            if (d) direction(d);
          }}
        >
          {Array.from({ length: 256 }, (_, i) => {
            const p = { x: i % 16, y: Math.floor(i / 16) };
            return (
              <span
                key={i}
                className={
                  samePoint(p, body[0])
                    ? "snake-head"
                    : body.some((b) => samePoint(b, p))
                      ? "snake-body"
                      : food && samePoint(p, food)
                        ? "snake-food"
                        : ""
                }
              />
            );
          })}
          {status !== "running" && (
            <div className="board-overlay">
              <strong>
                {status === "ready"
                  ? "Vamos jogar?"
                  : status === "paused"
                    ? "Pausa"
                    : status === "won"
                      ? "Tabuleiro completo!"
                      : "Fim de jogo"}
              </strong>
              <span>
                {status === "ready"
                  ? "Pegue a fruta e cuide das curvas."
                  : status === "paused"
                    ? "Continue quando quiser."
                    : `${score} pontos nesta partida.`}
              </span>
            </div>
          )}
        </div>
        <p className="game-status" role="status">
          {status === "running"
            ? "Use setas, WASD, swipe ou os controles abaixo."
            : status === "paused"
              ? "Partida pausada."
              : status === "over"
                ? "Você colidiu. Tente novamente."
                : status === "won"
                  ? "Você completou o tabuleiro!"
                  : "Comece a partida quando estiver pronto."}
        </p>
        <div className="game-actions">
          <button
            className="primary"
            disabled={status === "over" || status === "won"}
            onClick={() =>
              setStatus(status === "running" ? "paused" : "running")
            }
          >
            {status === "running" ? <Pause size={18} /> : <Play size={18} />}{" "}
            {status === "running"
              ? "Pausar"
              : status === "paused"
                ? "Continuar"
                : "Jogar"}
          </button>
          <button onClick={reset}>
            <RotateCcw size={18} />
            Nova partida
          </button>
        </div>
        <Controls onMove={direction} disabled={status !== "running"} />
      </div>
      <aside className="instructions">
        <h2>Como jogar</h2>
        <p>Coma as frutas para crescer. Evite as paredes e o próprio corpo.</p>
        <p>
          Use as setas ou WASD, deslize no tabuleiro ou toque nos controles. A barra de
          espaço pausa a partida.
        </p>
        <hr />
        <label htmlFor="snake-speed">Velocidade</label>
        <select
          id="snake-speed"
          value={speed}
          disabled={status === "running"}
          onChange={(e) => setSpeed(Number(e.target.value))}
        >
          <option value={220}>Tranquilo</option>
          <option value={160}>Clássico</option>
          <option value={100}>Rápido</option>
        </select>
        <p className="small">
          A partida pausa quando você troca de aba ou sai da janela.
        </p>
      </aside>
    </div>
  );
}
