// Respostas locais e auditáveis. O PG Bot não coleta mensagens nem faz chamadas de rede.
export const TOPICS = Object.freeze({
  'como-jogar': 'Escolha uma missão no catálogo e use Iniciar desafio. Leia o objetivo, os turnos e as ações disponíveis na arena. Ao concluir uma missão, use Próximo desafio. As 150 missões utilizam seis sistemas de regras, não 150 jogos independentes.',
  progresso: 'Vitórias e favoritos ficam salvos apenas neste navegador. Limpar os dados do site ou trocar de dispositivo pode apagar o progresso. Não há cadastro ou sincronização na nuvem.',
  offline: 'Abra o PG Estratégia conectado à internet pelo menos uma vez. Em HTTPS, o site tenta guardar seus arquivos essenciais para partidas posteriores sem conexão. Na primeira visita ou se o armazenamento estiver bloqueado, pode ser necessária a rede.',
  reiniciar: 'Dentro de uma missão, use Desfazer para voltar uma jogada, quando disponível, ou Reiniciar para começar a mesma missão novamente. Voltar ao catálogo não exclui as vitórias registradas.',
  acessibilidade: 'Use Tab para navegar entre controles e Enter ou Espaço para ativá-los. O tabuleiro também aceita setas para mover o foco. O botão Alternar contraste ajuda na leitura; animações respeitam a preferência de movimento reduzido do sistema.',
});


// Dicas específicas para cada um dos seis motores das 150 missões, sem chamadas externas.
const MISSION_HINTS = Object.freeze({
 'conquista territorial': 'Expanda para casas vizinhas e mantenha dois caminhos de avanço. O rival também conquista áreas; alcance a meta antes do limite de turnos.',
 'rota critica': 'Planeje um caminho contínuo até o destino. Não atravesse bloqueios e use Desfazer para recuperar uma escolha que fechou a rota.',
 'comercio & recursos': 'Alterne produção, comércio e investimentos. Reserve alimento, minério e créditos suficientes para conquistar a meta de influência.',
 'defesa de fronteira': 'Observe qual das três pistas será atacada, construa torres na pista ameaçada e fortaleça sua defesa antes de iniciar a próxima onda.',
 'expedicao tatica': 'Colete todas as cargas, gerencie o combustível e planeje sua passagem pelos postos de abastecimento antes de chegar à saída.',
 'plano da cidade': 'Equilibre energia, água e confiança. O planejamento integrado aumenta os três indicadores, mas custa um turno; use projetos especializados com cuidado.'
});
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function responseFor(topic, missionTitle = '') {
  if (topic === 'dica-missao') {
    const title = normalize(missionTitle);
    return Object.entries(MISSION_HINTS).find(([family]) => title.startsWith(family + ':'))?.[1]
      || 'Abra uma missão na arena para receber uma dica específica da sua mecânica.';
  }
  return Object.hasOwn(TOPICS, topic) ? TOPICS[topic] : 'Selecione um assunto para ver a orientação disponível.';
}

let initialized = false;
let focusReturn = null;
export function openHelp(trigger = document.activeElement) {
  focusReturn = trigger;
  const dialog = document.getElementById('pg-bot-dialog');
  if (!dialog) return false;
  if (!initialized) {
    for (const button of dialog.querySelectorAll('[data-help-topic]')) {
      button.addEventListener('click', () => {
        const answer = dialog.querySelector('#pg-bot-answer');
        if (answer) answer.textContent = responseFor(button.dataset.helpTopic,
          document.querySelector('#arena[open] #arena-title')?.textContent || '');
      });
    }
    dialog.querySelector('#pg-bot-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      const target = focusReturn?.isConnected ? focusReturn : document.getElementById('pg-bot-open');
      target?.focus({ preventScroll: true });
    });
    initialized = true;
  }
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('[data-help-topic]')?.focus({ preventScroll: true });
  return true;
}