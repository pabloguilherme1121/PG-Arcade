export const casualGames = [
  {
    id: "vinteum",
    name: "Vinte e Um",
    category: "Casuais",
    description: "Cartas, estratégia e uma mesa sem apostas.",
    help: "Peça cartas ou pare perto de 21. O ás vale 1 ou 11. A banca segue a regra de 17; no Difícil compra em soft 17, e no Fácil a carta fechada fica visível.",
  },
  {
    id: "dados",
    name: "Dados de Combinação",
    category: "Casuais",
    description: "Guarde dados e construa a melhor combinação.",
    help: "Você tem três lançamentos por rodada. Toque nos dados para guardá-los e maximize pares, trincas, sequências ou cinco iguais.",
  },
  {
    id: "boliche",
    name: "Boliche de Precisão",
    category: "Casuais",
    description: "Leia a pista e derrube os dez pinos.",
    help: "Ajuste a direção e a força da bola. Cada rodada permite dois lançamentos; os pinos derrubados continuam fora na segunda tentativa.",
  },
  {
    id: "basquete",
    name: "Basquete de Rua",
    category: "Casuais",
    description: "Encontre o arco perfeito para acertar a cesta.",
    help: "Combine ângulo e força para lançar a bola. Ela precisa cruzar o aro descendo; uma entrada central vale cesta limpa e entradas próximas podem tocar no aro. O vento muda entre rodadas."
  },
  {
    id: "golfe",
    name: "Mini Golfe",
    category: "Casuais",
    description: "Superfícies, barreiras e tacadas planejadas.",
    help: "Ajuste a força e a direção para levar a bola ao buraco. Evite a barreira; cada tacada parte da posição onde a bola parou.",
  },
  {
    id: "arco",
    name: "Arco e Flecha",
    category: "Casuais",
    description: "Compense o vento e mire no centro do alvo.",
    help: "Ajuste altura e força. A flecha percorre um arco visível: baixa potência aumenta queda e tempo exposto ao vento. Compense a trajetória e tente chegar ao centro."
  },
  {
    id: "pesca",
    name: "Pesca de Lago",
    category: "Casuais",
    description: "Fisgue no momento certo e controle a tensão.",
    help: "Lance a linha, espere a mordida e fisgue enquanto o indicador está verde. Recolha sem elevar demais a tensão ou o peixe escapará.",
  },
  {
    id: "match3",
    name: "Joias em Cascata",
    category: "Inteligência",
    description: "Trocas, combinações e reações em cadeia.",
    help: "Selecione duas joias vizinhas para trocar. A troca precisa formar uma linha de três ou mais. As cascatas somam pontos e gastam uma jogada.",
  },
] as const;
export function handValue(cards: number[]) {
  let total = cards.reduce((s, c) => s + (c === 1 ? 11 : Math.min(c, 10)), 0);
  let aces = cards.filter((c) => c === 1).length;
  while (total > 21 && aces-- > 0) total -= 10;
  return total;
}

export function dealerShouldHit(cards: number[], difficulty: number) {
  const value = handValue(cards);
  if (value < 17) return true;
  if (value > 17) return false;
  const hardTotal = cards.reduce(
    (sum, card) => sum + (card === 1 ? 1 : Math.min(card, 10)),
    0,
  );
  const soft = cards.includes(1) && hardTotal + 10 === value;
  return difficulty >= 2 && soft;
}
export function card(random = Math.random) {
  return 1 + Math.floor(random() * 13);
}
export function diceScore(values: number[]) {
  const counts = Array.from(
    { length: 6 },
    (_, i) => values.filter((v) => v === i + 1).length,
  );
  const unique = [...new Set(values)].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  if (counts.includes(5)) return 100 + sum;
  if (unique.length === 5 && unique[4] - unique[0] === 4) return 80 + sum;
  if (counts.includes(4)) return 60 + sum;
  if (counts.includes(3) && counts.includes(2)) return 50 + sum;
  if (counts.includes(3)) return 30 + sum;
  return sum + counts.filter((n) => n === 2).length * 10;
}
export function matches(board: number[]) {
  const found = new Set<number>();
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 6; c++) {
      const i = r * 6 + c;
      if (board[i] < 0) continue;
      if (c < 4 && board[i] === board[i + 1] && board[i] === board[i + 2]) {
        for (let x = c; x < 6 && board[r * 6 + x] === board[i]; x++)
          found.add(r * 6 + x);
      }
      if (r < 4 && board[i] === board[i + 6] && board[i] === board[i + 12]) {
        for (let y = r; y < 6 && board[y * 6 + c] === board[i]; y++)
          found.add(y * 6 + c);
      }
    }
  return [...found];
}
export function moveGridCursor(
  index: number,
  key: string,
  size: number,
  total: number,
) {
  const row = Math.floor(index / size);
  const col = index % size;
  if (key === "ArrowLeft") return col === 0 ? index : index - 1;
  if (key === "ArrowRight") return col === size - 1 ? index : index + 1;
  if (key === "ArrowUp") return row === 0 ? index : index - size;
  if (key === "ArrowDown")
    return index + size >= total ? index : index + size;
  return index;
}

export function adjacent(a: number, b: number) {
  return (
    a !== b &&
    ((Math.floor(a / 6) === Math.floor(b / 6) && Math.abs(a - b) === 1) ||
      Math.abs(a - b) === 6)
  );
}
export function swapJewels(board: number[], a: number, b: number) {
  if (!adjacent(a, b)) return null;
  const copy = [...board];
  [copy[a], copy[b]] = [copy[b], copy[a]];
  return matches(copy).length ? copy : null;
}
export function settleJewels(board: number[], random = Math.random) {
  let next = [...board],
    score = 0,
    chains = 0;
  for (let chain = 1; chain <= 12; chain++) {
    const hit = matches(next);
    if (!hit.length) break;
    chains++;
    score += hit.length * 10 * chain;
    for (const i of hit) next[i] = -1;
    for (let c = 0; c < 6; c++) {
      const column = Array.from(
        { length: 6 },
        (_, r) => next[r * 6 + c],
      ).filter((v) => v >= 0);
      while (column.length < 6) column.unshift(Math.floor(random() * 5));
      for (let r = 0; r < 6; r++) next[r * 6 + c] = column[r];
    }
  }
  if (matches(next).length) next = makeJewels(random);
  return { board: next, score, chains };
}
export function makeJewels(random = Math.random) {
  const board: number[] = [];
  for (let i = 0; i < 36; i++) {
    let v = Math.floor(random() * 5);
    while (
      (i % 6 >= 2 && board[i - 1] === v && board[i - 2] === v) ||
      (i >= 12 && board[i - 6] === v && board[i - 12] === v)
    )
      v = (v + 1) % 5;
    board.push(v);
  }
  return board;
}
export function hasJewelMove(board: number[]) {
  return board.some((_, i) =>
    [i + 1, i + 6].some((j) => j < 36 && swapJewels(board, i, j) !== null),
  );
}
export type FlightPoint = { x: number; y: number };
export function projectile(
  angle: number,
  power: number,
  wind: number,
  start: FlightPoint = { x: 35, y: 245 },
) {
  const radians = (angle * Math.PI) / 180;
  const speed = power * 1.5;
  const points: FlightPoint[] = [];
  for (let t = 0; t <= 5; t += 0.06) {
    const x = start.x + Math.cos(radians) * speed * t + wind * t * t * 0.5;
    const y = start.y - Math.sin(radians) * speed * t + 25 * t * t;
    points.push({ x, y });
    if (y > 260 || x > 380) break;
  }
  return points;
}
export type BasketEntryQuality = "swish" | "rim" | "miss";

export function basketEntryQuality(
  points: FlightPoint[],
  tolerance = 12,
): BasketEntryQuality {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i];
    if (a.y <= 125 && b.y >= 125 && b.y > a.y) {
      const x = a.x + ((b.x - a.x) * (125 - a.y)) / (b.y - a.y);
      const offset = Math.abs(x - 285);
      if (offset <= Math.max(4, tolerance * 0.4)) return "swish";
      if (offset <= tolerance) return "rim";
    }
  }
  return "miss";
}

export function basketHit(points: FlightPoint[], tolerance = 12) {
  return basketEntryQuality(points, tolerance) !== "miss";
}

export function arrowImpact(aim: number, power: number, wind: number) {
  const normalizedPower = Math.max(10, Math.min(100, power));
  const flightFactor = Math.pow(100 / normalizedPower, 1.25);
  return (
    aim +
    wind * flightFactor * 2 +
    (100 - normalizedPower) * 0.18
  );
}

export function arrowTrajectory(
  aim: number,
  power: number,
  wind: number,
): FlightPoint[] {
  const impact = arrowImpact(aim, power, wind);
  const normalizedPower = Math.max(10, Math.min(100, power));
  const lift = 12 + (100 - normalizedPower) * 0.08;
  return Array.from({ length: 13 }, (_, index) => {
    const t = index / 12;
    const x = 30 + (305 - 30) * t;
    const base = 150 + (aim - 150) * t;
    const arc = -lift * 4 * t * (1 - t);
    const driftAndDrop = (impact - aim) * t * t;
    return { x, y: base + arc + driftAndDrop };
  });
}
export function arrowPoints(y: number, tolerance = 1) {
  return Math.max(0, 100 - Math.round(Math.abs(y - 150) * tolerance));
}
export function bowlingTrajectory(
  aim: number,
  power: number,
  hook = 0,
): FlightPoint[] {
  const normalizedAim = Math.max(0, Math.min(100, aim));
  const normalizedPower = Math.max(10, Math.min(100, power));
  const normalizedHook = Math.max(-100, Math.min(100, hook));
  const line = 150 + (normalizedAim - 50) * 1.8;
  const hookScale = Math.max(0.11, 0.24 - normalizedPower * 0.0011);
  const hookOffset = normalizedHook * hookScale;

  return Array.from({ length: 13 }, (_, index) => {
    const t = index / 12;
    const lateHook = hookOffset * Math.pow(t, 2.35);
    return {
      x: 150 + (line - 150) * t + lateHook,
      y: 240 - 170 * t,
    };
  });
}

export function bowlingHit(
  pins: boolean[],
  aim: number,
  power: number,
  difficulty = 1,
  hook = 0,
) {
  const normalizedPower = Math.max(0, Math.min(100, power));
  const trajectory = bowlingTrajectory(aim, normalizedPower, hook);
  const line = trajectory.at(-1)?.x ?? 150;
  const positions = pins.map((_, i) => {
    const row = Math.floor((Math.sqrt(8 * i + 1) - 1) / 2);
    const first = (row * (row + 1)) / 2;
    return {
      x: 150 + (i - first - row / 2) * 28,
      y: 60 + row * 18,
    };
  });
  const directRadius =
    10 + normalizedPower * Math.max(0.11, 0.18 - difficulty * 0.025);
  const directlyHit = new Set<number>();
  pins.forEach((standing, i) => {
    if (standing && Math.abs(positions[i].x - line) <= directRadius)
      directlyHit.add(i);
  });

  const carryRadius =
    20 + normalizedPower * 0.15 - Math.max(0, difficulty) * 1;
  const knocked = new Set(directlyHit);
  pins.forEach((standing, i) => {
    if (!standing || knocked.has(i)) return;
    if (
      [...directlyHit].some((hitIndex) => {
        const dx = positions[i].x - positions[hitIndex].x;
        const dy = positions[i].y - positions[hitIndex].y;
        return Math.hypot(dx, dy) <= carryRadius;
      })
    )
      knocked.add(i);
  });

  return pins.map((standing, i) => standing && !knocked.has(i));
}
export function fishingReelStep(
  distance: number,
  tension: number,
  difficulty: number,
) {
  const level = Math.max(0, Math.min(2, difficulty));
  const progress = Math.max(6, 14 - tension * 0.065 - level);
  const tensionGain = 18 + level * 3 + Math.max(0, 45 - tension) * 0.035;
  return {
    distance: Math.max(0, distance - progress),
    tension: Math.min(100, tension + tensionGain),
  };
}

export function fishingTensionTick(
  tension: number,
  tick: number,
  difficulty: number,
) {
  const level = Math.max(0, Math.min(2, difficulty));
  const recovery = level === 2 ? 3 : 5;
  const pullEvery = 12 - level * 2;
  const pull = tick > 0 && tick % pullEvery === 0 ? 4 + level * 3 : 0;
  return Math.max(0, Math.min(100, tension - recovery + pull));
}

export function golfStroke(
  position: number,
  aim: number,
  power: number,
  barrier: boolean,
) {
  const normalizedAim = Math.max(0, Math.min(100, aim));
  const normalizedPower = Math.max(0, Math.min(100, power));
  const angle = ((normalizedAim - 50) * 1.2 * Math.PI) / 180;
  const alignment = Math.max(0.45, Math.cos(angle));
  let next = Math.min(
    340,
    Math.max(15, position + normalizedPower * 2.8 * alignment),
  );
  if (barrier && position < 180 && next > 180 && normalizedPower < 72)
    next = 165;
  return {
    position: next,
    hole: Math.abs(next - 320) < 12 && normalizedPower <= 55,
  };
}
