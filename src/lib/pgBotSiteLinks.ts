/** Links para a central independente. Não compartilhe estado privado da partida. */
const PG_BOT_ORIGIN="https://pabloguilherme1121.github.io/PG-Bot/";
export function pgBotSiteUrl(environment:"arcade"|"estrategia",gameId?:string):string{
 const url=new URL(PG_BOT_ORIGIN);
 url.searchParams.set("projeto",environment);
 if(gameId&&/^[a-z0-9][a-z0-9-]{0,63}$/.test(gameId)){
  url.searchParams.set("jogo",gameId);
 }
 return url.href;
}
