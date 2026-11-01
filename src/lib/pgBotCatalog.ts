import { games, type GameId } from "./catalog";
import { supportsPlayerMode } from "./discovery";

export type CatalogBotSuggestion = {id: GameId;name:string};
export type CatalogBotReply = {answer:string;suggestions:CatalogBotSuggestion[]};
const normalize=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const suggest=(items:ReadonlyArray<(typeof games)[number]>): CatalogBotSuggestion[] =>
  [...new Map(items.map(g=>[g.id,{id:g.id,name:g.name}])).values()].slice(0,3);
/** Recomenda somente IDs existentes; sem ranking inventado, rede ou rastreamento. */
export function catalogBotAnswer(question:string):CatalogBotReply {
 const q=typeof question==="string"&&question.length<=240?normalize(question):"";
 if(/offline|sem internet|sem conexao|sem rede/.test(q))return {
  answer:"Para jogar offline, abra o Arcade conectado ao menos uma vez e carregue os jogos desejados. O navegador pode guardar parte dos arquivos; jogos ainda não carregados podem exigir internet. Não existe sincronização entre aparelhos.",
  suggestions:[]
 };
 if(/favorit|record|pontua|salv|progresso/.test(q))return {
  answer:"Use o coração nos cartões para salvar favoritos. O painel Meu progresso reúne visitas e recordes registrados neste navegador. Limpar os dados do site pode apagar essas informações.",
  suggestions:[]
 };
 if(/dupla|dois jog|duas pessoas|amigo|multiplayer|multijogador/.test(q)) {
  const choices=games.filter(g=>supportsPlayerMode(g.id,"Dupla local"));
  return {answer:"Encontrei jogos do catálogo com opção de dois jogadores no mesmo aparelho. Confira as regras e a opção de modo dentro de cada jogo.",suggestions:suggest(choices)};
 }
 if(/estrateg|tabuleiro|raciocin|tatic/.test(q)){
  const choices=games.filter(g=>normalize(g.category).includes("estrateg")||normalize(g.category).includes("logica"));
  return {answer:"Estas são opções de estratégia ou lógica do catálogo. Abra um jogo para consultar sua dificuldade, seus controles e as dicas do PG Bot.",suggestions:suggest(choices)};
 }
 if(/rapid|curt|reflex|casual|arcade/.test(q)){
  const preferred:GameId[]=["snake","2048","memoria"];
  const choices=games.filter(g=>preferred.includes(g.id));
  return {answer:"Para uma partida curta, comece por uma destas opções. A duração depende do modo e das suas escolhas.",suggestions:suggest(choices)};
 }
 if(/sugir|indica|recomend|qualquer|escolh|surpresa|jogo/.test(q)){
  return {answer:"Estas são três opções reais do catálogo, sem classificação de popularidade. Escolha uma ou use a busca para encontrar outros estilos.",suggestions:suggest(games)};
 }
 return {answer:"Posso indicar jogos rápidos, de estratégia ou para duas pessoas e explicar favoritos, recordes e modo offline. Escolha um tema ou escreva sua preferência.",suggestions:[]};
}
