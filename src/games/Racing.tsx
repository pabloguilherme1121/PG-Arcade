import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  initialRace,
  raceVelocity,
  steerRace,
  tickRace,
} from "../lib/actionGames";
import { directionFromKey, directionFromSwipe } from "../lib/engines";
import { useAutoPause, type PlayStatus } from "./useAutoPause";
import "./racing.css";
export default function Racing({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [state, setState] = useState(initialRace);
  const [status, setStatus] = useState<PlayStatus>("ready");
  const [speed, setSpeed] = useState(3);
  const board = useRef<HTMLDivElement>(null);
  const touch = useRef<[number, number] | null>(null);
  const drag = useRef<[number, number] | null>(null);
  const throttle = useRef(0);
  const engine = useRef(state);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopEngine = useCallback(() => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
    throttle.current = 0;
    touch.current = null;
    drag.current = null;
  }, []);
  const pause = useCallback(() => {
    stopEngine();
    setStatus((s) => (s === "running" ? "paused" : s));
  }, [stopEngine]);
  useAutoPause(pause);
  useEffect(() => {
    if (status !== "running") return;
    timer.current = setInterval(() => {
      engine.current = tickRace(engine.current, speed, Math.random, throttle.current);
      setState(engine.current);
      if (!engine.current.lives) stopEngine();
    }, 100);
    return stopEngine;
  }, [status, speed, stopEngine]);
  useEffect(() => {
    if (!state.lives && status === "running") {
      onRecord(state.score);
      setStatus("done");
    }
  }, [state.lives, state.score, status, onRecord]);
  const currentVelocity = raceVelocity(
    Math.max(1, speed + state.paceOffset),
    state.ticks,
  );
  const speedKmh = Math.round(currentVelocity * 36);
  function steer(delta: number): boolean {
    if (status !== "running") return false;
    const next = steerRace(engine.current, delta);
    if (next === engine.current) return false;
    engine.current = next;
    setState(next);
    return true;
  }
  function start() {
    throttle.current = 0;
    setStatus("running");
    board.current?.focus();
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Distância<strong>{state.score}</strong>
          </div>
          <div>
            Recorde<strong>{record}</strong>
          </div>
        </div>
        <p className="race-lives">
          <span role="status">{state.lives} vidas</span>
          <span className="race-speedometer" data-race-speed>
            {speedKmh} km/h
          </span>
          <span data-race-current-lane>Faixa {state.lane + 1} de 3</span>
          <span>•</span>{" "}
          <span role="status">
            {status === "ready"
              ? "Pronto para largar"
              : status === "running"
                ? state.crashCooldown > 0
                  ? "Recuperando controle"
                  : state.steerCooldown > 0
                    ? "Completando troca de faixa"
                    : throttle.current > 0
                      ? "Acelerando"
                      : throttle.current < 0
                        ? "Freando"
                        : "Desvie do trânsito"
                : status === "paused"
                  ? "Corrida pausada"
                  : "Fim da corrida"}
          </span>
        </p>
        <div
          ref={board}
          className={`race-board ${status === "running" ? "racing-running" : ""}`}
          style={
            {
              "--race-speed": currentVelocity,
              "--road-motion-duration": `${Math.max(0.18, 0.92 / currentVelocity)}s`,
            } as CSSProperties
          }
          tabIndex={0}
          role="group"
          aria-label="Pista de corrida. A/D ou esquerda/direita dirigem; W/cima acelera; S/baixo freia; espaço pausa."
          onPointerDown={(e) => {
            if (e.pointerType === "touch" || e.button !== 0 || status !== "running")
              return;
            drag.current = [e.clientX, e.clientY];
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const origin = drag.current;
            if (!origin || status !== "running") return;
            const direction = directionFromSwipe(
              e.clientX - origin[0],
              e.clientY - origin[1],
              24,
            );
            if (direction === "left" || direction === "right") {
              steer(direction === "left" ? -1 : 1);
              drag.current = null;
            }
          }}
          onPointerUp={(e) => {
            const origin = drag.current;
            drag.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
            if (!origin || status !== "running") return;
            const direction = directionFromSwipe(
              e.clientX - origin[0],
              e.clientY - origin[1],
              24,
            );
            if (direction === "left") steer(-1);
            if (direction === "right") steer(1);
          }}
          onPointerCancel={(e) => {
            drag.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
          onTouchStart={(e) => {
            touch.current = e.touches.length === 1
              ? [e.touches[0].clientX, e.touches[0].clientY]
              : null;
          }}
          onTouchMove={(e) => {
            if (!touch.current || status !== "running") return;
            if (e.touches.length !== 1) {
              touch.current = null;
              return;
            }
            const point = e.touches[0];
            const direction = directionFromSwipe(
              point.clientX - touch.current[0],
              point.clientY - touch.current[1],
              24,
            );
            if ((direction === "left" || direction === "right") &&
              steer(direction === "left" ? -1 : 1)) {
              // Retain the remaining drag so a continuous gesture can change lanes again.
              touch.current = [point.clientX, point.clientY];
            }
          }}
          onTouchCancel={() => { touch.current = null; }}
          onTouchEnd={(e) => {
            if (!touch.current || status !== "running") return;
            const ended = e.changedTouches[0];
            if (!ended) { touch.current = null; return; }
            const dx = ended.clientX - touch.current[0];
            const dy = ended.clientY - touch.current[1];
            touch.current = null;
            const direction = directionFromSwipe(dx, dy, 24);
            if (direction === "left") steer(-1);
            if (direction === "right") steer(1);
          }}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              status === "running" ? pause() : status !== "done" && start();
              return;
            }
            const d = directionFromKey(e.key);
            if (d === "left" || d === "right") {
              e.preventDefault();
              steer(d === "left" ? -1 : 1);
            }
            if (d === "up" || d === "down") {
              e.preventDefault();
              throttle.current = d === "up" ? 1 : -1;
            }
          }}
          onKeyUp={(e) => {
            const d = directionFromKey(e.key);
            if (d === "up" || d === "down") throttle.current = 0;
          }}
          onBlur={() => {
            throttle.current = 0;
          }}
        >
          <div className="race-lane-guide" aria-hidden="true">
            {Array.from({ length: 3 }, (_, lane) => (
              <span key={lane} data-race-lane-indicator={lane} data-active={lane === state.lane}>
                {lane + 1}
              </span>
            ))}
          </div>
          <div className="road-line line-one" />
          <div className="road-line line-two" />
          {state.traffic.map((car) => (
            <div
              key={car.id}
              className="traffic-car"
              data-speed-factor={(car.speedFactor ?? 1).toFixed(2)}
              style={{
                left: `${car.lane * 33.33 + 16.66}%`,
                top: `${car.y}%`,
                transform: `translateX(-50%) scale(${Math.max(
                  0.7,
                  Math.min(1.08, 0.74 + ((car.y + 16) / 126) * 0.34),
                )})`,
                transformOrigin: "center bottom",
              }}
            >
              <img src={`${import.meta.env.BASE_URL}art/car.webp`} alt="" />
            </div>
          ))}
          <div
            className={`race-car ${state.crashCooldown > 0 ? "race-car-recovering" : ""}`}
            data-lane={state.lane}
            data-recovering={state.crashCooldown > 0}
            data-steering={state.steerCooldown > 0}
            style={{ left: `${state.lane * 33.33 + 16.66}%` }}
          >
            <img src={`${import.meta.env.BASE_URL}art/car.webp`} alt="" />
            <span className="sr-only">
              Seu carro: faixa {state.lane + 1}
              {state.crashCooldown > 0 ? ", recuperando após colisão" : ""}
            </span>
          </div>
          {status !== "running" && (
            <div className="action-overlay">
              <strong>
                {status === "ready"
                  ? "Corrida Turbo"
                  : status === "paused"
                    ? "Pausa"
                    : "Boa corrida!"}
              </strong>
              <span>
                {status === "done"
                  ? `${state.score} pontos de distância`
                  : "Troque de faixa e evite os carros."}
              </span>
            </div>
          )}
        </div>
        <div className="wide-controls">
          <button
            aria-label="Dirigir para esquerda"
            disabled={status !== "running"}
            onClick={() => steer(-1)}
          >
            <ArrowLeft />
            Esquerda
          </button>
          <button
            aria-label="Dirigir para direita"
            disabled={status !== "running"}
            onClick={() => steer(1)}
          >
            Direita
            <ArrowRight />
          </button>
        </div>
        <div className="wide-controls race-pedals">
          <button
            aria-label="Frear"
            data-held={throttle.current === -1}
            disabled={status !== "running"}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              throttle.current = -1;
            }}
            onPointerUp={() => {
              throttle.current = 0;
            }}
            onPointerCancel={() => {
              throttle.current = 0;
            }}
            onLostPointerCapture={() => { throttle.current = 0; }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                throttle.current = -1;
              }
            }}
            onKeyUp={() => {
              throttle.current = 0;
            }}
            onBlur={() => {
              throttle.current = 0;
            }}
          >
            Frear
          </button>
          <button
            aria-label="Acelerar"
            data-held={throttle.current === 1}
            disabled={status !== "running"}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              throttle.current = 1;
            }}
            onPointerUp={() => {
              throttle.current = 0;
            }}
            onPointerCancel={() => {
              throttle.current = 0;
            }}
            onLostPointerCapture={() => { throttle.current = 0; }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                throttle.current = 1;
              }
            }}
            onKeyUp={() => {
              throttle.current = 0;
            }}
            onBlur={() => {
              throttle.current = 0;
            }}
          >
            Acelerar
          </button>
        </div>
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
                : "Largar"}
          </button>
          <button
            disabled={status !== "running" && status !== "paused"}
            onClick={() => {
              stopEngine();
              onRecord(engine.current.score);
              setStatus("done");
            }}
          >
            Encerrar e salvar
          </button>
          <button
            onClick={() => {
              stopEngine();
              engine.current = initialRace();
              setState(engine.current);
              setStatus("ready");
            }}
          >
            Nova corrida
          </button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Encontre uma faixa livre</h2>
        <p>
          Desvie dos carros para acumular distância. Cada colisão custa uma
          vida e ativa uma breve recuperação contra impactos em sequência; você
          começa com três.
        </p>
        <label htmlFor="race-speed">Ritmo da corrida</label>
        <select
          id="race-speed"
          value={speed}
          disabled={status === "running"}
          onChange={(e) => setSpeed(Number(e.target.value))}
        >
          <option value={2}>Passeio</option>
          <option value={3}>Clássico</option>
          <option value={4}>Turbo</option>
        </select>
        <p>
          A/D ou esquerda/direita dirigem; W/cima acelera e S/baixo freia.
          Soltar o pedal faz a velocidade retornar gradualmente ao ritmo-base.
          Cada comando muda uma faixa e o esterço precisa de um instante para
          estabilizar. No celular, use os botões de direção e os pedais.
        </p>
        <p>
          A corrida pausa ao trocar de aba ou sair da janela. O recorde é salvo
          ao terminar; você também pode encerrar voluntariamente para registrar
          a distância atual.
        </p>
      </aside>
    </div>
  );
}
