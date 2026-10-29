// Respostas locais e auditáveis. O PG Bot não coleta mensagens nem faz chamadas de rede.
export const TOPICS = Object.freeze({
  'como-jogar': 'Escolha uma missão no catálogo e use Iniciar desafio. Leia o objetivo, os turnos e as ações disponíveis na arena. Ao concluir uma missão, use Próximo desafio. As 150 missões utilizam seis sistemas de regras, não 150 jogos independentes.',
  progresso: 'Vitórias e favoritos ficam salvos apenas neste navegador. Limpar os dados do site ou trocar de dispositivo pode apagar o progresso. Não há cadastro ou sincronização na nuvem.',
  offline: 'Abra o PG Estratégia conectado à internet pelo menos uma vez. Em HTTPS, o site tenta guardar seus arquivos essenciais para partidas posteriores sem conexão. Na primeira visita ou se o armazenamento estiver bloqueado, pode ser necessária a rede.',
  reiniciar: 'Dentro de uma missão, use Desfazer para voltar uma jogada, quando disponível, ou Reiniciar para começar a mesma missão novamente. Voltar ao catálogo não exclui as vitórias registradas.',
  acessibilidade: 'Use Tab para navegar entre controles e Enter ou Espaço para ativá-los. O tabuleiro também aceita setas para mover o foco. O botão Alternar contraste ajuda na leitura; animações respeitam a preferência de movimento reduzido do sistema.',
});

export function responseFor(topic) {
  return Object.hasOwn(TOPICS, topic) ? TOPICS[topic] : 'Selecione um assunto para ver a orientação disponível.';
}

let initialized = false;
export function openHelp() {
  const dialog = document.getElementById('pg-bot-dialog');
  if (!dialog) return false;
  if (!initialized) {
    for (const button of dialog.querySelectorAll('[data-help-topic]')) {
      button.addEventListener('click', () => {
        const answer = dialog.querySelector('#pg-bot-answer');
        if (answer) answer.textContent = responseFor(button.dataset.helpTopic);
      });
    }
    dialog.querySelector('#pg-bot-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.getElementById('pg-bot-open')?.focus({ preventScroll: true });
    });
    initialized = true;
  }
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('[data-help-topic]')?.focus({ preventScroll: true });
  return true;
}