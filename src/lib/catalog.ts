export const games = [
  {
    id: "2048",
    name: "2048",
    description: "Combine. Pense. Supere.",
    category: "Estratégia",
  },
  {
    id: "snake",
    name: "Snake",
    description: "Um clássico em movimento.",
    category: "Reflexos",
  },
  {
    id: "memoria",
    name: "Memória",
    description: "Encontre todos os pares.",
    category: "Memória",
  },
  {
    id: "xadrez",
    name: "Xadrez",
    description: "Cada movimento conta.",
    category: "Estratégia",
  },
  {
    id: "futebol",
    name: "Futebol",
    description: "Pênaltis e cobranças de falta.",
    category: "Esportes",
  },
  {
    id: "domino",
    name: "Dominó",
    description: "As peças certas, na hora certa.",
    category: "Estratégia",
  },
  {
    id: "damas",
    name: "Damas",
    description: "Capture o próximo desafio.",
    category: "Estratégia",
  },
  {
    id: "velha",
    name: "Jogo da velha",
    description: "Três em linha. Mais uma partida.",
    category: "Estratégia",
  },
] as const;
export type GameId = (typeof games)[number]["id"];
export function isGameId(value: unknown): value is GameId {
  return games.some((g) => g.id === value);
}
