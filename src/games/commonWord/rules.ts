/** Transport-independent rules. Authoritative state must stay on the host/server. */
export type Phase = 'choosing' | 'reveal' | 'finished';
export type Match = Readonly<{
  players: readonly string[];
  rounds: readonly {prompt:string; options:readonly string[]}[];
  round: number;
  phase: Phase;
  choices: Readonly<Record<string,number>>;
  scores: Readonly<Record<string,number>>;
}>;
export function createMatch(players:readonly string[], rounds:Match['rounds']):Match {
  if(players.length<2 || players.length>4 || new Set(players).size!==players.length || players.some(p=>!p.trim() || p.length>40)) throw new Error('São necessários 2 a 4 participantes distintos.');
  if(!rounds.length || rounds.length>20 || rounds.some(r=>!r.prompt.trim() || r.options.length<3 || r.options.length>6 || new Set(r.options).size!==r.options.length || r.options.some(o=>!o.trim()))) throw new Error('Rodadas inválidas.');
  return {players:[...players],rounds:rounds.map(r=>({prompt:r.prompt,options:[...r.options]})),round:0,phase:'choosing',choices:{},scores:Object.fromEntries(players.map(p=>[p,0]))};
}
/** First submission wins. Duplicate and late commands cannot alter a round. */
export function choose(state:Match, player:string, round:number, choice:number):Match {
  if(state.phase!=='choosing' || round!==state.round || !state.players.includes(player) || Object.hasOwn(state.choices,player) || !Number.isInteger(choice) || choice<0 || choice>=state.rounds[state.round].options.length) return state;
  const choices={...state.choices,[player]:choice};
  if(Object.keys(choices).length<state.players.length) return {...state,choices};
  const scores={...state.scores};
  for(const id of state.players) scores[id]+=100*state.players.filter(other=>other!==id && choices[other]===choices[id]).length;
  return {...state,choices,scores,phase:'reveal'};
}
export function nextRound(state:Match):Match {
  if(state.phase!=='reveal') return state;
  if(state.round===state.rounds.length-1) return {...state,phase:'finished'};
  return {...state,round:state.round+1,phase:'choosing',choices:{}};
}
/** Never serialize the authoritative Match directly to another participant. */
export function playerView(state:Match,player:string) {
  if(!state.players.includes(player)) throw new Error('Participante desconhecido.');
  return {
    players:[...state.players],round:state.round,totalRounds:state.rounds.length,phase:state.phase,
    prompt:state.rounds[state.round].prompt,options:[...state.rounds[state.round].options],
    scores:{...state.scores},submitted:state.players.filter(id=>Object.hasOwn(state.choices,id)),
    ownChoice:state.choices[player]??null,
    revealed:state.phase==='choosing'?null:{...state.choices},
  };
}
