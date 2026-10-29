/* PG Bot: ajuda local sem rede, contas ou serviços pagos. */
(function () {
  "use strict";
  const hints = {
    "damas taticas": "Em Damas Táticas, a captura é obrigatória. Observe saltos em sequência antes de avançar uma peça e proteja a diagonal para promover uma dama.",
    "hex conexao": "No Hex Conexão, conecte a borda de cima à de baixo. Monte dois caminhos alternativos e bloqueie a conexão lateral do rival.",
    "frota oculta": "Na Frota Oculta, toque no tabuleiro 6×6 para disparar. Use o sonar quando tiver poucas pistas; cada disparo consome um turno.",
    "cartas de cerco": "Em Cartas de Cerco, distribua energia entre ataque e defesa. Use Fortificar antes de encerrar o turno e reserve recursos para o Aríete.",
    "patrulha tatica": "Na Patrulha Tática, use cobertura e controle munição e cura. Na missão de extração, recupere o sinal e retorne à base.",
    "muralha das torres": "Na Muralha das Torres, combine Canhão e Gelo. Construa fora da rota, aprimore torres e administre créditos antes de iniciar ondas.",
    "fronteira orbital": "Na Fronteira Orbital, explore setores vizinhos antes de colonizar. Mantenha as colônias conectadas e escolha entre expansão e pesquisa.",
    "refugio do inverno": "No Refúgio do Inverno, acompanhe alimento, lenha, calor e moral. Reserve suprimentos para nevascas e construa sinais na campanha de evacuação."
  };
  // Advice grounded in the six actual PG Estratégia campaign rule families.
  // The title contains the family name before the colon; no network required.
  const campaignHints = {
    "conquista territorial": "Objetivo: conquiste casas vizinhas ao seu território antes do rival. Expanda por dois lados quando possível e alcance a meta de áreas dentro do limite de turnos.",
    "rota critica": "Objetivo: faça um caminho até a saída, sem atravessar bloqueios. Verifique a próxima casa antes de avançar e use Desfazer caso um corredor fique sem saída.",
    "comercio & recursos": "Objetivo: consiga influência sem acabar com créditos, alimento ou minério. Produza recursos antes de investir; cada ação gasta um turno.",
    "defesa de fronteira": "Objetivo: sobreviva às ondas de ataque. Observe a pista ameaçada, construa torres nas pistas certas e reforce a defesa antes de avançar.",
    "expedicao tatica": "Objetivo: recolha as cargas e chegue à saída. Controle o combustível, visite postos de abastecimento e evite caminhos bloqueados.",
    "plano da cidade": "Objetivo: equilibre energia, água e confiança. Planejamento integrado aumenta os três indicadores lentamente; outras ações sacrificam um recurso para melhorar outro."
  };
  const normalize = text => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  function replyFor(question, gameTitle = "") {
    const q = normalize(question);
    const title = normalize(gameTitle);
    const hint = Object.entries(hints).find(([name]) => title.includes(name))?.[1];
    const campaignHint = Object.entries(campaignHints).find(([name]) => title.startsWith(name + ":"))?.[1];
    if (/150|quantos jogos|jogos diferentes|missoes/.test(q))
      return "O portal possui 150 missões em 6 sistemas de regras. A coleção de jogos independentes é outra meta, ainda em desenvolvimento. Missões repetem sistemas e não são 150 jogos diferentes.";
    if (/privacidade|dados|cadastro|login|salvamento|progresso|recorde/.test(q))
      return "Não envio suas mensagens para servidores. Favoritos, recordes e progresso dos jogos são salvos no próprio navegador, conforme cada jogo. Limpar os dados do navegador pode apagar esse progresso.";
    if (/offline|internet|conexao|wifi/.test(q))
      return "Os jogos e o PG Bot podem funcionar offline depois de carregar os recursos necessários. Se um jogo ainda não foi armazenado no aparelho, abra-o com internet antes de tentar jogar desconectado.";
    if (/acessibilidade|teclado|toque|controles|mobile|celular/.test(q))
      return "No celular, toque nos botões e casas disponíveis. No computador, use Tab para navegar e Enter ou Espaço para selecionar. Alguns jogos também aceitam setas. A opção de reiniciar fica na arena.";
    if (/pausar|pausa|retomar|reiniciar|recomecar/.test(q))
      return "Use o comando de pausa do jogo quando existir. Para começar outra partida, selecione Reiniciar. Na campanha Estratégia, Desfazer permite revisar a última decisão.";
    if (/dica|estrategia|vencer|como jogar|jogada|ajuda no jogo|regras/.test(q)) {
      if (hint) return hint;
      if (campaignHint) return campaignHint;
      return "Escolha um jogo e abra a arena para receber uma dica específica. Observe o objetivo, os recursos e os limites de turno antes de jogar.";
    }
    if (/buscar|pesquisa|filtro|encontrar|onde|jogos|catalogo|arcade/.test(q))
      return "No PG Arcade, use busca, categorias e favoritos. No PG Estratégia, explore as missões, filtre por mecânica ou abra o laboratório de jogos originais.";
    if (/ola|oi|bom dia|boa noite|pg bot/.test(q))
      return "Sou o PG Bot, assistente local de suporte. Posso explicar controles, progresso, modos e dar dicas do jogo aberto. Não sou uma IA conectada a servidores.";
    return "Posso ajudar com regras, dicas, controles, favoritos, progresso e modo offline. Escolha uma das perguntas rápidas ou escreva, por exemplo, 'dica' ou 'controles'.";
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { replyFor };
  if (typeof document === "undefined") return;

  const base = new URL(".", document.currentScript?.src || location.href);
  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function currentGame() {
    const strategyDialog = document.getElementById("arena");
    if (strategyDialog?.open) return document.getElementById("arena-title")?.textContent || "";
    const labTitle = document.getElementById("game-title")?.textContent;
    if (labTitle) return labTitle;
    const path = location.hash.match(/^#\/?jogar\/([^/?]+)/);
    return path ? decodeURIComponent(path[1]).replace(/[-_]/g, " ") : "";
  }
  function boot() {
    if (document.getElementById("pg-bot-launcher")) return;
    const wrap = el("div", "pg-bot");
    const launcher = el("button", "pg-bot-launcher");
    launcher.id = "pg-bot-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Abrir ajuda PG Bot");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "pg-bot-panel");
    const mascot = el("img", "pg-bot-mascot");
    mascot.src = new URL("brand/pg-bot/mascot.webp", base).href;
    mascot.alt = "";
    mascot.width = 42;
    mascot.height = 42;
    mascot.loading = "lazy";
    launcher.append(mascot, el("span", "", "PG Bot"));
    const panel = el("section", "pg-bot-panel");
    panel.id = "pg-bot-panel";
    panel.hidden = true;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "Ajuda PG Bot");
    const head = el("header", "pg-bot-head");
    const identity = el("div", "pg-bot-heading");
    identity.append(el("strong", "", "PG Bot"), el("small", "", "Ajuda local · sem envio de dados"));
    const close = el("button", "pg-bot-close", "Fechar");
    close.type = "button";
    close.setAttribute("aria-label", "Fechar ajuda PG Bot");
    head.append(identity, close);
    const feed = el("div", "pg-bot-feed");
    feed.setAttribute("role", "log");
    feed.setAttribute("aria-live", "polite");
    feed.setAttribute("aria-relevant", "additions");
    const questions = el("div", "pg-bot-questions");
    for (const text of ["Dica", "Controles", "Progresso", "150 jogos?"]) {
      const button = el("button", "", text);
      button.type = "button";
      button.addEventListener("click", () => ask(text));
      questions.append(button);
    }
    const form = el("form", "pg-bot-form");
    const input = el("input", "");
    input.type = "text";
    input.maxLength = 160;
    input.placeholder = "Pergunte sobre o jogo...";
    input.setAttribute("aria-label", "Pergunta para o PG Bot");
    input.autocomplete = "off";
    const send = el("button", "", "Enviar");
    send.type = "submit";
    form.append(input, send);
    const nav = el("nav", "pg-bot-nav");
    nav.setAttribute("aria-label", "Ir para outros projetos");
    for (const [text, path] of [["Arcade", ""], ["Estratégia", "estrategia/"], ["Jogos originais", "estrategia/independentes/"]]) {
      const link = el("a", "", text);
      link.href = new URL(path, base).href;
      nav.append(link);
    }
    function addMessage(message, kind) {
      const row = el("p", "pg-bot-message " + kind, message);
      feed.append(row);
      feed.scrollTop = feed.scrollHeight;
    }
    function ask(text) {
      const question = String(text || "").trim().slice(0, 160);
      if (!question) return;
      addMessage(question, "question");
      addMessage(replyFor(question, currentGame()), "answer");
      input.value = "";
    }
    function toggle(open) {
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", String(open));
      launcher.setAttribute("aria-label", open ? "Fechar ajuda PG Bot" : "Abrir ajuda PG Bot");
      if (open) input.focus({ preventScroll: true });
      else launcher.focus({ preventScroll: true });
    }
    launcher.addEventListener("click", () => toggle(panel.hidden));
    close.addEventListener("click", () => toggle(false));
    form.addEventListener("submit", event => {
      event.preventDefault();
      ask(input.value);
    });
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        toggle(false);
      }
    });
    panel.append(head, feed, questions, form, nav);
    wrap.append(panel, launcher);
    document.body.append(wrap);
    // A native showModal() dialog occupies the browser top layer. Move support
    // inside it while playing so the launcher remains clickable above its backdrop.
    const modal = document.getElementById("arena");
    if (modal && typeof MutationObserver !== "undefined") {
      const placeBot = () => {
        const target = modal.open ? modal : document.body;
        if (wrap.parentElement !== target) target.append(wrap);
      };
      new MutationObserver(placeBot).observe(modal, {
        attributes: true, attributeFilter: ["open"]
      });
      placeBot();
    }
    addMessage("Olá! Sou o PG Bot. Posso ajudar com regras, controles e dicas. Minhas respostas são locais e não usam serviços externos.", "answer");
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
