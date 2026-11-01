import type { GameId } from "./catalog";
import { gameHelp } from "./gameHelp";

export type ArcadeBotTopic = "objetivo" | "controles" | "pausa" | "recordes" | "offline" | "acessibilidade" | "fallback";
type ArcadeBotAnswer = { topic: ArcadeBotTopic; answer: string };
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
/** Respostas locais e determinísticas, sem enviar perguntas para serviços externos. */
export function answerArcadeQuestion(id: GameId, input: string): ArcadeBotAnswer {
  const q = typeof input === "string" && input.length <= 240 ? normalize(input) : "";
  const fallback: ArcadeBotAnswer = {
    topic:"fallback",
    answer:"Posso responder perguntas sobre objetivo, controles, pausa, reinício, recordes, offline e acessibilidade deste jogo. Use os assuntos rápidos ou tente outra pergunta.",
  };
  if (!q || !/[a-z]/.test(q)) return fallback;
  if (/offline|sem internet|desconectad|sem rede/.test(q)) return {
    topic:"offline",
    answer:"O PG Arcade funciona offline apenas depois de guardar os arquivos do jogo em uma visita conectada. Nem todos os jogos ou recursos opcionais estarão disponíveis se ainda não foram carregados. Seu progresso é local.",
  };
  if (/record|pontua|favorit|salv|backup|progresso/.test(q)) return {
    topic:"recordes",
    answer:"Favoritos e recordes deste jogo ficam no armazenamento do navegador. Você pode consultar o painel de progresso do Arcade; trocar de aparelho ou limpar os dados pode apagá-los. Não existe sincronização automática.",
  };
  if (/teclad|tab\b|acessib|contraste|leitor|tamanho|movimento reduzido/.test(q)) return {
    topic:"acessibilidade",
    answer:"Use Tab e Enter para navegar, quando o controle permitir. Alt + Shift + B foca o tabuleiro, Alt + Shift + H abre a ajuda e Alt + Shift + R solicita reinício. Você também pode ampliar controles, ajustar contraste e reduzir movimento.",
  };
  if (/paus|reinic|recomec|desfaz|reset|parar|retomar/.test(q)) return {
    topic:"pausa",
    answer:"Use os comandos Pausar ou Continuar, quando disponíveis no jogo. O botão Reiniciar exige confirmação e encerra a sessão atual, preservando favoritos e recordes. Alguns jogos também têm Desfazer próprio.",
  };
  if (/tecla|controle|comando|botao|tocar|touch|mover|seta/.test(q)) return {
    topic:"controles",
    answer:"Controles de " + id + ": " + gameHelp[id] + " Use o botão Ir para o tabuleiro para focar o controle principal. Se houver botões de toque no jogo, você pode usá-los no celular.",
  };
  if (/como|venc|ganh|objetivo|jogar|dica|estrateg|regras|ajuda|pontuar/.test(q)) return {
    topic:"objetivo",
    answer:"Orientação específica do jogo: " + gameHelp[id],
  };
  return fallback;
}
