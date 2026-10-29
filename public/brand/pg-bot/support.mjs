// PG Bot: ajuda local, baseada em regras, sem serviços externos.
export const topics = Object.freeze([
  { id: 'como-jogar', label: 'Como jogar' },
  { id: 'controles', label: 'Controles' },
  { id: 'dica', label: 'Dica da partida' },
  { id: 'progresso', label: 'Meu progresso' },
  { id: 'problemas', label: 'Problemas ao jogar' },
  { id: 'catalogo', label: 'Jogos e missões' },
]);
const hints = [
  'Conquiste casas livres adjacentes ao seu território; bloqueie o avanço rival antes de expandir para longe.',
  'Observe os obstáculos e trace uma rota contínua até a estrela; cada movimento gasta um turno.',
  'Equilibre alimento, minério e créditos. Invista na influência somente quando houver recursos suficientes.',
  'Observe a próxima pista ameaçada, fortaleça a torre dessa pista e avance a onda quando estiver preparado.',
  'Planeje a coleta das cargas e o caminho até a entrega. Guarde combustível para os últimos movimentos.',
  'Mantenha energia, água e confiança acima da meta. Planejamento integrado aumenta os três indicadores.',
];
export function getSupportAnswer(topic, site = 'arcade', missionId = '') {
  if (!topics.some(item => item.id === topic)) return 'Assunto não encontrado. Escolha um dos temas de ajuda disponíveis.';
  const strategy = site === 'estrategia';
  switch (topic) {
    case 'como-jogar':
      return strategy
        ? 'Escolha uma das seis mecânicas, inicie uma missão e use as ações disponíveis. O painel mostra o objetivo, os turnos e as condições de vitória ou derrota.'
        : 'Escolha um jogo no catálogo, leia as instruções e use a arena. Cada título tem regras próprias e pode oferecer modos ou dificuldades diferentes.';
    case 'controles':
      return strategy
        ? 'Toque ou clique nas casas e ações disponíveis. No tabuleiro, use Tab e Enter; as setas deslocam o foco entre casas. Reiniciar e Desfazer ficam na arena.'
        : 'Os controles variam por jogo. Abra Opções da partida para ler a ajuda e pausar. No teclado, Alt + Shift + H abre a ajuda, B foca o tabuleiro e R solicita reinício.';
    case 'dica': {
      if (!strategy) return 'Abra um jogo e consulte Opções da partida para ver os controles e as regras específicas. O PG Bot não joga por você.';
      const match = /^est-(\d{3})$/.exec(missionId);
      const index = match ? Number(match[1]) : 0;
      if (index < 1 || index > 150) return 'Selecione uma missão para receber uma dica sobre a sua mecânica.';
      return hints[Math.floor((index - 1) / 25)];
    }
    case 'progresso':
      return strategy
        ? 'Missões concluídas e favoritas ficam salvas apenas neste navegador. Trocar de dispositivo ou limpar os dados do site pode apagar o progresso.'
        : 'Favoritos, visitas e recordes usam armazenamento local do navegador. Abra Meu progresso para revisar. A limpeza dos dados do site pode apagar esses registros.';
    case 'problemas':
      return 'Se um jogo não responder, saia da partida, recarregue a página e tente novamente. No celular, confira a orientação e o espaço disponível. Se o problema continuar, anote o nome do jogo e as ações realizadas para relatar o erro.';
    case 'catalogo':
      return strategy
        ? 'O PG Estratégia oferece 150 missões em seis mecânicas compartilhadas. Essas missões não são 150 jogos independentes. Os jogos completos ficam no catálogo do PG Arcade.'
        : 'O PG Arcade tem um catálogo de 150 jogos. O PG Estratégia é um microsite ligado ao Arcade com 150 missões em seis mecânicas; a meta adicional de 150 jogos estratégicos independentes ainda está em desenvolvimento.';
  }
}
if (typeof window !== 'undefined' && typeof customElements !== 'undefined' && !customElements.get('pg-bot-support')) {
  customElements.define('pg-bot-support', class extends HTMLElement {
    #controller = new AbortController();
    connectedCallback() {
      if (this.dataset.ready === 'true') return;
      this.dataset.ready = 'true';
      const site = this.getAttribute('site') === 'estrategia' ? 'estrategia' : 'arcade';
      const details = document.createElement('details');
      details.className = 'pg-bot-help';
      const summary = document.createElement('summary');
      summary.className = 'pg-bot-summary';
      const img = document.createElement('img');
      img.src = new URL('./mascot.webp', import.meta.url).href;
      img.alt = '';
      img.width = 64;
      img.height = 75;
      img.loading = 'lazy';
      img.decoding = 'async';
      const heading = document.createElement('span');
      heading.className = 'pg-bot-title';
      const title = document.createElement('strong');
      title.textContent = 'PG Bot · Ajuda para jogar';
      const subtitle = document.createElement('small');
      subtitle.textContent = 'Respostas prontas no dispositivo, sem chat ao vivo';
      heading.append(title, subtitle);
      summary.append(img, heading);
      const inner = document.createElement('div');
      inner.className = 'pg-bot-panel';
      const intro = document.createElement('p');
      intro.textContent = 'Escolha um assunto para receber orientação.';
      const actions = document.createElement('div');
      actions.className = 'pg-bot-topics';
      actions.setAttribute('role', 'group');
      actions.setAttribute('aria-label', 'Assuntos de ajuda do PG Bot');
      const answer = document.createElement('p');
      answer.className = 'pg-bot-answer';
      answer.setAttribute('role', 'status');
      answer.setAttribute('aria-live', 'polite');
      answer.textContent = 'O PG Bot oferece instruções automáticas e não altera sua partida.';
      for (const item of topics) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = item.label;
        button.dataset.topic = item.id;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          for (const other of actions.querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === button));
          answer.textContent = getSupportAnswer(item.id, site, window.location.hash.slice(1));
        });
        actions.append(button);
      }
      inner.append(intro, actions, answer);
      details.append(summary, inner);
      this.replaceChildren(details);
      const openBot = event => {
        if (!event.target.closest?.('[data-open-pg-bot]')) return;
        details.open = true;
        this.scrollIntoView({ block: 'center', behavior: 'instant' });
        summary.focus({ preventScroll: true });
      };
      document.addEventListener('click', openBot, { signal: this.#controller.signal });
    }
    disconnectedCallback() { this.#controller.abort(); }
  });
}