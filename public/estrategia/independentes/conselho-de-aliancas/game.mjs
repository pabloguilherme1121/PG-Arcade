// Décimo jogo independente: negociação política abstrata entre três facções fictícias.
// Motor puro e determinístico. Não acessa DOM, rede, cookies nem armazenamento.
const SETTINGS = Object.freeze({
  recruta: {limit:16, treasury:9, trust:8, influence:4, pressure:1},
  tatico: {limit:14, treasury:8, trust:7, influence:4, pressure:1},
  veterano: {limit:12, treasury:7, trust:6, influence:3, pressure:2},
});
export const COUNCIL_FACTIONS = Object.freeze([
  {name:'Costa',seats:3},
  {name:'Montanha',seats:2},
  {name:'Floresta',seats:2},
]);
export const COUNCIL_MODES = Object.freeze(['reformas','estabilidade']);
const clamp = value => Math.max(0,Math.min(10,value));

export function createCouncil({mode='reformas',difficulty='recruta',seed=1}={}) {
  if(!COUNCIL_MODES.includes(mode)) throw new Error('Modo desconhecido');
  if(!Object.hasOwn(SETTINGS,difficulty)) throw new Error('Dificuldade desconhecida');
  const settings=SETTINGS[difficulty];
  const safeSeed=Number.isSafeInteger(seed)?seed>>>0:1;
  return {
    mode,difficulty,seed:safeSeed,round:0,limit:settings.limit,
    treasury:settings.treasury,trust:settings.trust,influence:settings.influence,
    support:[5,4,3+(safeSeed%2)],laws:0,paused:false,phase:'playing',
    notice:'Negocie com as facções para formar uma maioria no Conselho.',
  };
}

export function councilVotes(state) {
  return COUNCIL_FACTIONS.reduce((sum,f,i)=>sum+(state.support[i]>=5?f.seats:0),0);
}

export function availableCouncilActions(s) {
  if(s.phase!=='playing'||s.paused)return [];
  const actions=['fund'];
  if(s.treasury>=1)actions.push('negotiate');
  if(s.treasury>=2)actions.push('outreach','campaign');
  if(s.treasury>=1&&s.influence>=2&&councilVotes(s)>=5)actions.push('propose');
  return actions;
}

export function commandCouncil(state,action) {
  if(!state||state.phase!=='playing'||!action||typeof action.type!=='string')return state;
  if(action.type==='pause')return state.paused?state:{...state,paused:true,notice:'Partida pausada.'};
  if(action.type==='resume')return state.paused?{...state,paused:false,notice:'Partida retomada.'}:state;
  if(state.paused)return state;
  const valid=availableCouncilActions(state);
  if(!valid.includes(action.type))return state;
  if((action.type==='negotiate'||action.type==='outreach')&&
    (!Number.isInteger(action.faction)||action.faction<0||action.faction>=COUNCIL_FACTIONS.length))return state;

  const next={...state,support:[...state.support],round:state.round+1};
  if(action.type==='negotiate') {
    next.treasury--;
    next.influence=clamp(next.influence+1);
    next.support[action.faction]=clamp(next.support[action.faction]+3);
    next.notice='Acordo negociado. A facção ampliou seu apoio.';
  }
  if(action.type==='outreach') {
    next.treasury-=2;
    next.trust=clamp(next.trust+2);
    next.support[action.faction]=clamp(next.support[action.faction]+1);
    next.notice='A comunidade ganhou voz e a confiança subiu.';
  }
  if(action.type==='campaign') {
    next.treasury-=2;
    next.influence=clamp(next.influence+3);
    next.trust=clamp(next.trust-1);
    next.notice='A campanha ampliou a influência, mas desgastou a confiança.';
  }
  if(action.type==='fund') {
    next.treasury+=3;
    next.trust=clamp(next.trust-1);
    next.notice='O caixa foi reforçado, com custo de confiança.';
  }
  if(action.type==='propose') {
    next.treasury--;
    next.influence-=2;
    next.laws++;
    next.trust=clamp(next.trust+1);
    next.support=next.support.map(value=>value>=5?value-1:value);
    next.notice='Reforma aprovada pela maioria do Conselho!';
  }
  // Facção rival reage ao fim de cada rodada. A semente afeta o alvo.
  const pressure=SETTINGS[state.difficulty].pressure;
  const target=(state.seed+state.round)%next.support.length;
  next.support[target]=clamp(next.support[target]-pressure);
  if(next.trust===0){
    next.phase='lost';next.notice='Derrota: a confiança pública chegou a zero.';
  }else if(next.mode==='reformas'&&next.laws>=3) {
    next.phase='won';next.notice='Vitória! Três reformas aprovadas por negociação.';
  }else if(next.round>=next.limit) {
    const stable=next.mode==='estabilidade'&&next.trust>=5&&councilVotes(next)>=5;
    next.phase=stable?'won':'lost';
    next.notice=stable?'Vitória! O Conselho encerrou estável e com maioria.':'Fim do prazo: o objetivo não foi alcançado.';
  }
  return next;
}
