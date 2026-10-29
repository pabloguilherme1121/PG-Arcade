import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

function loadRules() {
  const source = readFileSync("public/pg-bot.js", "utf8");
  const module = { exports: {} };
  runInNewContext(source, { module, console });
  return module.exports;
}
test("PG Bot reconhece ajuda de jogos e recomendações específicas", () => {
  const { replyFor } = loadRules();
  assert.match(replyFor("dica", "Damas Táticas"), /captura (?:é )?obrigat[oó]ria/i);
  assert.match(replyFor("dica", "Hex Conexão"), /conect/i);
  assert.match(replyFor("como jogar", "Frota Oculta"), /tabuleiro|sonar/i);
});
test("PG Bot informa limites de contagem e privacidade sem prometer IA remota", () => {
  const { replyFor } = loadRules();
  assert.match(replyFor("150 jogos", ""), /150 missões.*6 sistemas/i);
  assert.match(replyFor("meus dados", ""), /aparelho|navegador/i);
  assert.match(replyFor("funciona offline?", ""), /offline|internet/i);
  assert.match(replyFor("ajuda abc desconhecido", ""), /ajuda|controles|jogo/i);
});
test("PG Bot não injeta HTML de mensagens na interface", () => {
  const source = readFileSync("public/pg-bot.js", "utf8");
  assert.ok(source.includes("textContent"), "Respostas devem ser inseridas como texto");
  assert.ok(!source.includes("innerHTML"), "Nunca inserir entradas do jogador como HTML");
});
test("PG Bot é referenciado no Arcade e no portal Estratégia com caminhos relativos", () => {
  const root = readFileSync("index.html", "utf8");
  const strategy = readFileSync("public/estrategia/index.html", "utf8");
  assert.match(root, /%BASE_URL%pg-bot\.js/);
  assert.match(root, /%BASE_URL%pg-bot\.css/);
  assert.match(strategy, /\.\.\/pg-bot\.js/);
  assert.match(strategy, /\.\.\/pg-bot\.css/);
});
