// Ajuda local e determinística. Não envia perguntas a servidores nem simula IA online.
const TIPS = Object.freeze({
  territorio: 'Para conquistar áreas, avance por casas vizinhas livres. Observe o rival antes de gastar um turno.',
  rotas: 'Planeje a rota antes de andar: bloqueios não podem ser atravessados e cada passo conta.',
  economia: 'Equilibre alimento, minério e créditos. Investir aumenta a influência, mas exige recursos.',
  defesa: 'Observe a pista ameaçada e a força da próxima onda. Construa torres antes de avançar.',
  logistica: 'Passe pelas cargas e acompanhe o combustível. O destino precisa ser alcançado com a entrega.',
  cidade: 'Mantenha energia, água e confiança equilibradas. Planejamento integrado aumenta os três indicadores.',
});

export function normalizeBotQuery(value) {
  return String(value ?? '').trim().slice(0, 160).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function getHelpResponse(question, context = {}) {
  const q = normalizeBotQuery(question);
  if (!q) return { topic: 'inicio', text: 'Escolha um assunto ou faça uma pergunta sobre o PG Estratégia.' };
  if (/\b150\b|jogos diferentes|jogos independentes/.test(q)) return {
    topic: 'catalogo',
    text: 'O portal atual reúne 150 missões construídas sobre seis mecânicas. Isso não significa 150 jogos independentes. Os jogos originais ficam em uma coleção separada, conforme forem integrados e testados.',
  };
  if (/offline|internet|conexao|sem rede/.test(q)) return {
    topic: 'offline',
    text: 'Após a primeira visita online, o navegador pode guardar os arquivos do PG Estratégia para uso offline. A disponibilidade depende do cache e das permissões do aparelho. O suporte PG Bot funciona sem internet.',
  };
  if (/salv|progresso|recorde|favorit|sincroniz/.test(q)) return {
    topic: 'progresso',
    text: 'Missões concluídas, favoritas e a última missão aberta ficam salvas neste navegador, quando o armazenamento está disponível. Não há conta nem sincronização entre aparelhos. Limpar dados do site pode apagar o progresso.',
  };
  if (/reinici|desfaz|desfazer|voltar jogada/.test(q)) return {
    topic: 'comandos',
    text: 'Na partida, use Desfazer para voltar uma ação ou Reiniciar para começar a missão novamente. Reiniciar não apaga as vitórias já registradas.',
  };
  if (/\bdica\b|dicas|como ganhar|ajuda na missao|estrategia para/.test(q)) {
    const family = context && typeof context === 'object' ? context.family : null;
    return { topic: 'dica', text: Object.hasOwn(TIPS, family) ? TIPS[family] : 'Selecione uma missão para receber uma dica específica sobre a mecânica.' };
  }
  if (/teclad|toque|touch|clicar|moviment|como jogar|controles/.test(q)) return {
    topic: 'controles',
    text: 'Escolha uma missão no catálogo. Toque ou clique nas casas disponíveis; no teclado, use Tab para focar os botões e Enter ou Espaço para ativá-los. No tabuleiro, as setas também ajudam a navegar.',
  };
  return { topic: 'desconhecido', text: 'Ainda não tenho uma resposta para isso. Posso ajudar com controles, dicas de missão, progresso, modo offline e reinício.' };
}

export function mountPgBot(root, { getContext = () => ({}) } = {}) {
  if (!root) return;
  const box = document.createElement('section');
  box.className = 'pg-bot';
  box.setAttribute('aria-label', 'Suporte local PG Bot');
  const head = document.createElement('div');
  head.className = 'pg-bot-head';
  const image = document.createElement('img');
  image.src = new URL('../brand/pg-bot/mascot.webp', import.meta.url).href;
  image.alt = '';
  image.width = 64;
  image.height = 75;
  image.loading = 'lazy';
  image.decoding = 'async';
  const introduction = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = 'PG Bot';
  const description = document.createElement('p');
  description.textContent = 'Suporte automático para missões, controles e progresso. Funciona no aparelho, sem envio de perguntas.';
  introduction.append(title, description);
  head.append(image, introduction);

  const suggestions = document.createElement('div');
  suggestions.className = 'pg-bot-quick';
  const prompts = ['Como jogar pelo teclado?', 'Me dê uma dica', 'Meu progresso fica salvo?', 'Consigo jogar offline?'];
  const output = document.createElement('p');
  output.className = 'pg-bot-answer';
  output.setAttribute('role', 'status');
  output.setAttribute('aria-live', 'polite');
  output.setAttribute('aria-atomic', 'true');
  output.textContent = 'Escolha uma pergunta ou digite a sua.';
  function respond(query) {
    const context = getContext();
    output.textContent = getHelpResponse(query, context).text;
  }
  for (const prompt of prompts) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = prompt;
    button.addEventListener('click', () => respond(prompt));
    suggestions.append(button);
  }
  const form = document.createElement('form');
  form.className = 'pg-bot-form';
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 160;
  input.placeholder = 'Pergunte ao PG Bot';
  const uniqueId = root.id ? root.id + '-question' : 'pg-bot-question';
  input.id = uniqueId;
  label.htmlFor = uniqueId;
  label.textContent = 'Sua pergunta';
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Perguntar';
  form.append(label, input, button);
  form.addEventListener('submit', event => { event.preventDefault(); respond(input.value); });
  box.append(head, suggestions, form, output);
  root.replaceChildren(box);
}
