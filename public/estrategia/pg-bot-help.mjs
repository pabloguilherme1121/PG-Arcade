const TIPS = Object.freeze({
  territorio: 'Expanda por casas vizinhas e acompanhe a fronteira rival. Evite gastar jogadas em posições que não aproximam você da meta de território.',
  rotas: 'Planeje a rota até o destino antes de avançar. Os bloqueios não podem ser atravessados; Desfazer permite testar outro caminho.',
  economia: 'Equilibre créditos, alimento e minério. Produza antes de investir e confira o custo de cada operação para não ficar sem recursos.',
  defesa: 'Observe a pista ameaçada e a força da próxima onda. Construa ou melhore torres nessa pista antes de usar Avançar onda.',
  logistica: 'Calcule o caminho para pegar as cargas sem gastar todo o combustível. Use os pontos de reabastecimento antes de seguir ao destino.',
  cidade: 'A meta exige energia, água e confiança ao mesmo tempo. Planejamento integrado aumenta os três; verifique o prazo restante.',
});

function normalize(value) {
  return String(value ?? '').slice(0, 160).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** Suporte local com respostas determinísticas; não executa jogadas nem faz chamadas externas. */
export function answerPGbot(question, context = {}) {
  const text = normalize(question);
  if (!text) return 'Pergunte sobre dicas, controles, catálogo ou progresso. Posso ajudar sem sair do jogo.';
  if (/progres|salv|record|favorit|sincroniz|backup|dados/.test(text)) {
    return 'Missões concluídas e favoritas ficam salvas somente neste navegador. Sem conta e sem sincronização automática entre dispositivos. Limpar os dados do navegador pode apagar esse progresso.';
  }
  if (/control|toqu|teclad|paus|reinic|desfaz|undo/.test(text)) {
    return 'Use toque ou clique nos botões habilitados; Tab e Enter permitem jogar com teclado. Na missão, use Desfazer para voltar uma jogada, Reiniciar para começar outra partida e Catálogo para sair.';
  }
  if (/catalog|buscar|filtr|outra miss|encontrar|escolher/.test(text)) {
    return 'No catálogo, use a busca, os filtros de mecânica e a ordenação. Há 150 missões em seis sistemas de regras, não 150 jogos independentes. Os jogos do Arcade ficam na seção inferior.';
  }
  if (/dica|estrateg|ajuda|como|jog|ganh|objetivo|missao/.test(text)) {
    if (context.active && Object.hasOwn(TIPS, context.family)) {
      return TIPS[context.family];
    }
    return 'Escolha uma missão e abra o PG Bot durante a partida para receber uma dica específica. Fora da arena, use a busca para encontrar uma missão.';
  }
  return 'Sou o PG Bot, uma ajuda local com respostas sobre controles, dicas, catálogo e progresso. Não sou um atendimento humano nem uma IA conectada a servidores.';
}
