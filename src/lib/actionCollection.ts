export const actionCollectionGames = [
  {
    id: "breakout",
    name: "Quebra-blocos",
    description: "Rebata a esfera e abra caminho por paredes de blocos.",
    category: "Casuais",
    help: "Mova a raquete com as setas ou os botões. A posição do impacto e o movimento da raquete mudam o ângulo da esfera; a velocidade de retorno tem limite para manter o controle. Destrua todos os blocos para avançar.",
  },
  {
    id: "pong",
    name: "Pong de Arena",
    description: "Dispute uma partida de reflexos contra a máquina.",
    category: "Casuais",
    help: "Use cima e baixo para mover sua raquete. O ponto de contato e o movimento da raquete aplicam efeito à bola. Marque fazendo a bola passar pelo rival; a velocidade cresce nas trocas, mas tem limite para manter o rally controlável.",
  },
  {
    id: "asteroides",
    name: "Cinturão de Asteroides",
    description: "Gire, acelere e abra uma rota entre rochas espaciais.",
    category: "Tiro",
    help: "Use esquerda e direita para girar, cima para acelerar e Ação para atirar. No vácuo, a nave conserva inércia até novo impulso; os disparos herdam esse movimento. A velocidade tem limite de segurança e as rochas grandes se dividem."
  },
  {
    id: "invasores",
    name: "Invasores da Galáxia",
    description: "Proteja a base contra formações de naves inimigas.",
    category: "Tiro",
    help: "Mova a nave para os lados e mantenha Ação pressionada para disparar. Apenas os invasores expostos na linha de frente atiram; a formação acelera conforme perde integrantes e desce a cada mudança de direção.",
  },
  {
    id: "runner",
    name: "Corrida de Obstáculos",
    description: "Salte barreiras numa pista que acelera a cada etapa.",
    category: "Corrida",
    help: "Pressione cima ou Ação para saltar. Segure para um salto completo ou solte cedo para encurtar a subida e ajustar a aterrissagem. A velocidade aumenta aos poucos; cada obstáculo ultrapassado vale pontos.",
  },
  {
    id: "voo",
    name: "Voo entre Torres",
    description: "Controle a altitude e atravesse corredores estreitos.",
    category: "Casuais",
    help: "Pressione Ação ou cima para bater as asas. Cada toque soma sustentação à velocidade atual: cair rápido exige recuperação gradual, e tocar cedo demais pode gerar excesso de subida. Atravesse as torres sem tocar nas bordas.",
  },
  {
    id: "jetpack",
    name: "Jetpack de Resgate",
    description: "Dose o propulsor, recupere combustível e atravesse túneis.",
    category: "Casuais",
    help: "Mantenha Ação ou cima pressionada para usar o propulsor. Solte para planar e economizar combustível; o tanque não se regenera sozinho. Cada reserva repõe parte do tanque, então planeje a rota entre os obstáculos.",
  },
  {
    id: "esquiva",
    name: "Arena de Esquiva",
    description: "Movimente-se numa arena e sobreviva às ondas cruzadas.",
    category: "Casuais",
    help: "Use as quatro direções para acelerar na arena. Ao soltar, há uma curta inércia antes de parar; antecipe a trajetória das ameaças e corrija o movimento com antecedência.",
  },
  {
    id: "pouso",
    name: "Pouso Lunar",
    description: "Controle a gravidade e pouse com velocidade segura.",
    category: "Inteligência",
    help: "Use os lados para os propulsores de correção e cima ou Ação para o motor principal. Ambos consomem combustível. Sobreviva abaixo de 35 vertical e 25 horizontal, mas pousos suaves e centralizados valem mais pontos.",
  },
  {
    id: "drift",
    name: "Circuito de Drift",
    description: "Acelere, freie e complete voltas num circuito oval.",
    category: "Carros",
    help: "Use os lados para virar, cima ou Ação para acelerar e baixo para frear. Frear durante a curva aumenta a rotação e mantém inércia lateral, permitindo derrapagens controladas. Passe pelos quatro checkpoints na ordem e mantenha o carro na pista.",
  },
] as const;
export type ActionId = (typeof actionCollectionGames)[number]["id"];
export type Difficulty = "easy" | "normal" | "hard" | "master" | "expert";
export type ActionMode = "mission" | "endless";
export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind: string;
  hp: number;
}
export interface ActionState {
  id: ActionId;
  difficulty: Difficulty;
  mode: ActionMode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  paddle: number;
  enemy: number;
  ball: Body;
  objects: Body[];
  shots: Body[];
  score: number;
  lives: number;
  level: number;
  time: number;
  spawn: number;
  cooldown: number;
  fuel: number;
  seed: number;
  done: boolean;
  won: boolean;
  pressed: boolean;
  checkpoint: number;
  invDirection: number;
  landingQuality: "soft" | "controlled" | "rough" | "crash" | null;
}
export interface ActionInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  action: boolean;
}
export const idleInput: ActionInput = {
  left: false,
  right: false,
  up: false,
  down: false,
  action: false,
};
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const body = (
  x: number,
  y: number,
  vx: number,
  vy: number,
  r: number,
  kind: string,
  hp = 1,
): Body => ({ x, y, vx, vy, r, kind, hp });
export function newAction(
  id: ActionId,
  difficulty: Difficulty = "normal",
  mode: ActionMode = "mission",
): ActionState {
  const s: ActionState = {
    id,
    difficulty,
    mode,
    x: id === "drift" ? 240 : id === "pouso" ? 110 : 240,
    y: id === "drift" ? 50 : id === "pouso" ? 40 : id === "runner" ? 286 : 180,
    vx: 0,
    vy: 0,
    angle: id === "drift" ? 0 : -Math.PI / 2,
    paddle: 240,
    enemy: 180,
    ball: body(240, 180, 120, -150, 7, "ball"),
    objects: [],
    shots: [],
    score: 0,
    lives: difficulty === "easy" ? 5 : difficulty === "master" || difficulty === "expert" ? 2 : 3,
    level: 1,
    time: 0,
    spawn: 0,
    cooldown: 0,
    fuel: 100,
    seed: 14831,
    done: false,
    won: false,
    pressed: false,
    checkpoint: 0,
    invDirection: 1,
    landingQuality: null,
  };
  if (id === "breakout")
    s.objects = Array.from({ length: 30 }, (_, i) =>
      body(42 + (i % 6) * 78, 42 + Math.floor(i / 6) * 24, 0, 0, 0, "brick", 1),
    );
  if (id === "invasores")
    s.objects = Array.from({ length: 24 }, (_, i) =>
      body(76 + (i % 8) * 44, 45 + Math.floor(i / 8) * 34, 0, 0, 13, "invader"),
    );
  if (id === "asteroides")
    s.objects = Array.from({ length: 5 }, (_, i) =>
      body(25 + i * 88, 25, 35 - i * 12, 30 + i * 7, 22, "rock"),
    );
  return s;
}
function rand(s: ActionState) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function hit(a: { x: number; y: number }, b: Body, r: number) {
  return Math.hypot(a.x - b.x, a.y - b.y) < r + b.r;
}

export function isExposedInvader(invader: Body, formation: Body[]) {
  return !formation.some(
    (other) =>
      other !== invader &&
      other.hp > 0 &&
      other.kind === "invader" &&
      Math.abs(other.x - invader.x) < 18 &&
      other.y > invader.y,
  );
}

export function invasionFormationFactor(alive: number) {
  const remaining = Math.max(0, Math.min(24, alive));
  return Math.min(1.9, 1 + ((24 - remaining) / 24) * 0.9);
}
function damage(s: ActionState) {
  if (s.cooldown > 0) return;
  s.lives--;
  s.cooldown = 1.1;
  if (s.lives <= 0) s.done = true;
}

export function lunarLandingOutcome(
  x: number,
  vx: number,
  vy: number,
  fuel: number,
) {
  const offset = Math.abs(x - 345);
  const horizontal = Math.abs(vx);
  const vertical = Math.abs(vy);
  const safe = offset < 40 && vertical < 35 && horizontal < 25;
  if (!safe) return { safe: false, quality: "crash" as const, score: 0 };

  const quality: "soft" | "controlled" | "rough" =
    offset <= 18 && vertical <= 16 && horizontal <= 8
      ? "soft"
      : offset <= 28 && vertical <= 25 && horizontal <= 16
        ? "controlled"
        : "rough";
  const bonus = quality === "soft" ? 60 : quality === "controlled" ? 30 : 0;
  return {
    safe: true,
    quality,
    score: Math.round(
      200 + Math.max(0, Math.min(100, fuel)) * 2 + bonus,
    ),
  };
}

export function actionPressure(difficulty: Difficulty, time: number) {
  const ramp = Math.min(1, Math.max(0, time) / 120);
  if (difficulty === "easy") return 0.7;
  if (difficulty === "normal") return 1 + ramp * 0.12;
  if (difficulty === "hard") return 1.4 * (1 + ramp * 0.2);
  if (difficulty === "master") return 1.58 * (1 + ramp * 0.22);
  return Math.min(2.15, 1.72 * (1 + ramp * 0.25));
}

function nextWave(s: ActionState) {
  s.level++;
  const fresh = newAction(s.id, s.difficulty, s.mode);
  s.objects = fresh.objects;
  if (s.id === "asteroides") {
    s.objects = Array.from({ length: Math.min(12, 4 + s.level) }, (_, i) =>
      body(
        25 + ((i * 73) % 440),
        25,
        35 - i * 8,
        30 + s.level * 4 + i * 7,
        22,
        "rock",
      ),
    );
  }
}
export function stepAction(
  state: ActionState,
  input: ActionInput,
  delta: number,
): ActionState {
  if (state.done) return state;
  const dt = clamp(delta, 0, 0.04),
    s = {
      ...state,
      ball: { ...state.ball },
      objects: state.objects.map((o) => ({ ...o })),
      shots: state.shots.map((o) => ({ ...o })),
    };
  // Pressure grows gradually by level and stays capped so long sessions remain playable.
  const f = actionPressure(s.difficulty, s.time);
  s.time += dt;
  s.spawn += dt;
  s.cooldown = Math.max(0, s.cooldown - dt);
  const action = input.action || input.up,
    wasPressed = s.pressed,
    tap = action && !wasPressed,
    released = !action && wasPressed;
  s.pressed = action;
  if (s.id === "breakout" || s.id === "pong") {
    const b = s.ball;
    b.x += b.vx * dt * f;
    b.y += b.vy * dt * f;
    if (s.id === "breakout") {
      const paddleVelocity =
        ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 320;
      s.paddle = clamp(s.paddle + paddleVelocity * dt, 45, 435);
      if (b.x < 7 || b.x > 473) {
        b.x = clamp(b.x, 7, 473);
        b.vx *= -1;
      }
      if (b.y < 7) {
        b.y = 7;
        b.vy = Math.abs(b.vy);
      }
      if (
        b.vy > 0 &&
        b.y >= 316 &&
        b.y <= 333 &&
        Math.abs(b.x - s.paddle) < 49
      ) {
        b.y = 315;
        b.vy = -Math.min(340, Math.abs(b.vy) + 3);
        b.vx = clamp(
          (b.x - s.paddle) * 5 + paddleVelocity * 0.16,
          -300,
          300,
        );
      }
      const index = s.objects.findIndex(
        (o) => Math.abs(b.x - o.x) < 39 && Math.abs(b.y - o.y) < 15,
      );
      if (index >= 0) {
        s.objects.splice(index, 1);
        b.vy *= -1;
        s.score += 10;
      }
      if (b.y > 370) {
        damage(s);
        s.ball = body(240, 180, 110, -150, 7, "ball");
      }
      if (!s.objects.length) {
        nextWave(s);
        s.ball = body(240, 180, 120, -160 - s.level * 8, 7, "ball");
      }
    } else {
      const paddleVelocity =
        ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * 300;
      s.paddle = clamp(s.paddle + paddleVelocity * dt, 40, 320);
      const enemyStep = clamp(b.y - s.enemy, -160 * f * dt, 160 * f * dt);
      const enemyVelocity = dt > 0 ? enemyStep / dt : 0;
      s.enemy += enemyStep;
      if (b.y < 7 || b.y > 353) {
        b.y = clamp(b.y, 7, 353);
        b.vy *= -1;
      }
      if (b.vx < 0 && b.x <= 29 && b.x >= 15 && Math.abs(b.y - s.paddle) < 43) {
        b.x = 30;
        b.vx = Math.min(320, Math.abs(b.vx) + 8);
        b.vy = clamp((b.y - s.paddle) * 4 + paddleVelocity * 0.22, -260, 260);
      }
      if (
        b.vx > 0 &&
        b.x >= 451 &&
        b.x <= 466 &&
        Math.abs(b.y - s.enemy) < 43
      ) {
        b.x = 450;
        b.vx = -Math.min(320, Math.abs(b.vx) + 5);
        b.vy = clamp((b.y - s.enemy) * 4 + enemyVelocity * 0.18, -260, 260);
      }
      if (b.x > 490) {
        s.score += 100;
        s.ball = body(240, 180, -140, 90, 7, "ball");
        s.level++;
      }
      if (b.x < -10) {
        damage(s);
        s.ball = body(240, 180, 140, 90, 7, "ball");
      }
    }
  } else if (s.id === "asteroides") {
    s.angle += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 3 * dt;
    if (input.up) {
      s.vx += Math.cos(s.angle) * 150 * dt;
      s.vy += Math.sin(s.angle) * 150 * dt;
    }
    const shipSpeed = Math.hypot(s.vx, s.vy);
    if (shipSpeed > 260) {
      const scale = 260 / shipSpeed;
      s.vx *= scale;
      s.vy *= scale;
    }
    s.x = (s.x + s.vx * dt + 480) % 480;
    s.y = (s.y + s.vy * dt + 360) % 360;
    if (input.action && s.spawn > 0.2) {
      s.spawn = 0;
      s.shots.push(
        body(
          s.x,
          s.y,
          Math.cos(s.angle) * 330 + s.vx,
          Math.sin(s.angle) * 330 + s.vy,
          3,
          "laser",
          1.6,
        ),
      );
    }
    for (const o of s.objects) {
      o.x = (o.x + o.vx * dt * f + 480) % 480;
      o.y = (o.y + o.vy * dt * f + 360) % 360;
      if (hit(s, o, 10)) damage(s);
    }
    for (const shot of s.shots) {
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.hp -= dt;
      const o = s.objects.find((o) => o.hp > 0 && hit(shot, o, 0));
      if (o) {
        o.hp = 0;
        shot.hp = 0;
        s.score += o.r > 15 ? 20 : 40;
        if (o.r > 15)
          s.objects.push(
            body(o.x, o.y, 70, -40, 11, "rock"),
            body(o.x, o.y, -60, 50, 11, "rock"),
          );
      }
    }
    s.shots = s.shots.filter((o) => o.hp > 0);
    s.objects = s.objects.filter((o) => o.hp > 0);
    if (!s.objects.length) {
      nextWave(s);
      s.cooldown = 1.5;
    }
  } else if (s.id === "invasores") {
    s.x = clamp(
      s.x + ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 240 * dt,
      18,
      462,
    );
    s.y = 324;
    if (input.action && s.spawn > 0.23) {
      s.spawn = 0;
      s.shots.push(body(s.x, 310, 0, -350, 3, "laser"));
    }
    const aliveInvaders = s.objects.filter((o) => o.hp > 0).length;
    const speed =
      (22 + s.level * 7) * f * invasionFormationFactor(aliveInvaders);
    const edge = s.objects.some((o) => o.x < 20 || o.x > 460);
    if (edge) {
      s.invDirection *= -1;
      for (const o of s.objects) {
        o.y += 16;
        o.x = clamp(o.x, 21, 459);
      }
    }
    for (const o of s.objects) {
      o.x += speed * s.invDirection * dt;
      if (o.y > 297) {
        damage(s);
        o.hp = 0;
      }
      if (isExposedInvader(o, s.objects) && rand(s) < dt * 0.08 * f)
        s.shots.push(body(o.x, o.y, 0, 130 * f, 4, "enemy"));
    }
    for (const shot of s.shots) {
      shot.y += shot.vy * dt;
      if (shot.kind === "laser") {
        const o = s.objects.find((o) => o.hp > 0 && hit(shot, o, 0));
        if (o) {
          o.hp = 0;
          shot.hp = 0;
          s.score += 25;
        }
      } else if (hit(s, shot, 13)) {
        damage(s);
        shot.hp = 0;
      }
    }
    s.objects = s.objects.filter((o) => o.hp > 0);
    s.shots = s.shots.filter((o) => o.hp > 0 && o.y > 0 && o.y < 360);
    if (!s.objects.length) nextWave(s);
  } else if (s.id === "runner") {
    s.x = 88;
    if (tap && s.y >= 285) s.vy = -370;
    if (released && s.vy < -90) s.vy *= 0.55;
    s.vy += 950 * dt;
    s.y = Math.min(286, s.y + s.vy * dt);
    if (s.y === 286) s.vy = 0;
    const speed = (170 + Math.min(150, s.time * 1.1)) * f;
    if (s.spawn > 1.7 / f) {
      s.spawn = 0;
      s.objects.push(body(510, 286, 0, 0, 18, "barrier"));
    }
    for (const o of s.objects) {
      o.x -= speed * dt;
      if (Math.abs(o.x - s.x) < 29 && s.y > 246) damage(s);
      if (o.x < 45 && o.hp === 1) {
        o.hp = 2;
        s.score += 25;
      }
    }
    s.objects = s.objects.filter((o) => o.x > -30);
    s.level = 1 + Math.floor(s.time / 20);
  } else if (s.id === "voo" || s.id === "jetpack") {
    s.x = 95;
    const jet = s.id === "jetpack";
    if (!jet && tap) s.vy = clamp(s.vy - 170, -220, 260);
    s.vy += (jet ? (action && s.fuel > 0 ? -480 : 290) : 480) * dt;
    s.vy = clamp(s.vy, -220, 260);
    s.y += s.vy * dt;
    if (jet && action && s.fuel > 0)
      s.fuel = clamp(s.fuel - 22 * dt, 0, 100);
    if (s.y < 12 || s.y > 348) {
      damage(s);
      s.y = 180;
      s.vy = 0;
    }
    const gap =
      s.difficulty === "easy" ? 150 : s.difficulty === "hard" ? 105 : 125;
    if (s.spawn > 2.5 / f) {
      s.spawn = 0;
      const gateY = 85 + rand(s) * 190;
      s.objects.push(body(510, gateY, 0, 0, gap / 2, "gate"));
      if (jet) s.objects.push(body(570, gateY, 0, 0, 13, "fuel"));
    }
    for (const o of s.objects) {
      o.x -= 120 * f * dt;
      if (o.kind === "gate") {
        if (Math.abs(o.x - s.x) < 30 && Math.abs(s.y - o.y) > o.r - 10)
          damage(s);
        if (o.x < s.x - 35 && o.hp === 1) {
          o.hp = 2;
          s.score += 40;
        }
      } else if (hit(s, o, 10)) {
        s.fuel = clamp(s.fuel + 45, 0, 100);
        o.hp = 0;
        s.score += 15;
      }
    }
    s.objects = s.objects.filter((o) => o.x > -40 && o.hp > 0);
    s.level = 1 + Math.floor(s.time / 25);
  } else if (s.id === "esquiva") {
    const ax = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const ay = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    s.vx = clamp(s.vx + ax * 900 * dt, -210, 210);
    s.vy = clamp(s.vy + ay * 900 * dt, -210, 210);
    const drag = Math.exp(-6 * dt);
    s.vx *= drag;
    s.vy *= drag;
    const nextX = clamp(s.x + s.vx * dt, 14, 466);
    const nextY = clamp(s.y + s.vy * dt, 14, 346);
    if ((nextX === 14 && s.vx < 0) || (nextX === 466 && s.vx > 0)) s.vx = 0;
    if ((nextY === 14 && s.vy < 0) || (nextY === 346 && s.vy > 0)) s.vy = 0;
    s.x = nextX;
    s.y = nextY;
    if (s.spawn > 0.7 / f) {
      s.spawn = 0;
      const side = Math.floor(rand(s) * 4),
        x = side === 0 ? -10 : side === 1 ? 490 : rand(s) * 480,
        y = side === 2 ? -10 : side === 3 ? 370 : rand(s) * 360;
      const a = Math.atan2(s.y - y, s.x - x);
      s.objects.push(
        body(
          x,
          y,
          Math.cos(a) * (85 + s.level * 7) * f,
          Math.sin(a) * (85 + s.level * 7) * f,
          8,
          "danger",
        ),
      );
    }
    for (const o of s.objects) {
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      if (hit(s, o, 10)) {
        damage(s);
        o.hp = 0;
      }
    }
    s.objects = s.objects.filter(
      (o) => o.hp && o.x > -25 && o.x < 505 && o.y > -25 && o.y < 385,
    );
    s.score = Math.floor(s.time * 10);
    s.level = 1 + Math.floor(s.time / 15);
  } else if (s.id === "pouso") {
    const lateral = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (lateral && s.fuel > 0) {
      s.vx += lateral * 45 * dt;
      s.fuel = Math.max(0, s.fuel - 3.5 * dt);
    }
    s.vy += 35 * f * dt;
    if (action && s.fuel > 0) {
      s.vy -= 85 * dt;
      s.fuel = Math.max(0, s.fuel - 12 * dt);
    }
    s.x = clamp(s.x + s.vx * dt, 10, 470);
    s.y = Math.max(10, s.y + s.vy * dt);
    if (s.y >= 320) {
      const landing = lunarLandingOutcome(s.x, s.vx, s.vy, s.fuel);
      s.landingQuality = landing.quality;
      if (landing.safe) {
        s.score += landing.score;
        s.level++;
        s.x = 80 + rand(s) * 180;
        s.y = 35;
        s.vx = 0;
        s.vy = 0;
        s.fuel = 100;
        s.cooldown = 0.5;
      } else {
        damage(s);
        s.x = 110;
        s.y = 40;
        s.vx = 0;
        s.vy = 0;
        s.fuel = 100;
      }
    }
  } else {
    const turn = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const speedRatio = clamp(Math.abs(s.vx) / 40, 0.15, 1);
    const steeringGain = input.down ? 1.35 : 1;
    s.angle += turn * 2.2 * steeringGain * dt * speedRatio;
    s.vx = clamp(
      s.vx + ((action ? 95 : 0) - (input.down ? 180 : 0) - s.vx * 0.42) * dt,
      0,
      220 * f,
    );
    const slipTarget = -turn * s.vx * (input.down ? 0.38 : 0.1);
    const gripResponse = input.down ? 3.2 : 6;
    s.vy += (slipTarget - s.vy) * Math.min(1, gripResponse * dt);
    s.x +=
      (Math.cos(s.angle) * s.vx - Math.sin(s.angle) * s.vy) * dt;
    s.y +=
      (Math.sin(s.angle) * s.vx + Math.cos(s.angle) * s.vy) * dt;
    s.vy *= Math.exp(-(input.down ? 1.6 : 5) * dt);
    const radius = Math.sqrt(
      ((s.x - 240) / 190) ** 2 + ((s.y - 180) / 130) ** 2,
    );
    if (radius < 0.65 || radius > 1.13) {
      s.vx *= Math.exp(-4 * dt);
      if (s.spawn > 2) {
        s.spawn = 0;
        damage(s);
      }
    }
    s.x = clamp(s.x, 8, 472);
    s.y = clamp(s.y, 8, 352);
    const checkpoints = [
      [420, 180],
      [240, 307],
      [60, 180],
      [240, 50],
    ];
    const goal = checkpoints[s.checkpoint];
    if (Math.hypot(s.x - goal[0], s.y - goal[1]) < 48) {
      s.checkpoint = (s.checkpoint + 1) % 4;
      s.score += 50;
      if (s.checkpoint === 0) {
        s.level++;
        s.score += 100;
      }
    }
  }
  const target =
    s.id === "pong"
      ? 500
      : s.id === "pouso"
        ? 1000
        : s.id === "esquiva"
          ? 900
          : s.id === "drift"
            ? 900
            : 600;
  if (s.mode === "mission" && (s.score >= target || s.time >= 180)) {
    s.won = s.score >= target;
    s.done = true;
  }
  return s;
}
