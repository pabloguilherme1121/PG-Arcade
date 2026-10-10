import { useCallback, useEffect, useRef, useState } from "react";
import {
  emptyInput,
  motionStep,
  motionTarget,
  newMotion,
  type MotionInput,
  type MotionState,
} from "../lib/motionExpansion";
import { newGames, type NewGameId } from "../lib/newCatalog";
import { useAutoPause } from "./useAutoPause";
import { revealPlayfield } from "./revealPlayfield";
import { useResponsiveCanvas } from "./useResponsiveCanvas";
import { paintAtmosphere, paintBlock, paintOrb } from "./canvasMaterials";
import "./newGames.css";
export function paintMotion(c: CanvasRenderingContext2D, s: MotionState) {
  c.clearRect(0, 0, 480, 380);
  const bg = c.createLinearGradient(0, 0, 0, 380);
  bg.addColorStop(0, s.id === "ski" ? "#c7dfed" : "#0c172a");
  bg.addColorStop(1, s.id === "ski" ? "#f0f5f8" : "#1a2d3e");
  c.fillStyle = bg;
  c.fillRect(0, 0, 480, 380);
  paintAtmosphere(c, 380, s.id === "ski");
  const circle = (x: number, y: number, r: number, color: string) => {
    paintOrb(c, x, y, r, color);
  };
  c.font = "bold 18px sans-serif";
  c.textAlign = "center";
  if (s.id === "rhythm") {
    for (let lane = 0; lane < 4; lane++) {
      c.fillStyle = ["#fa8695", "#79b8ff", "#a5e479", "#ffe17c"][lane] + "22";
      c.fillRect(lane * 120 + 4, 0, 112, 380);
      c.fillStyle = "#e9f0f5";
      c.fillText(String(lane + 1), lane * 120 + 60, 350);
    }
    c.strokeStyle = "#fff";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 300);
    c.lineTo(480, 300);
    c.stroke();
  }
  if (s.id === "crossroad") {
    c.fillStyle = "#354345";
    c.fillRect(0, 38, 480, 284);
    for (let lane = 0; lane < 6; lane++) {
      c.strokeStyle = "#d5d5a7";
      c.setLineDash([16, 12]);
      c.beginPath();
      c.moveTo(0, 43 + lane * 44);
      c.lineTo(480, 43 + lane * 44);
      c.stroke();
    }
    c.setLineDash([]);
    c.fillStyle = "#4a7562";
    c.fillRect(0, 0, 480, 38);
    c.fillRect(0, 322, 480, 58);
  }
  for (const o of s.objects) {
    if (o.kind === "block") {
      paintBlock(c, o.x - o.r, o.y, o.r * 2, 20, "#82cda7");
    } else if (o.kind === "car") {
      paintBlock(c, o.x - o.r, o.y - 14, o.r * 2, 28, o.lane % 2 ? "#ff8f80" : "#79b8ff");
      c.fillStyle = "#162939";
      c.fillRect(o.x - 10, o.y - 10, 15, 20);
      c.fillStyle = "#fff4c9";
      c.fillRect(o.x + o.r - 4, o.y - 10, 3, 5);
      c.fillRect(o.x + o.r - 4, o.y + 5, 3, 5);
    } else if (o.kind === "gate") {
      c.strokeStyle = "#166f4b";
      c.lineWidth = 4;
      for (const dx of [-o.r, o.r]) {
        c.beginPath();
        c.moveTo(o.x + dx, o.y - 18);
        c.lineTo(o.x + dx, o.y + 18);
        c.stroke();
      }
      c.fillStyle = "#c9f65a88";
      c.fillRect(o.x - o.r, o.y - 3, o.r * 2, 6);
    } else if (o.kind === "tree") {
      c.fillStyle = "#23583e";
      c.beginPath();
      c.moveTo(o.x, o.y - 25);
      c.lineTo(o.x - 20, o.y + 12);
      c.lineTo(o.x + 20, o.y + 12);
      c.closePath();
      c.fill();
    } else if (o.kind === "balloon" || o.kind === "bomb") {
      circle(
        o.x,
        o.y,
        o.r,
        o.kind === "bomb"
          ? "#f58585"
          : ["#fa8695", "#79b8ff", "#a5e479", "#ffe17c"][o.lane],
      );
      c.fillStyle = "#102132";
      c.fillText(o.kind === "bomb" ? "×" : String(o.lane + 1), o.x, o.y + 6);
      c.strokeStyle = "#9ba8b7";
      c.beginPath();
      c.moveTo(o.x, o.y + o.r);
      c.lineTo(o.x, o.y + o.r + 25);
      c.stroke();
    } else {
      circle(
        o.x,
        o.y,
        o.r,
        o.kind === "bullet"
          ? "#fff"
          : o.kind === "enemy"
            ? "#ff8f80"
            : o.kind === "note"
              ? ["#fa8695", "#79b8ff", "#a5e479", "#ffe17c"][o.lane]
              : "#ffc766",
      );
      if (o.kind === "target") {
        circle(o.x, o.y, o.r * 0.65, "#253e52");
        circle(o.x, o.y, o.r * 0.3, "#ffc766");
      }
    }
  }
  if (s.id === "stack") {
    paintBlock(c, s.base - s.width / 2, 353, s.width, 20, "#596e84");
    paintBlock(c, s.x - s.width / 2, 307 - s.progress * 23, s.width, 20, "#c9f65a");
  }
  if (s.id === "balance") {
    c.save();
    c.translate(240, 250);
    c.rotate(s.angle);
    c.fillStyle = "#79b8ff";
    c.fillRect(-205, 0, 410, 8);
    c.restore();
    circle(s.x, 240 + Math.sin(s.angle) * (s.x - 240), 12, "#c9f65a");
  }
  if (s.id === "rope") {
    c.strokeStyle = "#79b8ff";
    c.lineWidth = 4;
    c.beginPath();
    c.ellipse(
      240,
      295,
      160,
      Math.max(3, Math.abs(Math.sin(s.angle)) * 90),
      0,
      0,
      Math.PI * 2,
    );
    c.stroke();
    circle(240, s.y - 22, 14, "#c9f65a");
    c.fillStyle = "#c9f65a";
    c.fillRect(232, s.y - 9, 16, 24);
  }
  if (["turret", "ricochet"].includes(s.id)) {
    circle(240, 340, 20, "#79b8ff");
    c.strokeStyle = "#c9f65a";
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(240, 340);
    c.lineTo(240 + Math.cos(s.angle) * 48, 340 + Math.sin(s.angle) * 48);
    c.stroke();
    c.lineWidth = 1;
    c.setLineDash([5, 5]);
    c.beginPath();
    c.moveTo(240, 340);
    c.lineTo(240 + Math.cos(s.angle) * 400, 340 + Math.sin(s.angle) * 400);
    c.stroke();
    c.setLineDash([]);
  }
  if (s.id === "meteors") {
    c.fillStyle = "#c9f65a";
    c.fillRect(s.x - 35, 326, 70, 10);
    c.fillStyle = "#6e90a5";
    c.fillRect(0, 366, 480, 14);
  }
  if (s.id === "ski") {
    circle(s.x, 312, 8, "#122735");
    c.strokeStyle = "#122735";
    c.lineWidth = 4;
    for (const dx of [-6, 6]) {
      c.beginPath();
      c.moveTo(s.x + dx, 320);
      c.lineTo(s.x + dx + s.vx * 0.04, 345);
      c.stroke();
    }
  }
  if (s.id === "crossroad") {
    circle(s.x, s.y, 12, "#c9f65a");
  }
  const edge = c.createRadialGradient(240, 190, 130, 240, 190, 360);
  edge.addColorStop(0, "#00000000");
  edge.addColorStop(1, s.id === "ski" ? "#54788b22" : "#00000060");
  c.fillStyle = edge;
  c.fillRect(0, 0, 480, 380);
}
export default function MotionExpansion({
  gameId,
  record,
  onRecord,
}: {
  gameId: NewGameId;
  record: number;
  onRecord: (n: number) => void;
}) {
  const [difficulty, setDifficulty] = useState(1),
    [seed, setSeed] = useState(1),
    [hud, setHud] = useState(() => newMotion(gameId));
  const state = useRef(hud),
    input = useRef(emptyInput()),
    pending = useRef(emptyInput()),
    canvas = useRef<HTMLCanvasElement>(null),
    recordCallback = useRef(onRecord),
    awarded = useRef(false);
  recordCallback.current = onRecord;
  useResponsiveCanvas(canvas, 480, 380, (context) => paintMotion(context, state.current));
  const meta = newGames.find((g) => g.id === gameId)!;
  const pause = useCallback(() => {
    input.current = emptyInput();
    pending.current = emptyInput();
    if (state.current.status === "running") {
      state.current = {
        ...state.current,
        status: "paused",
        lastAction: false,
        lastLane: -1,
      };
      setHud(state.current);
    }
  }, []);
  useAutoPause(pause);
  useEffect(() => {
    if (!["won", "lost"].includes(hud.status) || awarded.current) return;
    awarded.current = true;
    recordCallback.current(hud.score);
  }, [hud.status, hud.score]);
  useEffect(() => {
    if (hud.status === "running") return;
    const context = canvas.current?.getContext("2d");
    if (context) paintMotion(context, hud);
  }, [hud]);
  useEffect(() => {
    if (hud.status !== "running") return;
    let frame = 0,
      last = performance.now(),
      accumulator = 0,
      renderTime = 0;
    const animate = (now: number) => {
      const elapsed = Math.min((now - last) / 1000, 0.15);
      last = now;
      if (state.current.status === "running") {
        accumulator += elapsed;
        while (accumulator >= 1 / 60 && state.current.status === "running") {
          const keys = {
            ...input.current,
            left: input.current.left || pending.current.left,
            right: input.current.right || pending.current.right,
            up: input.current.up || pending.current.up,
            down: input.current.down || pending.current.down,
            action: input.current.action || pending.current.action,
            lane:
              pending.current.lane >= 0
                ? pending.current.lane
                : input.current.lane,
          };
          state.current = motionStep(state.current, keys, 1 / 60);
          pending.current = emptyInput();
          accumulator -= 1 / 60;
        }
        if (["won", "lost"].includes(state.current.status)) {
          setHud(state.current);
        }
      } else accumulator = 0;
      const context = canvas.current?.getContext("2d");
      if (context) paintMotion(context, state.current);
      if (now - renderTime > 90) {
        setHud(state.current);
        renderTime = now;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      input.current = emptyInput();
    };
  }, [hud.status]);
  function reset(d = difficulty, next = seed) {
    setDifficulty(d);
    setSeed(next);
    state.current = newMotion(gameId, d, next);
    setHud(state.current);
    input.current = emptyInput();
    pending.current = emptyInput();
    awarded.current = false;
  }
  function start() {
    state.current = {
      ...state.current,
      status: "running",
      message: "Partida em andamento.",
      lastAction: false,
      lastLane: -1,
    };
    input.current = emptyInput();
    pending.current = emptyInput();
    setHud(state.current);
    canvas.current?.focus({ preventScroll: true });
    revealPlayfield(canvas.current);
  }
  function setKey(key: string, value: boolean) {
    const k = key.toLowerCase(),
      mapping: Record<string, keyof MotionInput> = {
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        " ": "action",
        enter: "action",
      };
    const field = mapping[k];
    if (field && field !== "lane") {
      input.current[field] = value;
      if (value) pending.current[field] = true;
      return true;
    }
    if (/^[1-4]$/.test(key)) {
      input.current.lane = value ? Number(key) - 1 : -1;
      if (value) pending.current.lane = Number(key) - 1;
      return true;
    }
    return false;
  }
  function held(field: keyof MotionInput, label: string) {
    return (
      <button
        key={field}
        disabled={hud.status !== "running"}
        aria-label={label}
        onClick={(e) => {
          if (e.detail === 0 && field !== "lane") pending.current[field] = true;
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          if (field !== "lane") {
            input.current[field] = true;
            pending.current[field] = true;
          }
        }}
        onPointerUp={() => {
          if (field !== "lane") input.current[field] = false;
        }}
        onPointerCancel={() => {
          if (field !== "lane") {
            input.current[field] = false;
            pending.current[field] = false;
          }
        }}
        onLostPointerCapture={() => {
          if (field !== "lane") input.current[field] = false;
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (field !== "lane") {
              input.current[field] = true;
              if (!e.repeat) pending.current[field] = true;
            }
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (field !== "lane") input.current[field] = false;
          }
        }}
        onBlur={() => {
          if (field !== "lane") input.current[field] = false;
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <section className="new-game motion-expansion" data-new-game={gameId}>
      <div className="new-options">
        <label>
          Dificuldade
          <select
            aria-label="Dificuldade"
            value={difficulty}
            disabled={hud.status === "running" || hud.status === "paused"}
            onChange={(e) => reset(Number(e.target.value))}
          >
            <option value={0}>Iniciante</option>
            <option value={1}>Normal</option>
            <option value={2}>Avançado</option>
          </select>
        </label>
        <button onClick={() => reset(difficulty, seed + 1)}>
          Novo desafio
        </button>
      </div>
      <div className="new-hud">
        <span>
          Pontos <strong>{hud.score}</strong>
        </span>
        <span>
          Vidas <strong>{hud.lives}</strong>
        </span>
        {["rhythm", "balloons"].includes(gameId) && (
          <span>
            Combo <strong>{hud.combo}</strong>
          </span>
        )}
        <span>
          Tempo <strong>{Math.floor(hud.time)}s</strong>
        </span>
        <span>
          Recorde <strong>{record}</strong>
        </span>
      </div>
      <div role="status" className="new-status">
        {hud.status === "paused" ? "Partida pausada" : hud.message}
      </div>
      <div className="new-workspace">
        <div className="motion-stage">
          <canvas
            ref={canvas}
            width={480}
            height={380}
            tabIndex={0}
            aria-label={`Arena de ${meta.name}. ${meta.help}`}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                pause();
              } else if (!e.repeat && setKey(e.key, true)) e.preventDefault();
            }}
            onKeyUp={(e) => {
              if (setKey(e.key, false)) e.preventDefault();
            }}
            onBlur={(e) => {
              input.current = emptyInput();
              pending.current = emptyInput();
              if (
                !e.relatedTarget ||
                !e.currentTarget.parentElement?.contains(
                  e.relatedTarget as Node,
                )
              )
                pause();
            }}
            onPointerDown={(e) => {
              if (gameId === "balloons") {
                const r = e.currentTarget.getBoundingClientRect();
                state.current = motionTarget(
                  state.current,
                  ((e.clientX - r.left) * 480) / r.width,
                  ((e.clientY - r.top) * 380) / r.height,
                );
                setHud(state.current);
              } else if (gameId === "rhythm") {
                const r = e.currentTarget.getBoundingClientRect();
                pending.current.lane = Math.min(
                  3,
                  Math.floor(((e.clientX - r.left) / r.width) * 4),
                );
              }
              e.currentTarget.focus({ preventScroll: true });
            }}
          />
          {hud.status !== "running" && (
            <div className="motion-overlay">
              <p>
                {hud.status === "ready"
                  ? "Prepare os controles"
                  : hud.status === "paused"
                    ? "Pausado"
                    : hud.status === "won"
                      ? "Desafio concluído!"
                      : "Fim da tentativa"}
              </p>
              {["ready", "paused"].includes(hud.status) ? (
                <button className="primary" onClick={start}>
                  {hud.status === "ready" ? "Começar" : "Continuar"}
                </button>
              ) : (
                <button
                  className="primary"
                  onClick={() => reset(difficulty, seed + 1)}
                >
                  Jogar novamente
                </button>
              )}
            </div>
          )}
          <div className="motion-inputs">
          <div className="motion-controls">
            {["rhythm", "balloons"].includes(gameId) ? (
              [0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  disabled={hud.status !== "running"}
                  aria-label={`Faixa ${i + 1}`}
                  onClick={() => (pending.current.lane = i)}
                >
                  {i + 1}
                </button>
              ))
            ) : (
              <>
                {held("left", "← Esquerda")}
                {gameId === "crossroad" && held("up", "↑ Cima")}
                {gameId === "crossroad" && held("down", "↓ Baixo")}
                {held("right", "Direita →")}
                {["stack", "rope", "turret", "ricochet"].includes(gameId) && (
                  <button
                    disabled={hud.status !== "running"}
                    className="primary"
                    onClick={(e) => {
                      if (e.detail === 0) pending.current.action = true;
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      input.current.action = true;
                      pending.current.action = true;
                    }}
                    onPointerUp={() => (input.current.action = false)}
                    onPointerCancel={() => (input.current.action = false)}
                    onLostPointerCapture={() => (input.current.action = false)}
                  >
                    Ação
                  </button>
                )}
              </>
            )}
          </div>
          <div className="new-actions">
            <button disabled={hud.status !== "running"} onClick={pause}>Pausar</button>
            <button onClick={() => reset()}>Reiniciar</button>
          </div>
          </div>
        </div>
        <aside className="new-instructions">
          <h2>Como jogar</h2>
          <p>{meta.help}</p>
          <p className="new-tip">
            {difficulty === 0
              ? "Iniciante: ritmo mais legível, maior tolerância e mais tempo de recuperação."
              : difficulty === 2
                ? "Avançado: ritmo mais rápido, janelas menores e pontuação de precisão valorizada."
                : "Normal: velocidade, tolerância e recuperação equilibradas."}
          </p>
          {gameId === "ricochet" && <p>Disparos restantes: {hud.shots}</p>}
          <p className="new-tip">
            A partida pausa ao trocar de janela. Use Escape para pausar. As
            setas e WASD funcionam com a arena em foco.
          </p>
        </aside>
      </div>
    </section>
  );
}
