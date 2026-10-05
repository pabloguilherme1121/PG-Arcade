import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, Flag, CircleDollarSign } from "lucide-react";
import {
  newRun,
  stepRun,
  moveRun,
  fireRun,
  type RunKind,
  type RunOptions,
} from "../lib/runEngine";
import { useAutoPause, type PlayStatus } from "./useAutoPause";
import { directionFromSwipe } from "../lib/engines";
const names = {
  rally: "Rally de Checkpoints",
  coleta: "Coleta na Estrada",
  orbital: "Defesa Orbital",
};
export default function ArcadeRun({
  kind,
  record,
  onRecord,
}: {
  kind: RunKind;
  record: number;
  onRecord: (n: number) => void;
}) {
  const [state, setState] = useState(newRun);
  const [status, setStatus] = useState<PlayStatus>("ready");
  const [difficulty, setDifficulty] =
    useState<RunOptions["difficulty"]>("normal");
  const [limit, setLimit] = useState(900);
  const board = useRef<HTMLDivElement>(null);
  const touch = useRef<[number, number] | null>(null);
  const pause = useCallback(
    () => setStatus((s) => (s === "running" ? "paused" : s)),
    [],
  );
  useAutoPause(pause);
  useEffect(() => {
    if (status !== "running") return;
    const timer = setInterval(
      () =>
        setState((s) => stepRun(s, kind, Math.random, { difficulty, limit })),
      100,
    );
    return () => clearInterval(timer);
  }, [status, kind, difficulty, limit]);
  useEffect(() => {
    if (status === "running" && (state.lives === 0 || state.ticks >= limit)) {
      onRecord(state.score);
      setStatus("done");
    }
  }, [state, status, onRecord, limit]);
  const move = (delta: number) => {
    if (status === "running") setState((s) => moveRun(s, delta));
  };
  const shoot = () => {
    if (kind === "orbital" && status === "running") setState(fireRun);
  };
  const start = () => {
    setStatus("running");
    board.current?.focus();
  };
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Pontos<strong>{state.score}</strong>
          </div>
          <div>
            {limit === Infinity ? "Tempo jogado" : "Tempo"}
            <strong>
              {limit === Infinity
                ? Math.floor(state.ticks / 10)
                : Math.ceil((limit - state.ticks) / 10)}
              s
            </strong>
          </div>
        </div>
        <p role="status" className="race-lives">
          {state.lives} vidas • Etapa {1 + Math.floor(state.ticks / 300)} •{" "}
          {status === "done"
            ? "Rodada concluída"
            : status === "paused"
              ? "Partida pausada"
              : "Prepare sua próxima manobra"}
        </p>
        <div
          ref={board}
          className={`run-board race-board ${kind === "orbital" ? "orbital-board" : ""} ${status === "running" ? "racing-running" : ""}`}
          role="group"
          tabIndex={0}
          aria-label={`${names[kind]}. Setas, A/D ou deslize para mover, espaço para pausar${kind === "orbital" ? ", Enter para disparar" : ""}.`}
          onTouchStart={(e) => {
            touch.current = [e.touches[0].clientX, e.touches[0].clientY];
          }}
          onTouchEnd={(e) => {
            if (!touch.current || status !== "running") return;
            const dx = e.changedTouches[0].clientX - touch.current[0];
            const dy = e.changedTouches[0].clientY - touch.current[1];
            touch.current = null;
            const direction = directionFromSwipe(dx, dy, 24);
            if (direction === "left") move(-1);
            if (direction === "right") move(1);
          }}
          onKeyDown={(e) => {
            const key = e.key.toLowerCase();
            if (
              (["arrowleft", "arrowright", "a", "d", " "].includes(key) ||
                (kind === "orbital" && key === "enter")) &&
              e.target === e.currentTarget
            ) {
              e.preventDefault();
              if (key === " ")
                status === "running" ? pause() : status !== "done" && start();
              else if (key === "enter") shoot();
              else move(key === "arrowleft" || key === "a" ? -1 : 1);
            }
          }}
        >
          {kind !== "orbital" && (
            <>
              <div className="road-line line-one" />
              <div className="road-line line-two" />
            </>
          )}
          {state.objects.map((o) => (
            <div
              key={o.id}
              className={`run-object ${o.reward ? "run-reward" : "run-enemy"}`}
              style={{ left: `${o.lane * 33.33 + 16.66}%`, top: `${o.y}%` }}
              aria-hidden="true"
            >
              {o.reward ? (
                kind === "rally" ? (
                  <Flag />
                ) : (
                  <CircleDollarSign />
                )
              ) : (
                <img
                  src={`${import.meta.env.BASE_URL}art/${kind === "orbital" ? "ship" : "car"}.webp`}
                  alt=""
                />
              )}
            </div>
          ))}
          {state.shots.map((s) => (
            <i
              key={s.id}
              className="laser"
              style={{ left: `${s.lane * 33.33 + 16.66}%`, top: `${s.y}%` }}
              aria-hidden="true"
            />
          ))}
          <div
            className="race-car"
            data-lane={state.lane}
            style={{ left: `${state.lane * 33.33 + 16.66}%` }}
          >
            <img
              src={`${import.meta.env.BASE_URL}art/${kind === "orbital" ? "ship" : "car"}.webp`}
              alt=""
            />
            <span className="sr-only">Sua faixa: {state.lane + 1}</span>
          </div>
          {status !== "running" && (
            <div className="action-overlay">
              <strong>
                {status === "paused"
                  ? "Pausa"
                  : status === "done"
                    ? `${state.score} pontos`
                    : names[kind]}
              </strong>
              <span>
                {kind === "orbital"
                  ? "Mova a nave e dispare nos invasores."
                  : kind === "rally"
                    ? "Colete bandeiras e desvie dos carros."
                    : "Colete moedas e evite o trânsito."}
              </span>
            </div>
          )}
        </div>
        <div className="wide-controls">
          <button disabled={status !== "running"} onClick={() => move(-1)}>
            <ArrowLeft />
            Esquerda
          </button>
          <button disabled={status !== "running"} onClick={() => move(1)}>
            Direita
            <ArrowRight />
          </button>
        </div>
        {kind === "orbital" && (
          <button
            className="primary fire-button"
            disabled={status !== "running"}
            onClick={shoot}
          >
            Disparar · Enter
          </button>
        )}
        <div className="game-actions">
          <button
            disabled={status === "ready" || status === "done"}
            onClick={() => {
              onRecord(state.score);
              setStatus("done");
            }}
          >
            Encerrar e salvar
          </button>
          <button
            className="primary"
            disabled={status === "done"}
            onClick={() => (status === "running" ? pause() : start())}
          >
            {status === "running"
              ? "Pausar"
              : status === "paused"
                ? "Continuar"
                : "Começar"}
          </button>
          <button
            onClick={() => {
              setState(newRun());
              setStatus("ready");
            }}
          >
            Nova rodada
          </button>
        </div>
      </div>
      <aside className="instructions">
        <div className="session-options">
          <label>
            Modo
            <select
              aria-label="Modo da expedição"
              value={String(limit)}
              disabled={status !== "ready" && status !== "done"}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value="300">Sprint · 30 segundos</option>
              <option value="900">Expedição · 90 segundos</option>
              <option value="Infinity">Sobrevivência · sem limite</option>
            </select>
          </label>
          <label>
            Dificuldade
            <select
              aria-label="Dificuldade da expedição"
              value={difficulty}
              disabled={status !== "ready" && status !== "done"}
              onChange={(e) =>
                setDifficulty(e.target.value as RunOptions["difficulty"])
              }
            >
              <option value="easy">Fácil</option>
              <option value="normal">Normal</option>
              <option value="hard">Difícil</option>
            </select>
          </label>
        </div>
        <h2>
          {kind === "orbital"
            ? "Proteja sua órbita"
            : "Faça cada manobra valer"}
        </h2>
        <p>
          {kind === "orbital"
            ? "Dispare com Enter ou com o botão. Cada nave destruída vale 20 pontos. As colisões custam uma vida."
            : kind === "rally"
              ? "Cada bandeira vale 25 pontos. Escolha a faixa certa antes que ela passe. Desvie dos carros."
              : "Cada moeda vale 10 pontos. Escolha entre buscar moedas e fugir dos carros que se aproximam."}
        </p>
        <p>
          Escolha uma expedição de 90 segundos, um sprint ou sobreviva sem
          limite. O ritmo aumenta a cada etapa de 30 segundos. São três vidas.
          Use setas, A/D, deslize horizontalmente ou use os botões. Espaço pausa. A partida pausa ao sair da
          janela.
        </p>
        <p>Recorde: {record || "—"} pontos.</p>
      </aside>
    </div>
  );
}
