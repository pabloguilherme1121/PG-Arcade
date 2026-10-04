import type { ArcadeGame } from "../utils/arcadeSession";

type Level = "easy" | "normal" | "hard" | "master" | "impossible" | "expert";
const labels: Record<Level, string> = {
  easy: "Fácil",
  normal: "Normal",
  hard: "Difícil",
  master: "Mestre",
  impossible: "Impossível",
  expert: "Especialista",
};
const descriptions: Record<ArcadeGame, Partial<Record<Level, string>>> = {
  velha: {
    easy: "O bot deixa oportunidades para aprender.",
    normal: "O bot procura vencer e bloqueia ameaças.",
    impossible: "O bot analisa até o fim. Uma boa partida termina em empate.",
  },
  domino: {
    expert:
      "O bot combina controle das pontas, opções futuras e pontos restantes.",
    easy: "O bot escolhe uma peça disponível ao acaso.",
    normal: "O bot prioriza peças com mais pontos e duplas.",
    hard: "O bot também preserva opções para as próximas jogadas.",
    master: "O bot considera combinações da mão e controle das pontas.",
  },
  futebol: {
    expert: "O goleiro antecipa mais a mira. Varie os cantos e a curva.",
    easy: "O goleiro antecipa pouco a sua mira.",
    normal: "O goleiro começa a ler a direção do chute.",
    hard: "O goleiro acompanha mais a mira. Varie os cantos e a curva.",
    master:
      "O goleiro antecipa fortemente a mira. Colocação e curva fazem diferença.",
  },
  damas: {
    expert: "O bot procura respostas em uma busca mais profunda.",
    easy: "O bot escolhe entre os movimentos permitidos ao acaso.",
    normal: "O bot prioriza capturas e promoções.",
    hard: "O bot também avalia a posição das peças.",
    master: "O bot analisa respostas antes de escolher a jogada.",
  },
  xadrez: {
    expert:
      "Busca com avaliação de material e preferência por segurança no roque. Não é um motor profissional.",
    easy: "O bot escolhe uma jogada legal ao acaso.",
    normal: "O bot avalia o material após a própria jogada.",
    hard: "O bot considera a resposta do adversário e evita perdas imediatas.",
    master:
      "O bot analisa também a continuação após a resposta. Não é um motor profissional.",
  },
};

export default function ArcadeDifficultyNotice({
  game,
  level,
  local = false,
}: {
  game: ArcadeGame;
  level: Level;
  local?: boolean;
}) {
  return (
    <p data-arcade-difficulty className="arcade-difficulty-notice">
      <strong>{local ? "1 × 1 local" : `Nível ${labels[level]}`}</strong>
      <span>
        {local
          ? "Alternem as jogadas no mesmo aparelho. A dificuldade do bot não se aplica."
          : descriptions[game][level]}
      </span>
    </p>
  );
}
