import { expandedGames } from "./expandedCatalog";
import { newGames } from "./newCatalog";
export const games = [
  ...newGames,
  ...expandedGames,
  {
    id: "sequencia",
    name: "Sequência de Cores",
    description: "Observe, memorize e repita. Uma cor a mais por nível.",
    category: "Inteligência",
  },
  {
    id: "palavra",
    name: "Palavra Secreta",
    description: "Cinco letras. Pistas para cada tentativa.",
    category: "Inteligência",
  },
  {
    id: "rally",
    name: "Rally de Checkpoints",
    description: "Bandeiras, trânsito e trinta segundos.",
    category: "Corrida",
  },
  {
    id: "coleta",
    name: "Coleta na Estrada",
    description: "Busque moedas. Escolha sua faixa.",
    category: "Carros",
  },
  {
    id: "orbital",
    name: "Defesa Orbital",
    description: "Pilote. Dispare. Proteja sua órbita.",
    category: "Tiro",
  },
  {
    id: "minas",
    name: "Campo Minado",
    description: "Leia os números. Encontre o caminho seguro.",
    category: "Inteligência",
  },
  {
    id: "reflexo",
    name: "Reflexo Rápido",
    description: "Espere o verde. Mostre seu reflexo.",
    category: "Casuais",
  },
  {
    id: "corrida",
    name: "Corrida Turbo",
    description: "Troque de faixa. Supere o trânsito.",
    category: "Corrida",
  },
  {
    id: "estacionamento",
    name: "Estacionamento",
    description: "Uma vaga e três desafios de manobra.",
    category: "Carros",
  },
  {
    id: "tiro",
    name: "Alvos Espaciais",
    description: "Mire, acerte e mantenha a sequência.",
    category: "Tiro",
  },
  {
    id: "luzes",
    name: "Luzes Out",
    description: "Apague as luzes. Encontre o padrão.",
    category: "Inteligência",
  },
  {
    id: "estrelas",
    name: "Caça-estrelas",
    description: "Vinte segundos para uma pausa divertida.",
    category: "Casuais",
  },
  {
    id: "liga4",
    name: "Liga 4",
    description: "Quatro em linha. Bot com três dificuldades ou duelo local.",
    category: "Estratégia",
  },
  {
    id: "puzzle",
    name: "Quebra-cabeça",
    description: "Oito peças, um desafio de lógica.",
    category: "Estratégia",
  },
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
