import { seeded } from "./boardExpansion";
export type MotionObject = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind: string;
  lane: number;
  active: boolean;
};
export type MotionState = {
  id: string;
  difficulty: number;
  seed: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  time: number;
  spawn: number;
  cooldown: number;
  invulnerability: number;
  lives: number;
  score: number;
  combo: number;
  progress: number;
  width: number;
  base: number;
  shots: number;
  objects: MotionObject[];
  status: "ready" | "running" | "paused" | "won" | "lost";
  message: string;
  lastAction: boolean;
  lastLane: number;
  rng: number;
};
export type MotionInput = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  action: boolean;
  lane: number;
};
export const emptyInput = (): MotionInput => ({
  left: false,
  right: false,
  up: false,
  down: false,
  action: false,
  lane: -1,
});
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
function random(s: MotionState) {
  s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
const object = (
  x: number,
  y: number,
  vx: number,
  vy: number,
  r: number,
  kind: string,
  lane = 0,
): MotionObject => ({ x, y, vx, vy, r, kind, lane, active: true });
export function newMotion(id: string, difficulty = 1, seed = 1): MotionState {
  const s: MotionState = {
    id,
    difficulty,
    seed,
    x: 240,
    y: id === "crossroad" ? 340 : id === "rope" ? 300 : 320,
    vx: 0,
    vy: 0,
    angle: id === "turret" || id === "ricochet" ? -Math.PI / 2 : 0,
    time: 0,
    spawn: 0,
    cooldown: 0,
    invulnerability: 0,
    lives: 3,
    score: 0,
    combo: 0,
    progress: 0,
    width: 120,
    base: 240,
    shots: 8,
    objects: [],
    status: "ready",
    message: "Pronto para começar.",
    lastAction: false,
    lastLane: -1,
    rng: seed * 713 + 17,
  };
  if (id === "stack") s.x = 70;
  if (id === "crossroad")
    for (let lane = 0; lane < 6; lane++)
      s.objects.push(
        object(
          (lane * 97) % 480,
          65 + lane * 44,
          (lane % 2 ? 1 : -1) * (55 + difficulty * 20 + lane * 7),
          0,
          25,
          "car",
          lane,
        ),
      );
  if (id === "ricochet") {
    const rng = seeded(seed);
    for (let i = 0; i < 7 + difficulty; i++)
      s.objects.push(
        object(65 + rng() * 350, 45 + rng() * 170, 0, 0, 14, "target"),
      );
  }
  return s;
}
function damage(s: MotionState, text: string) {
  if (s.invulnerability > 0) return;
  s.lives--;
  s.combo = 0;
  s.invulnerability = 0.55;
  s.message = text;
  if (s.lives <= 0) {
    s.status = "lost";
    s.message = "Tentativa encerrada. Reinicie para tentar novamente.";
  }
}
function finish(s: MotionState) {
  s.status = "won";
  s.score += s.lives * 100;
  s.message = "Desafio concluído!";
}
export function motionTarget(
  s: MotionState,
  x: number,
  y: number,
): MotionState {
  if (s.status !== "running" || s.id !== "balloons") return s;
  const next = structuredClone(s);
  const hit = next.objects
    .filter((o) => o.active && Math.hypot(o.x - x, o.y - y) <= o.r + 8)
    .sort((a, b) => a.r - b.r)[0];
  if (hit) {
    hit.active = false;
    if (hit.kind === "bomb") damage(next, "Você acertou um balão de risco.");
    else {
      next.combo++;
      next.score += 20 + Math.min(10, next.combo) * 2;
      next.message = "Balão capturado!";
    }
  }
  return next;
}
export function motionStep(
  state: MotionState,
  input: MotionInput,
  dt: number,
): MotionState {
  if (state.status !== "running") return state;
  const s = structuredClone(state),
    step = clamp(dt, 0, 0.05),
    direction = Number(input.right) - Number(input.left),
    tap = input.action && !s.lastAction,
    laneTap = input.lane >= 0 && input.lane !== s.lastLane,
    f = 1 + s.difficulty * 0.25;
  s.time += step;
  s.spawn -= step;
  s.cooldown = Math.max(0, s.cooldown - step);
  s.invulnerability = Math.max(0, s.invulnerability - step);
  s.lastAction = input.action;
  s.lastLane = input.lane;
  if (s.id === "rhythm") {
    if (s.spawn <= 0) {
      s.spawn = 0.7 / f;
      s.objects.push(
        object(
          60 + Math.floor(random(s) * 4) * 120,
          -20,
          0,
          120 * f,
          18,
          "note",
        ),
      );
      s.objects.at(-1)!.lane = Math.floor(s.objects.at(-1)!.x / 120);
    }
    s.objects.forEach((o) => (o.y += o.vy * step));
    if (laneTap) {
      const note = s.objects
        .filter(
          (o) => o.active && o.lane === input.lane && Math.abs(o.y - 300) < 42,
        )
        .sort((a, b) => Math.abs(a.y - 300) - Math.abs(b.y - 300))[0];
      if (note) {
        note.active = false;
        s.combo++;
        const perfect = Math.abs(note.y - 300) < 15;
        s.score += (perfect ? 100 : 50) + s.combo * 5;
        s.message = perfect ? "Perfeito!" : "Boa batida.";
      } else damage(s, "Fora do tempo.");
    }
    s.objects.forEach((o) => {
      if (o.active && o.y > 350) {
        o.active = false;
        damage(s, "Nota perdida.");
      }
    });
  } else if (s.id === "balloons") {
    if (s.spawn <= 0) {
      s.spawn = 0.85 / f;
      const lane = Math.floor(random(s) * 4);
      s.objects.push(
        object(
          65 + lane * 115,
          390,
          Math.sin(s.time) * 8,
          -(50 + random(s) * 25) * f,
          24,
          random(s) < 0.16 ? "bomb" : "balloon",
          lane,
        ),
      );
    }
    s.objects.forEach((o) => {
      o.x += o.vx * step;
      o.y += o.vy * step;
      if (o.active && o.y < -30) {
        o.active = false;
        if (o.kind !== "bomb") damage(s, "Um balão escapou.");
      }
    });
    if (laneTap) {
      const target = s.objects
        .filter((o) => o.active && o.lane === input.lane)
        .sort((a, b) => a.y - b.y)[0];
      if (target) {
        target.active = false;
        if (target.kind === "bomb") damage(s, "Balão de risco.");
        else {
          s.combo++;
          s.score += 20 + s.combo * 2;
          s.message = "Balão capturado!";
        }
      }
    }
  } else if (s.id === "meteors") {
    s.vx += (direction * 520 - s.vx * 4) * step;
    s.x = clamp(s.x + s.vx * step, 32, 448);
    if (s.spawn <= 0) {
      s.spawn = 0.8 / f;
      s.objects.push(
        object(
          20 + random(s) * 440,
          -20,
          0,
          (75 + random(s) * 55) * f,
          12,
          "meteor",
        ),
      );
    }
    s.objects.forEach((o) => {
      o.y += o.vy * step;
      if (o.active && o.y > 305 && o.y < 345 && Math.abs(o.x - s.x) < 38) {
        o.active = false;
        s.score += 50;
        s.message = "Meteoro interceptado.";
      } else if (o.active && o.y > 365) {
        o.active = false;
        damage(s, "Impacto na base.");
      }
    });
  } else if (s.id === "stack") {
    s.vx = s.vx || 130 * f;
    s.x += s.vx * step;
    if (s.x < s.width / 2 || s.x > 480 - s.width / 2) {
      s.x = clamp(s.x, s.width / 2, 480 - s.width / 2);
      s.vx = -s.vx;
    }
    if (tap) {
      const overlap = s.width - Math.abs(s.x - s.base);
      if (overlap <= 3) {
        s.status = "lost";
        s.message = "O bloco ficou sem apoio.";
      } else {
        const center = (s.x + s.base) / 2;
        s.width = overlap;
        s.base = center;
        s.objects.push(
          object(center, 330 - s.progress * 23, 0, 0, overlap / 2, "block"),
        );
        s.progress++;
        s.score += Math.round(overlap);
        s.x = s.width / 2;
        s.message = `Andar ${s.progress} de 12.`;
        if (s.progress >= 12) finish(s);
      }
    }
  } else if (s.id === "balance") {
    s.angle = clamp(s.angle + direction * 1.4 * step, -0.45, 0.45);
    if (!direction) s.angle *= Math.exp(-step * 0.8);
    s.vx += (Math.sin(s.angle) * 320 + Math.sin(s.time * 2) * 15 * f) * step;
    s.vx *= Math.exp(-step * 0.25);
    s.x += s.vx * step;
    s.score = Math.floor(s.time * 20);
    if (s.x < 38 || s.x > 442) {
      s.status = "lost";
      s.message = "A esfera saiu da plataforma.";
    }
  } else if (s.id === "ski") {
    s.vx += (direction * 600 - s.vx * 3.5) * step;
    s.x = clamp(s.x + s.vx * step, 18, 462);
    if (s.spawn <= 0) {
      s.spawn = 1 / f;
      const gate = s.progress % 3 !== 2;
      s.objects.push(
        object(
          70 + random(s) * 340,
          -30,
          0,
          120 * f,
          gate ? 50 : 18,
          gate ? "gate" : "tree",
        ),
      );
      s.progress++;
    }
    s.objects.forEach((o) => {
      const old = o.y;
      o.y += o.vy * step;
      if (o.active && old < 320 && o.y >= 320) {
        o.active = false;
        if (o.kind === "gate") {
          if (Math.abs(o.x - s.x) < o.r - 10) {
            s.score += 100;
            s.message = "Porta atravessada.";
          } else damage(s, "Você perdeu uma porta.");
        } else if (Math.abs(o.x - s.x) < 30) damage(s, "Colisão com árvore.");
        else s.score += 20;
      }
    });
  } else if (s.id === "crossroad") {
    if (
      s.cooldown <= 0 &&
      (input.up || input.down || input.left || input.right)
    ) {
      s.y = clamp(s.y + (Number(input.down) - Number(input.up)) * 44, 12, 340);
      s.x = clamp(s.x + direction * 44, 22, 458);
      s.cooldown = 0.15;
    }
    s.objects.forEach((o) => {
      o.x += o.vx * step;
      if (o.x < -40) o.x = 520;
      if (o.x > 520) o.x = -40;
      if (Math.abs(o.x - s.x) < o.r + 12 && Math.abs(o.y - s.y) < 23) {
        s.cooldown = 0;
        damage(s, "Colisão na travessia.");
        s.y = 340;
        s.x = 240;
      }
    });
    if (s.y < 40) {
      s.progress++;
      s.score += 300;
      s.y = 340;
      s.message = `Travessia ${s.progress} de 3.`;
      if (s.progress >= 3) finish(s);
    }
  } else if (s.id === "rope") {
    if (tap && s.y >= 299) {
      s.vy = -255;
      s.message = "Salto!";
    }
    s.vy += 640 * step;
    s.y = Math.min(300, s.y + s.vy * step);
    if (s.y === 300) s.vy = 0;
    const previous = s.angle;
    s.angle =
      (s.angle + step * (2.4 + Math.min(1.2, s.time * 0.02)) * f) %
      (Math.PI * 2);
    if (s.angle < previous) {
      if (s.y > 270) damage(s, "A corda tocou seus pés.");
      else {
        s.progress++;
        s.score += 100;
        s.message = `Salto limpo ${s.progress} de 20.`;
        if (s.progress >= 20) finish(s);
      }
    }
  } else if (s.id === "turret") {
    s.angle = clamp(s.angle + direction * 2 * step, -Math.PI + 0.1, -0.1);
    if (input.action && s.cooldown <= 0) {
      s.objects.push(
        object(
          240,
          340,
          Math.cos(s.angle) * 360,
          Math.sin(s.angle) * 360,
          5,
          "bullet",
        ),
      );
      s.cooldown = 0.22;
    }
    if (s.spawn <= 0) {
      s.spawn = 0.95 / f;
      const x = 20 + random(s) * 440;
      s.objects.push(object(x, -20, (240 - x) / 4, 65 * f, 14, "enemy"));
    }
    s.objects.forEach((o) => {
      o.x += o.vx * step;
      o.y += o.vy * step;
    });
    for (const shot of s.objects.filter((o) => o.active && o.kind === "bullet"))
      for (const enemy of s.objects.filter(
        (o) => o.active && o.kind === "enemy",
      ))
        if (Math.hypot(shot.x - enemy.x, shot.y - enemy.y) < enemy.r + shot.r) {
          shot.active = enemy.active = false;
          s.score += 100;
          s.message = "Alvo destruído.";
          break;
        }
    s.objects.forEach((o) => {
      if (o.kind === "enemy" && o.active && o.y > 325) {
        o.active = false;
        damage(s, "Inimigo na base.");
      }
      if (o.kind === "bullet" && (o.y < 0 || o.x < 0 || o.x > 480))
        o.active = false;
    });
  } else if (s.id === "ricochet") {
    s.angle = clamp(s.angle + direction * 1.5 * step, -Math.PI + 0.1, -0.1);
    if (
      tap &&
      s.shots > 0 &&
      !s.objects.some((o) => o.kind === "bullet" && o.active)
    ) {
      s.shots--;
      s.objects.push(
        object(
          240,
          340,
          Math.cos(s.angle) * 320,
          Math.sin(s.angle) * 320,
          6,
          "bullet",
        ),
      );
      s.message = `${s.shots} disparos restantes.`;
    }
    for (const shot of s.objects.filter(
      (o) => o.kind === "bullet" && o.active,
    )) {
      shot.x += shot.vx * step;
      shot.y += shot.vy * step;
      if (shot.x < 6 || shot.x > 474) {
        shot.x = clamp(shot.x, 6, 474);
        shot.vx = -shot.vx;
      }
      if (shot.y < 6) {
        shot.y = 6;
        shot.vy = -shot.vy;
      }
      if (shot.y > 365) shot.active = false;
      for (const target of s.objects.filter(
        (o) => o.kind === "target" && o.active,
      ))
        if (Math.hypot(target.x - shot.x, target.y - shot.y) < 20) {
          target.active = false;
          s.score += 100;
          shot.vy = -shot.vy;
        }
    }
    if (!s.objects.some((o) => o.kind === "target" && o.active)) finish(s);
    else if (
      !s.shots &&
      !s.objects.some((o) => o.kind === "bullet" && o.active)
    ) {
      s.status = "lost";
      s.message = "Disparos esgotados.";
    }
  }
  s.objects = s.objects.filter((o) => o.active);
  if (
    s.time >= 45 &&
    s.status === "running" &&
    !["stack", "rope", "ricochet", "crossroad"].includes(s.id)
  )
    finish(s);
  return s;
}
