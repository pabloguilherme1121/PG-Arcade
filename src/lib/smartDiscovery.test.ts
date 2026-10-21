import { CATALOG_SIZE } from "./catalogRelease";
import { describe, expect, it } from "vitest";
import { games } from "./catalog";
import { countModes, discoveryFilters, modeTags, previewModeTags, filterByMode, recommendGames, chooseSurprise, modeLabel } from "./smartDiscovery";

describe("PG Arcade: metadados dos modos e descoberta inteligente",()=>{
  it("renders at most two honest mode chips and falls back to Clássico", () => {
    const duel = games.find(game => game.id === "xadrez")!;
    const casual = games.find(game => game.id === "futebol")!;
    const full = modeTags(duel);
    expect(previewModeTags(duel)).toEqual(["sem-pressa", "dupla"]);
    expect(previewModeTags(casual)).toEqual(["classico"]);
    expect(modeTags(duel)).toEqual(full);
    expect(games.every(game => previewModeTags(game).length >= 1 && previewModeTags(game).length <= 2)).toBe(true);
  });

  it('only offers swipes for engines with direct gesture handlers',()=>{
    const supported=filterByMode(games,'deslizar',{},[]).map(g=>g.id);
    for(const id of ['snake','2048','wordsearch','slideblock','labirinto','sokoban','match3','runner','ski']) expect(supported).toContain(id);
    for(const id of ['xadrez','rhythm','balloons','arithmetic','sudoku']) expect(supported).not.toContain(id);
    expect(new Set(supported).size).toBe(supported.length);
  });
  it("tem classificação determinística para os 116 jogos sem inventar modos",()=>{
    expect(games).toHaveLength(CATALOG_SIZE);
    for(const game of games){
      const tags=modeTags(game);
      expect(tags).toContain("classico");
      expect(new Set(tags).size).toBe(tags.length);
      expect(tags.every(t=>modeLabel(t).length>0)).toBe(true);
    }
  });
  it("mostra somente jogos com suporte real para grupo local de 3–4 pessoas", () => {
    const group = filterByMode(games, "grupo", {}, []);
    expect(group.map(game => game.id)).toEqual(["contrato", "passagem", "cofre", "leilao", "comum"]);
    expect(countModes(games, {}, []).grupo).toBe(5);
    for (const game of games) {
      expect(modeTags(game).includes("grupo")).toBe(game.id === "leilao" || game.id === "comum" || game.id === "cofre" || game.id === "passagem" || game.id === "contrato");
    }
  });
  it("restringe duelo e bot aos jogos com modos efetivos",()=>{
    expect(filterByMode(games, 'dupla', {}, []).map(g=>g.id).sort()).toEqual(["cofre","comum","contrato","damas","domino","leilao","liga4","passagem","velha","xadrez"]);
    expect(filterByMode(games, 'bot', {}, []).map(g=>g.id).sort()).toEqual(["ataxx","breakthrough","chomp","damas","domino","gomoku","hex","isolation","leilao","liga4","mancala","nim","pontes","reversi","territory","velha","xadrez"]);
  });
  it("classifica treino e sobrevivência sem alterar os motores",()=>{
    expect(modeTags(games.find(g=>g.id==="pesca")!)).toContain("treino");
    expect(modeTags(games.find(g=>g.id==="rally")!)).toContain("sobrevivencia");
    expect(modeTags(games.find(g=>g.id==="estrelas")!)).toContain("rapido");
    expect(modeTags(games.find(g=>g.id==="palavra")!)).not.toContain("dupla");
  });
  it("combina modos, jogo não experimentado e favoritos sem falsear progresso",()=>{
    const visited={xadrez:2,domino:1};
    const favorites=["xadrez"];
    expect(filterByMode(games,"nao-jogados",visited,favorites).some(g=>g.id==="xadrez")).toBe(false);
    expect(filterByMode(games,"favoritos",visited,favorites).map(g=>g.id)).toEqual(["xadrez"]);
    expect(filterByMode(games,"dupla",visited,favorites)).toHaveLength(10);
    expect(filterByMode(games,"todos",visited,favorites)).toHaveLength(CATALOG_SIZE);
  });
  it("jogo surpresa prioriza inéditos, evita repetir o último e respeita o filtro ativo", () => {
    const options = games.filter(game => game.id === "leilao" || game.id === "comum");
    const original = [...options];
    expect(chooseSurprise([], { last: "leilao", visits: {} }, () => 0)).toBeNull();
    expect(chooseSurprise(options, { last: "leilao", visits: { leilao: 1 } }, () => 0)?.id).toBe("comum");
    expect(chooseSurprise(options, { last: "comum", visits: { leilao: 1, comum: 2 } }, () => 0)?.id).toBe("leilao");
    expect(chooseSurprise([options[0]], { last: "leilao", visits: { leilao: 1 } }, () => 0)?.id).toBe("leilao");
    expect(chooseSurprise(options, { last: null, visits: {} }, () => 0)?.id).toBe("leilao");
    expect(chooseSurprise(options, { last: null, visits: {} }, () => 0.999)?.id).toBe("comum");
    expect(options).toEqual(original);
  });
  it("prioriza preferências locais com desempate previsível e sem mutações",()=>{
    const input=[...games];
    const result=recommendGames(input,{favorites:["damas"],visits:{damas:3,xadrez:2},last:"xadrez"});
    expect(result[0].id).toBe("damas");
    expect(result).toHaveLength(CATALOG_SIZE);
    expect(new Set(result.map(g=>g.id)).size).toBe(CATALOG_SIZE);
    expect(input).toEqual(games);
    expect(recommendGames(input,{favorites:[],visits:{},last:null})).toEqual(games);
  });
  it("keeps the previous category when unplayed candidates exclude the last game",()=>{
    const history={favorites:[],visits:{xadrez:2},last:"xadrez" as const};
    const candidates=filterByMode(games,"nao-jogados",history.visits,history.favorites);
    expect(candidates.some(g=>g.id==="xadrez")).toBe(false);
    const result=recommendGames(candidates,history);
    expect(result[0].category).toBe(games.find(g=>g.id==="xadrez")!.category);
    expect(new Set(result.map(g=>g.id))).toEqual(new Set(candidates.map(g=>g.id)));
  });

  it("filters already played games using actual local visits rather than favorites or records", () => {
    const visits = { xadrez: 2, domino: 0, liga4: 1 };
    const played = filterByMode(games, "jogados", visits, ["domino"]);
    expect(played.map(game => game.id)).toEqual(games.filter(game => game.id === "xadrez" || game.id === "liga4").map(game => game.id));
    expect(filterByMode(games, "nao-jogados", visits, [])).toHaveLength(CATALOG_SIZE - 2);
    expect(filterByMode(games, "jogados", {}, ["xadrez"])).toHaveLength(0);
    expect(visits).toEqual({ xadrez: 2, domino: 0, liga4: 1 });
  });
});

describe("discovery facet counts", () => {
  it("matches actual results across narrowed catalogs and local history", () => {
    const visits = { xadrez: 2, domino: 0, liga4: 1 };
    const favorites = ["xadrez", "xadrez", "runner", "unknown"];
    for (const candidates of [games, games.filter(g => g.category === "Estratégia"), games.slice(0, 12), []]) {
      const counts = countModes(candidates, visits, favorites);
      for (const filter of [...discoveryFilters, { id: "classico" as const }]) {
        expect(counts[filter.id]).toBe(filterByMode(candidates, filter.id, visits, favorites).length);
      }
      expect(counts.jogados + counts["nao-jogados"]).toBe(candidates.length);
    }
  });
});
