import { getMission } from './catalog.mjs';
import { answerPGbot } from './pg-bot-help.mjs';

const $ = id => document.getElementById(id);
const dialog = $('pgbot-dialog');
if (dialog) {
  const form = $('pgbot-form');
  const input = $('pgbot-question');
  const log = $('pgbot-log');
  let lastTrigger = null;

  function context() {
    const active = $('arena')?.open === true;
    const id = $('arena-id')?.textContent?.toLowerCase();
    const mission = active ? getMission(id) : null;
    return { active: Boolean(mission), family: mission?.family ?? null };
  }

  function addMessage(message, source) {
    const paragraph = document.createElement('p');
    paragraph.className = 'pgbot-entry';
    paragraph.dataset.source = source;
    paragraph.textContent = message;
    log.append(paragraph);
    // Limita o histórico da sessão para evitar crescimento indefinido do DOM.
    while (log.children.length > 14) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }

  function ask(raw) {
    const question = String(raw ?? '').trim().slice(0, 160);
    if (!question) return;
    addMessage(question, 'person');
    addMessage(answerPGbot(question, context()), 'bot');
  }

  for (const id of ['pgbot-open', 'pgbot-game']) {
    const trigger = $(id);
    trigger?.addEventListener('click', () => {
      lastTrigger = trigger;
      if (!dialog.open) dialog.showModal();
      input.focus();
    });
  }
  $('pgbot-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (lastTrigger?.isConnected) lastTrigger.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    ask(input.value);
    input.value = '';
    input.focus();
  });
  // Acesso explícito pelo rodapé do Arcade abre o suporte imediatamente.
  if (new URLSearchParams(location.search).get('ajuda') === '1') {
    lastTrigger = $('pgbot-open');
    dialog.showModal();
  }
  dialog.querySelectorAll('[data-pgbot-question]').forEach(button => {
    button.addEventListener('click', () => {
      ask(button.dataset.pgbotQuestion);
      input.focus();
    });
  });
}
