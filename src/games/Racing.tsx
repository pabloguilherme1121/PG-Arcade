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
import { useAutoPause, type PlayStatus } from "./useAutoPause";
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
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const pause = useCallback(
    () => setStatus((s) => (s === "running" ? "paused" : s)),
    [],
  );
  useAutoPause(pause);
  useEffect(() => {
    if (status !== "running") return;
    const timer = setInterval(() => setState((s) => tickRace(s, speed)), 100);
    return () => clearInterval(timer);
  }, [status, speed]);
  useEffect(() => {
    if (!state.lives && status === "running") {
      onRecord(state.score);
      setStatus("done");
    }
  }, [state.lives, state.score, status, onRecord]);
  const currentVelocity = raceVelocity(speed, state.ticks);
  const speedKmh = Math.round(currentVelocity * 36);
  function steer(delta: number) {
    if (status === "running") setState((s) => steerRace(s, delta));
  }
  function start() {
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
        <p className="race-lives" role="status">
          <span>{state.lives} vidas</span>
          <span className="race-speedometer" data-race-speed>
            {speedKmh} km/h
          </span>
          <span>•</span>{" "}
          {status === "ready"
            ? "Pronto para largar"
            : status === "running"
              ? "Desvie do trânsito"
              : status === "paused"
                ? "Corrida pausada"
                : "Fim da corrida"}
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
          aria-label="Pista de corrida. Setas ou A/D dirigem; deslize para trocar de faixa; espaço pausa."
          onPointerDown={(e) => {
            if (status !== "running" || !e.isPrimary) return;
            swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerCancel={() => { swipe.current = null; }}
          onPointerUp={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start || start.id !== e.pointerId) return;
            const dx = e.clientX - start.x, dy = e.clientY - start.y;
            if (Math.abs(dx) >= 24 && Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 1 : -1);
          }}
          onKeyDown={(e) => {
            const key = e.key.toLowerCase();
            if (["arrowleft", "arrowright", "a", "d", " "].includes(key)) {
              e.preventDefault();
              if (e.key === " ")
                status === "running" ? pause() : status !== "done" && start();
              else if (!e.repeat) steer(key === "arrowleft" || key === "a" ? -1 : 1);
            }
          }}
        >
          <div className="road-line line-one" />
          <div className="road-line line-two" />
          {state.traffic.map((car) => (
            <div
              key={car.id}
              className="traffic-car"
              style={{ left: `${car.lane * 33.33 + 16.66}%`, top: `${car.y}%` }}
            >
              <img src={`${import.meta.env.BASE_URL}art/car.webp`} alt="" />
            </div>
          ))}
          <div
            className="race-car"
            data-recovering={state.recoveryTicks > 0}
            data-lane={state.lane}
            style={{ left: `${state.lane * 33.33 + 16.66}%` }}
          >
            <img src={`${import.meta.env.BASE_URL}art/car.webp`} alt="" />
            <span className="sr-only">Seu carro: faixa {state.lane + 1}</span>
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
        {state.recoveryTicks > 0 && status === "running" && (
          <p role="status">Proteção após colisão: encontre uma faixa livre.</p>
        )}
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
              onRecord(state.score);
              setStatus("done");
            }}
          >
            Encerrar e salvar
          </button>
          <button
            onClick={() => {
              setState(initialRace());
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
          vida; você começa com três. Após um impacto, há um segundo de proteção
          para recuperar o controle.
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
          Setas ou A/D dirigem, espaço pausa. No celular, use os dois botões
          grandes abaixo da pista ou deslize horizontalmente na pista.
        </p>
        <p>
          A corrida pausa ao trocar de aba ou sair da janela. O recorde é salvo
          ao terminar ou ao escolher Encerrar e salvar.
        </p>
      </aside>
    </div>
  );
}
