import { useCallback, useEffect, useRef, useState } from "react";
import {
  actionCollectionGames,
  newAction,
  stepAction,
  idleInput,
  clamp,
  type ActionId,
  type ActionState,
  type Difficulty,
  type ActionMode,
  type ActionInput,
} from "../lib/actionCollection";
import { useAutoPause, type PlayStatus } from "./useAutoPause";
import { useReducedMotion } from "../useReducedMotion";
import "./actionCollection.css";
const artwork = (() => {
  const images: Partial<Record<"car" | "ship", HTMLImageElement>> = {};
  if (typeof Image !== "undefined")
    for (const name of ["car", "ship"] as const) {
      const image = new Image();
      image.src = `${import.meta.env.BASE_URL}art/${name}.webp`;
      images[name] = image;
    }
  return images;
})();
function paint(
  ctx: CanvasRenderingContext2D,
  s: ActionState,
  reducedMotion: boolean,
) {
  const space = ["asteroides", "invasores", "pouso"].includes(s.id);
  const sky = ctx.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, space ? "#071026" : "#162c40");
  sky.addColorStop(1, space ? "#192a43" : "#43606b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 480, 360);
  ctx.fillStyle = "#bbdbef";
  const drift = reducedMotion ? 0 : s.time * (space ? 5 : 1.25);
  for (let i = 0; i < 45; i++) {
    const depth = 1 + (i % 3) * 0.35;
    const size = space ? 1 + (i % 3 === 0 ? 1 : 0) : 1;
    ctx.globalAlpha = 0.12 + (i % 4) * 0.13;
    ctx.fillRect(
      (i * 137) % 480,
      (i * 73 + drift * depth) % 315,
      size,
      size,
    );
  }
  ctx.globalAlpha = 1;
  if (!space) {
    const haze = ctx.createLinearGradient(0, 120, 0, 330);
    haze.addColorStop(0, "rgba(216,236,242,.08)");
    haze.addColorStop(1, "rgba(8,20,26,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 105, 480, 225);
  }
  const circle = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, 1, x, y, r);
    g.addColorStop(0, "#eefbff");
    g.addColorStop(0.3, color);
    g.addColorStop(1, "#173444");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const box = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.fillRect(x + 3, y + 4, w, h);
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.fillRect(x, y, w, 3);
  };
  if (s.id === "drift") {
    ctx.fillStyle = "#263e32";
    ctx.fillRect(0, 0, 480, 360);
    ctx.strokeStyle = "#54616b";
    ctx.lineWidth = 65;
    ctx.beginPath();
    ctx.ellipse(240, 180, 170, 113, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#dce2dc";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);
    ctx.stroke();
    ctx.setLineDash([]);
    const checkpoints = [
      [420, 180],
      [240, 307],
      [60, 180],
      [240, 50],
    ];
    circle(...(checkpoints[s.checkpoint] as [number, number]), 13, "#d7f367");
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.strokeStyle = "rgba(12,20,22,.34)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 10);
    ctx.lineTo(-38, 13);
    ctx.moveTo(-18, -10);
    ctx.lineTo(-38, -13);
    ctx.stroke();
    if (artwork.car?.complete && artwork.car.naturalWidth > 0) {
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(artwork.car, -13, -22, 26, 44);
    } else {
      box(-16, -9, 32, 18, "#d7f367");
      box(0, -6, 9, 12, "#16475a");
    }
    ctx.restore();
  } else if (s.id === "breakout") {
    for (const o of s.objects)
      box(
        o.x - 34,
        o.y - 8,
        68,
        16,
        ["#8ae0d3", "#a8b6fa", "#d7f367"][Math.floor(o.y / 24) % 3],
      );
    box(s.paddle - 42, 326, 84, 9, "#d7f367");
    circle(s.ball.x, s.ball.y, 7, "#ffffff");
  } else if (s.id === "pong") {
    ctx.strokeStyle = "rgba(255,255,255,.25)";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(240, 0);
    ctx.lineTo(240, 360);
    ctx.stroke();
    ctx.setLineDash([]);
    box(18, s.paddle - 36, 9, 72, "#d7f367");
    box(453, s.enemy - 36, 9, 72, "#e59dc9");
    circle(s.ball.x, s.ball.y, 7, "#fff");
  } else {
    if (s.id === "runner") {
      box(0, 308, 480, 52, "#3a4b4f");
      ctx.strokeStyle = "#c7d0b9";
      ctx.setLineDash([18, 18]);
      ctx.beginPath();
      ctx.moveTo(0, 328);
      ctx.lineTo(480, 328);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (s.id === "pouso") {
      box(0, 335, 480, 25, "#78817f");
      box(300, 330, 90, 5, "#d7f367");
      ctx.fillStyle = "#d7f367";
      ctx.font = "12px sans-serif";
      ctx.fillText("POUSO SEGURO", 300, 355);
    }
    for (const o of s.objects) {
      if (o.kind === "gate") {
        box(o.x - 18, 0, 36, o.y - o.r, "#708c99");
        box(o.x - 18, o.y + o.r, 36, 360 - o.y - o.r, "#708c99");
      } else if (o.kind === "barrier") box(o.x - 14, 268, 28, 40, "#ec9c6a");
      else if (o.kind === "invader") {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.beginPath();
        ctx.moveTo(-15, -8);
        ctx.lineTo(-6, 8);
        ctx.lineTo(6, 8);
        ctx.lineTo(15, -8);
        ctx.closePath();
        ctx.fillStyle = "#e59dc9";
        ctx.fill();
        ctx.fillStyle = "#80e7e7";
        ctx.fillRect(-4, -4, 8, 5);
        ctx.restore();
      } else
        circle(
          o.x,
          o.y,
          o.r,
          o.kind === "rock"
            ? "#788996"
            : o.kind === "fuel"
              ? "#d7f367"
              : "#e89b78",
        );
    }
    for (const o of s.shots) {
      ctx.fillStyle = o.kind === "enemy" ? "#ec9c6a" : "#a2f6e8";
      ctx.fillRect(o.x - 2, o.y - 7, 4, 14);
    }
    if (s.cooldown > 0 && Math.floor(s.cooldown * 10) % 2 === 0)
      ctx.globalAlpha = 0.35;
    ctx.save();
    ctx.translate(s.x, s.y);
    if (s.id === "asteroides") ctx.rotate(s.angle + Math.PI / 2);
    if (s.id === "voo" || s.id === "jetpack")
      ctx.rotate(clamp(s.vy / 520, -0.38, 0.38));
    if (s.id === "runner") {
      const swing = reducedMotion ? 0 : Math.sin(s.time * 10) * 5;
      circle(0, -18, 8, "#d7f367");
      box(-7, -9, 14, 23, "#8ae0d3");

      ctx.strokeStyle = "#8ae0d3";
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.lineTo(-12 - swing * 0.35, 5 + swing);
      ctx.moveTo(5, -5);
      ctx.lineTo(12 + swing * 0.35, 5 - swing);
      ctx.stroke();

      const leftHand = { x: -12 - swing * 0.35, y: 5 + swing };
      const rightHand = { x: 12 + swing * 0.35, y: 5 - swing };
      for (const hand of [leftHand, rightHand]) {
        ctx.fillStyle = "#d7f367";
        ctx.beginPath();
        ctx.arc(hand.x, hand.y, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#91a83c";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(hand.x - 1.8, hand.y - 1);
        ctx.lineTo(hand.x - 3.7, hand.y - 2.2);
        ctx.moveTo(hand.x - 0.5, hand.y - 1.8);
        ctx.lineTo(hand.x - 1.1, hand.y - 4);
        ctx.moveTo(hand.x + 0.9, hand.y - 1.6);
        ctx.lineTo(hand.x + 1.3, hand.y - 3.8);
        ctx.moveTo(hand.x + 1.8, hand.y - 0.6);
        ctx.lineTo(hand.x + 3.5, hand.y - 1.8);
        ctx.stroke();
      }

      box(-8, 14, 6, 8, "#d7f367");
      box(3, 14, 6, 8, "#d7f367");
    } else if (s.id === "esquiva") {
      const speed = Math.hypot(s.vx, s.vy);
      if (speed > 8) {
        ctx.strokeStyle = "rgba(215,243,103,.42)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          -clamp(s.vx * 0.08, -18, 18),
          -clamp(s.vy * 0.08, -18, 18),
        );
        ctx.stroke();
      }
      circle(0, 0, 11, "#d7f367");
    }
    else if (
      artwork.ship?.complete &&
      artwork.ship.naturalWidth > 0 &&
      ["asteroides", "invasores", "pouso"].includes(s.id)
    ) {
      ctx.drawImage(artwork.ship, -18, -18, 36, 36);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(13, 12);
      ctx.lineTo(0, 7);
      ctx.lineTo(-13, 12);
      ctx.closePath();
      ctx.fillStyle = "#d7f367";
      ctx.fill();
      ctx.fillStyle = "#7bd4de";
      ctx.fillRect(-3, -4, 6, 9);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  const vignette = ctx.createRadialGradient(240, 170, 90, 240, 180, 330);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.72, "rgba(0,0,0,.04)");
  vignette.addColorStop(1, "rgba(0,0,0,.32)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 480, 360);
}
export default function ActionCollection({
  gameId,
  record,
  onRecord,
}: {
  gameId: string;
  record: number;
  onRecord: (n: number) => void;
}) {
  const id = (actionCollectionGames.find((g) => g.id === gameId)?.id ??
    "breakout") as ActionId;
  const reducedMotion = useReducedMotion();
  const [difficulty, setDifficulty] = useState<Difficulty>("normal"),
    [mode, setMode] = useState<ActionMode>("mission");
  const [status, setStatus] = useState<PlayStatus>("ready"),
    [hud, setHud] = useState(() => newAction(id));
  const state = useRef(hud),
    input = useRef<ActionInput>({ ...idleInput }),
    canvas = useRef<HTMLCanvasElement>(null),
    saved = useRef(false),
    onRecordRef = useRef(onRecord);
  onRecordRef.current = onRecord;
  const pending = useRef(new Set<keyof ActionInput>());
  const pause = useCallback(() => {
    input.current = { ...idleInput };
    pending.current.clear();
    setStatus((p) => (p === "running" ? "paused" : p));
  }, []);
  useAutoPause(pause);
  useEffect(() => {
    const fresh = newAction(id, difficulty, mode);
    state.current = fresh;
    setHud(fresh);
    setStatus("ready");
    saved.current = false;
    input.current = { ...idleInput };
  }, [id, difficulty, mode]);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx) paint(ctx, state.current, reducedMotion);
  }, [hud, status, reducedMotion]);
  useEffect(() => {
    if (status !== "running") return;
    let frame = 0,
      previous = 0,
      accumulator = 0,
      lastHud = 0;
    const run = (now: number) => {
      if (!previous) previous = now;
      accumulator += Math.min((now - previous) / 1000, 0.08);
      previous = now;
      while (accumulator >= 1 / 60) {
        const currentInput = { ...input.current };
        pending.current.forEach((key) => {
          currentInput[key] = true;
        });
        pending.current.clear();
        state.current = stepAction(state.current, currentInput, 1 / 60);
        accumulator -= 1 / 60;
      }
      const ctx = canvas.current?.getContext("2d");
      if (ctx) paint(ctx, state.current, reducedMotion);
      if (now - lastHud > 100) {
        setHud(state.current);
        lastHud = now;
      }
      if (state.current.done) {
        setHud(state.current);
        setStatus("done");
        if (!saved.current) {
          saved.current = true;
          onRecordRef.current(state.current.score);
        }
        return;
      }
      frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [status, reducedMotion]);
  function start() {
    if (status === "paused") {
      setStatus("running");
      canvas.current?.focus();
      return;
    }
    const fresh = newAction(id, difficulty, mode);
    state.current = fresh;
    setHud(fresh);
    saved.current = false;
    input.current = { ...idleInput };
    pending.current.clear();
    setStatus("running");
    canvas.current?.focus();
  }
  function key(e: React.KeyboardEvent<HTMLCanvasElement>, pressed: boolean) {
    if (
      pressed &&
      (status !== "running" || e.altKey || e.ctrlKey || e.metaKey)
    )
      return;
    const map: Record<string, keyof ActionInput> = {
      ArrowLeft: "left",
      a: "left",
      ArrowRight: "right",
      d: "right",
      ArrowUp: "up",
      w: "up",
      ArrowDown: "down",
      s: "down",
      " ": "action",
      Enter: "action",
    };
    const key = map[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (key) {
      e.preventDefault();
      input.current[key] = pressed;
      if (pressed && !e.repeat) pending.current.add(key);
    }
    if (e.key === "Escape" && pressed) pause();
  }
  const definition = actionCollectionGames.find((g) => g.id === id)!;
  const target =
    id === "pong"
      ? 500
      : id === "pouso"
        ? 1000
        : id === "esquiva"
          ? 900
          : id === "drift"
            ? 900
            : 600;
  const controls: Array<[keyof ActionInput, string]> =
    id === "pong"
      ? [
          ["up", "↑ Cima"],
          ["down", "↓ Baixo"],
        ]
      : id === "runner" || id === "voo" || id === "jetpack"
        ? [
            [
              "action",
              id === "runner"
                ? "Saltar"
                : id === "voo"
                  ? "Bater asas"
                  : "Propulsor",
            ],
          ]
        : id === "esquiva" || id === "drift"
          ? [
              ["left", "←"],
              ["up", id === "drift" ? "Acelerar" : "↑"],
              ["down", id === "drift" ? "Frear" : "↓"],
              ["right", "→"],
            ]
          : id === "breakout"
            ? [
                ["left", "← Esquerda"],
                ["right", "Direita →"],
              ]
            : id === "invasores"
              ? [
                  ["left", "←"],
                  ["action", "Disparar"],
                  ["right", "→"],
                ]
              : [
                  ["left", "←"],
                  ["up", id === "pouso" ? "Motor" : "Impulso"],
                  ["right", "→"],
                  ...(["asteroides", "invasores"].includes(id)
                    ? [["action", "Disparar"] as [keyof ActionInput, string]]
                    : []),
                ];
  return (
    <div className="action-collection">
      <div className="action-settings">
        <label>
          Dificuldade
          <select
            aria-label="Dificuldade"
            value={difficulty}
            disabled={status === "running" || status === "paused"}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Fácil</option>
            <option value="normal">Normal</option>
            <option value="hard">Difícil</option>
            <option value="master">Mestre</option>
            <option value="expert">Especialista</option>
          </select>
        </label>
        <label>
          Modo
          <select
            aria-label="Modo"
            value={mode}
            disabled={status === "running" || status === "paused"}
            onChange={(e) => setMode(e.target.value as ActionMode)}
          >
            <option value="mission">Missão · até 3 minutos</option>
            <option value="endless">Resistência · sem limite</option>
          </select>
        </label>
      </div>
      <p className="action-objective">
        {mode === "mission"
          ? `Objetivo: ${target} pontos em até 180 segundos.`
          : "Resista enquanto tiver vidas. Sem limite de tempo."}
      </p>
      <div className="action-hud">
        <span>
          Pontos <strong>{hud.score}</strong>
        </span>
        <span>
          Vidas <strong>{hud.lives}</strong>
        </span>
        <span>
          Etapa <strong>{hud.level}</strong>
        </span>
        <span>
          Tempo <strong>{Math.floor(hud.time)} s</strong>
        </span>
        <span>
          Recorde <strong>{Math.max(record, hud.score)}</strong>
        </span>
      </div>
      {["pouso", "jetpack"].includes(id) && (
        <p className="action-telemetry">
          Combustível: {Math.round(hud.fuel)}% · Velocidade vertical:{" "}
          {Math.round(hud.vy)}
          {id === "pouso" && hud.landingQuality
            ? ` · Último toque: ${{
                soft: "suave",
                controlled: "controlado",
                rough: "duro",
                crash: "impacto",
              }[hud.landingQuality]}`
            : ""}
        </p>
      )}
      <div className="action-canvas-wrap">
        <canvas
          data-expanded-board
          tabIndex={0}
          ref={canvas}
          width={480}
          height={360}
          aria-label={`${definition.name}: área de jogo. ${definition.help}`}
          onKeyDown={(e) => key(e, true)}
          onKeyUp={(e) => key(e, false)}
          onBlur={() => {
            input.current = { ...idleInput };
            pending.current.clear();
          }}
        />
        {status !== "running" && (
          <div className="action-collection-overlay">
            <strong>
              {status === "ready"
                ? "Prepare-se"
                : status === "paused"
                  ? "Jogo pausado"
                  : hud.won
                    ? "Missão completa"
                    : "Partida encerrada"}
            </strong>
            <p>
              {status === "done"
                ? `${hud.score} pontos conquistados`
                : definition.help}
            </p>
            <button onClick={start}>
              {status === "paused"
                ? "Continuar"
                : status === "done"
                  ? "Jogar novamente"
                  : "Começar"}
            </button>
          </div>
        )}
      </div>
      <div className="action-controls" aria-label="Controles do jogo">
        {controls.map(([key, label]) => (
          <button
            key={key}
            aria-label={
              key === "left"
                ? "Esquerda"
                : key === "right"
                  ? "Direita"
                  : key === "up"
                    ? "Cima ou acelerar"
                    : key === "down"
                      ? "Baixo ou frear"
                      : label
            }
            disabled={status !== "running"}
            onClick={(e) => {
              if (e.detail === 0) pending.current.add(key);
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              input.current[key] = true;
              pending.current.add(key);
            }}
            onPointerUp={() => {
              input.current[key] = false;
            }}
            onPointerCancel={() => {
              input.current[key] = false;
            }}
            onLostPointerCapture={() => {
              input.current[key] = false;
            }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                input.current[key] = true;
              }
            }}
            onKeyUp={() => {
              input.current[key] = false;
            }}
            onBlur={() => {
              input.current[key] = false;
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="action-help">
        Fácil: ritmo estável para aprender. Normal e Difícil aumentam a pressão gradualmente.
        Mestre reduz a margem de erro; Especialista usa a curva mais intensa, ainda com limite de velocidade para manter a partida jogável.
      </p>
      <div className="action-footer">
        <button disabled={status !== "running"} onClick={pause}>
          Pausar
        </button>
        <button
          onClick={() => {
            pause();
            setStatus("ready");
          }}
        >
          Nova partida
        </button>
        <p role="status">
          {status === "running"
            ? "Em jogo. Esc pausa."
            : status === "paused"
              ? "Pausado. Continue para retomar."
              : status === "done"
                ? `${hud.score} pontos. ${hud.won ? "Objetivo alcançado." : "Tente outra estratégia."}`
                : "Escolha o modo e a dificuldade antes de começar."}
        </p>
      </div>
    </div>
  );
}
