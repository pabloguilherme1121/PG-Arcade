export const logicGames = [
  {
    id: "sudoku",
    name: "Sudoku Compacto",
    description: "Complete linhas, colunas e regiões sem repetir números.",
    category: "Inteligência",
    help: "Selecione uma casa vazia e um número. Cada linha, coluna e região deve conter todos os números uma vez. As pistas são fixas.",
  },
  {
    id: "nonograma",
    name: "Nonograma",
    description: "Desenhe a figura escondida seguindo as pistas.",
    category: "Inteligência",
    help: "Os números indicam grupos consecutivos de casas pintadas. Separe grupos com ao menos uma casa vazia. Marque vazios com o modo X.",
  },
  {
    id: "labirinto",
    name: "Labirinto",
    description: "Encontre a saída entre corredores e becos.",
    category: "Inteligência",
    help: "Use as setas ou os botões de direção para chegar à saída dourada. As paredes bloqueiam o caminho. Uma dica mostra o próximo passo.",
  },
  {
    id: "sokoban",
    name: "Sokoban",
    description: "Empurre caixas até os depósitos sem prender nenhuma.",
    category: "Inteligência",
    help: "Empurre cada caixa até um alvo dourado. Você pode empurrar uma caixa por vez, mas não puxá-la. Desfaça uma jogada se ficar preso.",
  },
  {
    id: "hanoi",
    name: "Torres de Hanói",
    description: "Transfira os discos respeitando a ordem de tamanho.",
    category: "Inteligência",
    help: "Selecione a torre de origem e depois a de destino. Só o disco do topo se move. Um disco maior nunca pode ficar sobre um menor.",
  },
  {
    id: "senha",
    name: "Código Secreto",
    description: "Descubra o código usando pistas de posição e cor.",
    category: "Inteligência",
    help: "Escolha os dígitos e envie seu palpite. Exatos contam dígitos na posição correta; deslocados contam dígitos certos em outra posição. Repetições são permitidas.",
  },
  {
    id: "nim",
    name: "Nim Estratégico",
    description: "Retire peças e vença uma disputa matemática.",
    category: "Estratégia",
    help: "Em cada turno retire uma ou mais peças de uma única pilha. No modo normal ganha quem tira a última; no modo reverso quem tira a última perde.",
  },
  {
    id: "reversi",
    name: "Reversi",
    description: "Cerque peças adversárias e conquiste o tabuleiro.",
    category: "Estratégia",
    help: "Coloque uma peça onde cercar uma linha adversária entre duas suas. Todas as peças cercadas viram. Sem jogada legal, o turno passa. Mais peças vence.",
  },
  {
    id: "batalha",
    name: "Batalha Naval",
    description: "Localize uma frota escondida com tiros limitados.",
    category: "Estratégia",
    help: "Toque uma casa para disparar. As embarcações ocupam linhas contínuas sem sobreposição. Acerte todos os segmentos antes de acabar sua munição.",
  },
  {
    id: "pontes",
    name: "Pontos e Caixas",
    description: "Feche quadrados e dispute território.",
    category: "Estratégia",
    help: "Ligue dois pontos vizinhos escolhendo uma aresta. Ao completar os quatro lados de um quadrado, ele é seu e você joga novamente. Mais caixas vence.",
  },
] as const;

export function codeFeedback(secret: number[], guess: number[]) {
  let exact = 0;
  const a: number[] = [],
    b: number[] = [];
  secret.forEach((v, i) => {
    if (v === guess[i]) exact++;
    else {
      a.push(v);
      b.push(guess[i]);
    }
  });
  let misplaced = 0;
  b.forEach((v) => {
    const i = a.indexOf(v);
    if (i >= 0) {
      misplaced++;
      a.splice(i, 1);
    }
  });
  return { exact, misplaced };
}
export function sudokuSolution(size: number, seed: number) {
  const box = size === 4 ? 2 : 3;
  return Array.from(
    { length: size * size },
    (_, i) =>
      ((Math.floor(i / size) * box +
        Math.floor(Math.floor(i / size) / box) +
        (i % size) +
        seed) %
        size) +
      1,
  );
}
export function validSudoku(values: number[], size: number) {
  if (
    values.length !== size * size ||
    values.some((v) => !Number.isInteger(v) || v < 1 || v > size)
  )
    return false;
  const box = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    if (
      new Set(values.slice(i * size, (i + 1) * size)).size !== size ||
      new Set(values.filter((_, n) => n % size === i)).size !== size
    )
      return false;
  }
  for (let r = 0; r < size; r += box)
    for (let c = 0; c < size; c += box) {
      const region = [];
      for (let y = 0; y < box; y++)
        for (let x = 0; x < box; x++)
          region.push(values[(r + y) * size + c + x]);
      if (new Set(region).size !== size) return false;
    }
  return true;
}
export function runs(values: boolean[]) {
  const out: number[] = [];
  let n = 0;
  for (const v of [...values, false]) {
    if (v) n++;
    else if (n) {
      out.push(n);
      n = 0;
    }
  }
  return out.length ? out : [0];
}
export function hanoiMove(towers: number[][], from: number, to: number) {
  if (from === to || !towers[from]?.length || !towers[to]) return null;
  const disk = towers[from].at(-1)!;
  if (towers[to].length && towers[to].at(-1)! < disk) return null;
  return towers.map((t, i) =>
    i === from ? t.slice(0, -1) : i === to ? [...t, disk] : [...t],
  );
}
export function reversiFlips(
  board: number[],
  index: number,
  player: number,
  size = 6,
) {
  if (board[index]) return [];
  const flips: number[] = [];
  const r = Math.floor(index / size),
    c = index % size;
  for (const [dr, dc] of [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]) {
    let y = r + dr,
      x = c + dc;
    const line: number[] = [];
    while (
      y >= 0 &&
      y < size &&
      x >= 0 &&
      x < size &&
      board[y * size + x] === 3 - player
    ) {
      line.push(y * size + x);
      y += dr;
      x += dc;
    }
    if (
      line.length &&
      y >= 0 &&
      y < size &&
      x >= 0 &&
      x < size &&
      board[y * size + x] === player
    )
      flips.push(...line);
  }
  return flips;
}
export function maze(size: number, seed: number) {
  const walls = Array(size * size).fill(true) as boolean[];
  let value = seed + 177;
  const rand = () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
  const stack = [size + 1];
  walls[stack[0]] = false;
  while (stack.length) {
    const at = stack.at(-1)!;
    const r = Math.floor(at / size),
      c = at % size;
    const options = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ]
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(
        ([y, x]) =>
          y > 0 && y < size - 1 && x > 0 && x < size - 1 && walls[y * size + x],
      );
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [y, x] = options[Math.floor(rand() * options.length)],
      next = y * size + x;
    walls[next] = false;
    walls[(at + next) / 2] = false;
    stack.push(next);
  }
  return walls;
}
export function path(
  walls: boolean[],
  size: number,
  start: number,
  end: number,
) {
  const queue = [start],
    prev = new Map<number, number>();
  prev.set(start, -1);
  for (let q = 0; q < queue.length; q++) {
    const at = queue[q];
    if (at === end) break;
    for (const next of [
      at - size,
      at + size,
      ...(at % size ? [at - 1] : []),
      ...(at % size < size - 1 ? [at + 1] : []),
    ])
      if (next >= 0 && next < walls.length && !walls[next] && !prev.has(next)) {
        prev.set(next, at);
        queue.push(next);
      }
  }
  if (!prev.has(end)) return [];
  const route = [end];
  while (route.at(-1) !== start) route.push(prev.get(route.at(-1)!)!);
  return route.reverse();
}
export function boxEdges(row: number, col: number, size: number) {
  const horizontal = size * (size + 1);
  return [
    row * size + col,
    (row + 1) * size + col,
    horizontal + row * (size + 1) + col,
    horizontal + row * (size + 1) + col + 1,
  ];
}
export function completedBoxes(edges: number[], size: number) {
  return Array.from({ length: size * size }, (_, i) =>
    boxEdges(Math.floor(i / size), i % size, size).every((e) => edges[e] > 0),
  );
}
export function sokobanStep(
  position: number,
  boxes: number[],
  walls: number[],
  delta: number,
  size = 7,
) {
  const next = position + delta;
  if (
    (Math.abs(delta) === 1 &&
      Math.floor(next / size) !== Math.floor(position / size)) ||
    next < 0 ||
    next >= size * size ||
    walls.includes(next)
  )
    return null;
  const box = boxes.indexOf(next);
  if (box < 0) return { position: next, boxes };
  const destination = next + delta;
  if (
    (Math.abs(delta) === 1 &&
      Math.floor(destination / size) !== Math.floor(next / size)) ||
    destination < 0 ||
    destination >= size * size ||
    walls.includes(destination) ||
    boxes.includes(destination)
  )
    return null;
  return {
    position: next,
    boxes: boxes.map((v, i) => (i === box ? destination : v)),
  };
}
export function fleet(size: number, count: number, seed: number) {
  const cells: number[] = [];
  for (
    let attempt = 0;
    cells.length < count * 2 && attempt < size * (size - 1);
    attempt++
  ) {
    const slot = (attempt + seed) % (size * (size - 1)),
      row = Math.floor(slot / (size - 1)),
      col = slot % (size - 1),
      a = row * size + col;
    if (!cells.includes(a) && !cells.includes(a + 1)) cells.push(a, a + 1);
  }
  return cells;
}
