import { createNaval, commandNaval } from "./naval.mjs";
import { createSiege, playSiegeCard, endSiegeTurn, SIEGE_CARDS } from "./siege.mjs";

const $ = id => document.getElementById(id);
const STORAGE = "pg-strategy-original-records-v1";
const GAMES = {
  "frota-oculta": { name: "Frota Oculta", intro: "Localize a frota inimiga num mapa 6×6. Cada disparo consome um turno; use o sonar para deduzir a posição das embarcações.", instructions: "Toque em um quadrante para atacar. Sonar revela o número de navios numa linha, mas gasta um turno. Reparos preservam sua base sob pressão.", init: createNaval },
  "cartas-de-cerco": { name: "Cartas de Cerco", intro: "Monte sua ofensiva com as cartas disponíveis, distribua energia e sobreviva aos ataques de uma fortaleza inimiga.", instructions: "Jogue cartas de sua mão gastando energia. Fortificar bloqueia o próximo ataque; Aríete causa dano elevado. Encerrar o turno permite que o rival ataque.", init: createSiege },
};
let gameId = location.hash.slice(1) in GAMES ? location.hash.slice(1) : "frota-oculta";
let current;
let records = {};
try {
  const raw = JSON.parse(localStorage.getItem(STORAGE) || "{}");
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    records = Object.fromEntries(Object.entries(raw).filter(([key, value]) =>
      /^(frota-oculta|cartas-de-cerco):(recruta|tatico|veterano)$/.test(key) &&
      Number.isSafeInteger(value) && value >= 0 && value < 100000));
  }
} catch { records = {}; }
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}
function action(label, callback, className = "", disabled = false) {
  const b = el("button", className, label);
  b.type = "button";
  b.disabled = disabled;
  b.addEventListener("click", callback);
  return b;
}
function number(seed) {
  return Math.floor((seed >>> 0) % 100000) + 31;
}
function newGame(id = gameId) {
  if (!GAMES[id]) return;
  gameId = id;
  const mode = $("difficulty").value;
  const seed = number(Math.floor(Math.random() * 0xffffffff));
  current = GAMES[id].init({ difficulty: mode, seed });
  if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
  document.querySelectorAll("[data-select]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.select === id));
  });
  render();
}
function bestKey() { return gameId + ":" + current.mode; }
function update(next) {
  if (next === current) return;
  current = next;
  if (current.phase === "won") {
    const key = bestKey();
    if ((records[key] || 0) < current.score) {
      records = { ...records, [key]: current.score };
      try { localStorage.setItem(STORAGE, JSON.stringify(records)); } catch { /* Optional scores */ }
    }
  }
  render();
  if (current.phase === "playing") {
    ($("board").querySelector("button:not(:disabled)") || $("actions").querySelector("button:not(:disabled)") || $("restart")).focus({ preventScroll: true });
  } else $("restart").focus({ preventScroll: true });
}
function metric(title, value) {
  const box = el("div", "metric");
  box.append(el("small", "", title), el("strong", "", value));
  return box;
}
function renderNaval() {
  const board = $("board"), actions = $("actions");
  board.className = "board naval-board";
  board.setAttribute("aria-label", "Setores marítimos — seis linhas e seis colunas");
  board.replaceChildren();
  const labels = { hit: "navio atingido", miss: "água livre", hidden: "não investigado" };
  for (let cell = 0; cell < 36; cell++) {
    const fired = current.shots.includes(cell);
    const hit = fired && current.enemyShips.includes(cell);
    const revealed = current.phase !== "playing" && current.enemyShips.includes(cell);
    const state = hit ? "hit" : fired ? "miss" : revealed ? "revealed" : "hidden";
    const row = Math.floor(cell / 6) + 1, col = (cell % 6) + 1;
    const button = action(hit ? "✹" : fired ? "·" : revealed ? "◇" : "", () =>
      update(commandNaval(current, { type: "fire", cell })), "sea-cell", fired || current.phase !== "playing");
    button.dataset.status = state;
    button.setAttribute("aria-label", "Linha " + row + ", coluna " + col + ": " +
      (labels[state] || "navio revelado"));
    button.dataset.cell = String(cell);
    board.append(button);
  }
  $("metrics").replaceChildren(
    metric("Turnos", current.turn + " / " + current.maxTurns),
    metric("Integridade", current.hull + " / " + current.maxHull),
    metric("Acertos", current.shots.filter(cell => current.enemyShips.includes(cell)).length + " / " + current.enemyShips.length),
    metric("Sonar", current.sonar),
  );
  $("legend").textContent = "✹ Acerto · · Falha · ◇ Navio revelado ao final";
  actions.replaceChildren();
  actions.append(el("h4", "", "Sonar por linha"));
  const sonar = el("div", "sonar-row");
  for (let row = 0; row < 6; row++) {
    const button = action(String(row + 1), () =>
      update(commandNaval(current, { type: "sonar", row })),
    "", current.phase !== "playing" || current.sonar <= 0);
    button.setAttribute("aria-label", "Usar sonar na linha " + (row + 1));
    sonar.append(button);
  }
  actions.append(sonar);
  actions.append(action("Reparar base (" + current.repairs + ")", () =>
    update(commandNaval(current, { type: "repair" })), "secondary",
    current.phase !== "playing" || current.repairs <= 0 || current.hull === current.maxHull));
  if (current.intel) actions.append(el("p", "intel", "Sonar linha " + (current.intel.row + 1) +
    ": " + current.intel.count + " contato(s) detectado(s)."));
}
function renderSiege() {
  const board = $("board"), actions = $("actions");
  board.className = "board siege-board";
  board.setAttribute("aria-label", "Duelo de fortalezas");
  board.replaceChildren();
  const enemy = el("div", "fortress enemy");
  enemy.append(el("span", "fortress-glyph", "♜"), el("strong", "", "Fortaleza rival"),
    el("small", "", current.enemyHealth + " / " + current.maxEnemyHealth + " de vida"));
  const center = el("div", "duel-center", "VS");
  const player = el("div", "fortress player");
  player.append(el("span", "fortress-glyph", "♜"), el("strong", "", "Sua fortaleza"),
    el("small", "", current.health + " / " + current.maxHealth + " de vida"));
  board.append(enemy, center, player);
  $("metrics").replaceChildren(
    metric("Rodada", current.round + " / " + current.maxRounds),
    metric("Energia", current.energy),
    metric("Escudo", current.shield),
    metric("Cartas jogadas", current.used),
  );
  $("legend").textContent = "Ataque + defesa + administração de energia · mão renovada a cada rodada";
  actions.replaceChildren(el("h4", "", "Suas cartas"));
  const hand = el("div", "hand");
  for (const id of current.hand) {
    const card = SIEGE_CARDS.find(c => c.key === id.split(":")[0]);
    if (!card) continue;
    const button = action("", () => update(playSiegeCard(current, id)), "hand-card",
      current.phase !== "playing" || card.cost > current.energy);
    button.append(el("span", "card-cost", "⚡ " + card.cost), el("strong", "", card.name),
      el("small", "", card.description));
    button.setAttribute("aria-label", "Jogar " + card.name + ", custa " + card.cost + " energia");
    hand.append(button);
  }
  actions.append(hand);
  actions.append(action("Encerrar turno · receber ataque rival", () =>
    update(endSiegeTurn(current)), "end-turn", current.phase !== "playing"));
}
function render() {
  const config = GAMES[gameId];
  $("game-title").textContent = config.name;
  $("guide").textContent = config.intro;
  $("instructions").textContent = config.instructions;
  if (gameId === "frota-oculta") renderNaval();
  else renderSiege();
  $("message").textContent = current.message;
  $("message").dataset.phase = current.phase;
  $("record").textContent = current.phase === "won"
    ? "Vitória: " + current.score + " pontos. Melhor recorde: " + (records[bestKey()] || current.score)
    : "Recorde neste aparelho: " + (records[bestKey()] || "—");
  document.querySelectorAll("[data-select]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.select === gameId));
  });
}
document.querySelectorAll("[data-select]").forEach(button =>
  button.addEventListener("click", () => newGame(button.dataset.select)));
$("difficulty").addEventListener("change", () => newGame());
$("restart").addEventListener("click", () => newGame());
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (id in GAMES && id !== gameId) newGame(id);
});
newGame(gameId);
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {}));
}
