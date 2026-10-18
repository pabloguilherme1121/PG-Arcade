import { seeded } from "./boardExpansion";
import { makeWordSearch } from './wordsearch';
export type Question = {
  prompt: string;
  answer: string;
  choices: string[];
  hint: string;
  numbers: number[];
  grid: string[];
  words: string[];
  color: number;
};
export const words = [
  ["PLANETA", "Corpo que orbita uma estrela"],
  ["JANELA", "Abertura que deixa a luz entrar"],
  ["FLORESTA", "Área com muitas árvores"],
  ["TECLADO", "Usado para digitar"],
  ["CASTELO", "Fortificação com torres"],
  ["ESCOLA", "Lugar de aprender"],
  ["OCEANO", "Grande massa de água salgada"],
  ["PONTE", "Liga duas margens"],
  ["NUVEM", "Formação de gotículas no céu"],
  ["LIVRO", "Páginas reunidas para leitura"],
  ["MONTANHA", "Grande elevação de terreno"],
  ["BICICLETA", "Veículo com duas rodas e pedais"],
  ["GIRAFA", "Animal de pescoço comprido"],
  ["MUSICA", "Arte dos sons"],
  ["ESTRELA", "Brilha no céu com luz própria"],
  ["VIAGEM", "Deslocamento para outro lugar"],
  ["SORVETE", "Sobremesa gelada"],
  ["ABACAXI", "Fruta com coroa e casca áspera"],
  ["AMIZADE", "Laço de carinho entre amigos"],
  ["PASSARINHO", "Pequena ave"],
  ["BIBLIOTECA", "Lugar onde se consultam e emprestam livros"],
  ["COMPUTADOR", "Máquina usada para executar programas"],
  ["ASTRONAUTA", "Pessoa que viaja ao espaço"],
  ["CACHOEIRA", "Queda de água de um rio"],
  ["BORBOLETA", "Inseto de asas coloridas"],
  ["BRINCADEIRA", "Atividade feita para se divertir"],
  ["CHOCOLATE", "Doce feito com cacau"],
  ["PEIXE", "Animal aquático que respira por brânquias"],
  ["CHUVA", "Água que cai das nuvens"],
  ["TERRA", "Solo onde crescem as plantas"],
  ["CADERNO", "Folhas reunidas para escrever"],
  ["DESENHO", "Imagem feita com traços"],
  ["COZINHA", "Lugar da casa onde se prepara comida"],
  ["TRABALHO", "Atividade feita para produzir ou realizar algo"],
  ["GELADEIRA", "Eletrodoméstico que conserva alimentos frios"],
  ["TARTARUGA", "Réptil com casco"],
  ["TRAVESSEIRO", "Apoio para a cabeça na hora de dormir"],
  ["AVENTUREIRO", "Pessoa que explora lugares e vive aventuras"],
] as const;
export const wordDifficultyDescriptions = [
  'Palavras de 5 a 6 letras. Comece com termos curtos e familiares.',
  'Palavras de 7 a 8 letras. Mais letras para organizar ou descobrir.',
  'Palavras de 9 a 11 letras. Vocabulário mais longo, com pistas de significado.',
] as const;
export const hangmanMistakeLimits = [8, 6, 5] as const;
export const colorNames = ["Vermelho", "Azul", "Verde", "Amarelo"];
export const colorValues = ["#ff8794", "#79b8ff", "#a5e479", "#ffe17c"];
export function isPrime(n: number) {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
const shuffle = <T>(xs: T[], rng: () => number) => {
  const b = [...xs];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
export function question(
  id: string,
  difficulty: number,
  seed: number,
  round: number,
): Question {
  const rng = seeded(seed * 1031 + round * 7907 + difficulty * 71),
    rand = (n: number) => Math.floor(rng() * n),
    q: Question = {
      prompt: "",
      answer: "",
      choices: [],
      hint: "",
      numbers: [],
      grid: [],
      words: [],
      color: 0,
    };
  const a = 2 + rand(8 + difficulty * 15),
    b = 2 + rand(8 + difficulty * 10);
  if (id === "arithmetic") {
    const op = difficulty > 0 && round % 3 === 2 ? "×" : round % 2 ? "−" : "+";
    q.prompt = `${a} ${op} ${b} = ?`;
    q.answer = String(op === "×" ? a * b : op === "−" ? a - b : a + b);
  }
  if (id === "fractions") {
    const c = 2 + rand(9),
      d = 2 + rand(9);
    q.prompt = `${a}/${b}  ?  ${c}/${d}`;
    q.answer = a * d === c * b ? "=" : a * d < c * b ? "<" : ">";
    q.choices = ["<", "=", ">"];
    q.hint = "Compare a × d com c × b.";
  }
  if (id === "primes") {
    const value =
      round === 0 && seed === 1 ? 1 : 2 + rand(30 + difficulty * 100);
    q.prompt = String(value);
    q.answer = isPrime(value) ? "Primo" : "Composto ou 1";
    q.choices = ["Primo", "Composto ou 1"];
    q.hint = "Teste os divisores até a raiz quadrada do número.";
  }
  if (id === "equation") {
    const x = rand(12 + difficulty * 10) - 5,
      coefficient = 2 + rand(3 + difficulty * 3);
    q.prompt = `${coefficient}x + ${b} = ${coefficient * x + b}`;
    q.answer = String(x);
    q.hint = "Subtraia o termo independente e divida pelo coeficiente.";
  }
  if (id === "twentyfour") {
    const sets = [
      [1, 2, 3, 4],
      [3, 3, 8, 8],
      [2, 2, 6, 6],
      [1, 3, 4, 6],
      [4, 4, 4, 4],
      [2, 3, 4, 6],
    ];
    q.numbers = shuffle(
      sets[
        difficulty === 0
          ? ((seed + round) % 2) * 4
          : (seed + round) % sets.length
      ],
      rng,
    );
    q.prompt = q.numbers.join(" · ");
    q.answer = "24";
    q.hint =
      "Use parênteses para escolher a ordem. Cada número deve aparecer uma única vez.";
  }
  if (id === "numsequence") {
    const t = round % (difficulty + 1);
    const seq = Array.from({ length: 5 }, (_, i) =>
      t === 0
        ? a + i * b
        : t === 1
          ? 1 + rand(1) + 2 ** i
          : t === 2
            ? a + i * (i + 1)
            : a + i * b,
    );
    q.prompt = seq.slice(0, 4).join(" · ") + " · ?";
    q.answer = String(seq[4]);
    q.hint =
      t === 0
        ? "Diferença constante."
        : t === 1
          ? "Potências de dois mais uma constante."
          : "As diferenças aumentam.";
  }
  if (id === "anagram" || id === "hangman") {
    const band = difficulty === 0 ? [5, 6] : difficulty === 1 ? [7, 8] : [9, 11];
    const pool = words.filter(([word]) => word.length >= band[0] && word.length <= band[1]);
    const [word, hint] = pool[(seed + round) % pool.length];
    q.answer = word;
    const shuffled = shuffle([...word], rng);
    if (shuffled.join('') === word) shuffled.push(shuffled.shift()!);
    q.prompt =
      id === "anagram"
        ? shuffled.join(" · ")
        : "Descubra a palavra";
    q.hint = hint;
  }
  if (id === "wordsearch") {
    Object.assign(q, makeWordSearch(difficulty, rng));
    q.prompt = q.words.join(' · ');
    q.answer = "";
  }
  if (id === "stroop") {
    q.color = rand(4);
    q.prompt = colorNames[(q.color + 1 + rand(3)) % 4].toUpperCase();
    q.answer = colorNames[q.color];
    q.choices = [...colorNames];
    q.hint = "Responda à tinta, não ao texto.";
  }
  if (id === "oddone") {
    const divisor = 2 + rand(3 + difficulty),
      offset = rand(4);
    q.choices = shuffle(
      Array.from({ length: 4 }, (_, i) =>
        String((offset + i + 1) * divisor + (i === 3 ? 1 : 0)),
      ),
      rng,
    );
    q.answer = String((offset + 4) * divisor + 1);
    q.prompt = `Qual número NÃO é múltiplo de ${divisor}?`;
    q.hint = "Um único número deixa resto na divisão.";
  }
  if (id === "estimate") {
    const count = 8 + rand(12 + difficulty * 14);
    q.numbers = shuffle(
      Array.from({ length: 64 }, (_, i) => i),
      rng,
    ).slice(0, count);
    q.prompt = "Quantos pontos você viu?";
    q.answer = String(count);
    q.hint = "Estime por grupos de pontos.";
  }
  if (
    !q.choices.length &&
    ["arithmetic", "equation", "numsequence"].includes(id)
  ) {
    const value = Number(q.answer);
    q.choices = shuffle(
      [value, value + 1, value - 1, value + 2 + rand(3)].map(String),
      rng,
    );
  }
  return q;
}
// A small arithmetic grammar, never JavaScript evaluation.
export function evaluate24(text: string, numbers: number[]): boolean {
  if (text.length > 120 || /[^\d\s+\-*/().]/.test(text)) return false;
  const tokens = text.match(/\d+(?:\.\d+)?|[()+\-*/]/g) || [];
  const used = tokens
    .filter((t) => /^\d/.test(t))
    .map(Number)
    .sort((a, b) => a - b);
  if (
    used.length !== numbers.length ||
    used.some((x, i) => x !== [...numbers].sort((a, b) => a - b)[i])
  )
    return false;
  let pos = 0;
  function atom(): number {
    const t = tokens[pos++];
    if (t === "(") {
      const n = sum();
      if (tokens[pos++] !== ")") throw Error();
      return n;
    }
    if (!t || !/^\d/.test(t)) throw Error();
    return Number(t);
  }
  function product(): number {
    let n = atom();
    while (tokens[pos] === "*" || tokens[pos] === "/") {
      const op = tokens[pos++],
        right = atom();
      n = op === "*" ? n * right : n / right;
    }
    return n;
  }
  function sum(): number {
    let n = product();
    while (tokens[pos] === "+" || tokens[pos] === "-") {
      const op = tokens[pos++],
        right = product();
      n = op === "+" ? n + right : n - right;
    }
    return n;
  }
  try {
    const result = sum();
    return (
      pos === tokens.length &&
      Number.isFinite(result) &&
      Math.abs(result - 24) < 1e-8
    );
  } catch {
    return false;
  }
}
export function selectedWord(
  grid: string[],
  a: number,
  b: number,
  n = 6,
): { word: string; path: number[] } {
  const dy = Math.floor(b / n) - Math.floor(a / n),
    dx = (b % n) - (a % n);
  if (dy && dx && Math.abs(dy) !== Math.abs(dx)) return { word: "", path: [] };
  const count = Math.max(Math.abs(dy), Math.abs(dx)) + 1,
    path = Array.from(
      { length: count },
      (_, i) => a + i * (Math.sign(dy) * n + Math.sign(dx)),
    );
  return { word: path.map((i) => grid[i]).join(""), path };
}
