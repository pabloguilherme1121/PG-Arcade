import { describe, expect, it } from "vitest";
import { games } from "./catalog";
import { modeTags, filterByMode, recommendGames, modeLabel } from "./smartDiscovery";

describe("PG Arcade: metadados dos modos e descoberta inteligente",()=>{
  it('only offers swipes for engines with direct gesture handlers',()=>{
    const supported=filterByMode(games,'deslizar',{},[]).map(g=>g.id);
    for(const id of ['snake','2048','wordsearch','slideblock','labirinto','sokoban','match3','runner','ski']) expect(supported).toContain(id);
    for(const id of ['xadrez','rhythm','balloons','arithmetic','sudoku']) expect(supported).not.toContain(id);
    expect(new Set(supported).size).toBe(supported.length);
  });
  it("tem classificação determinística para os 101 jogos sem inventar modos",()=>{
    expect(games).toHaveLength(101);
    for(const game of games){
      const tags=modeTags(game);
      expect(tags).toContain("classico");
      expect(new Set(tags).size).toBe(tags.length);
      expect(tags.every(t=>modeLabel(t).length>0)).toBe(true);
    }
  });
  it("restringe duelo e bot aos jogos com modos efetivos",()=>{
    for(const mode of ["dupla","bot"] as const){
      const matching=games.filter(g=>modeTags(g).includes(mode));
      expect(matching.map(g=>g.id).sort()).toEqual(["damas","domino","liga4","velha","xadrez"]);
    }
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
    expect(filterByMode(games,"dupla",visited,favorites)).toHaveLength(5);
    expect(filterByMode(games,"todos",visited,favorites)).toHaveLength(101);
  });
  it("prioriza preferências locais com desempate previsível e sem mutações",()=>{
    const input=[...games];
    const result=recommendGames(input,{favorites:["damas"],visits:{damas:3,xadrez:2},last:"xadrez"});
    expect(result[0].id).toBe("damas");
    expect(result).toHaveLength(101);
    expect(new Set(result.map(g=>g.id)).size).toBe(101);
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
    expect(filterByMode(games, "nao-jogados", visits, [])).toHaveLength(99);
    expect(filterByMode(games, "jogados", {}, ["xadrez"])).toHaveLength(0);
    expect(visits).toEqual({ xadrez: 2, domino: 0, liga4: 1 });
  });
});
