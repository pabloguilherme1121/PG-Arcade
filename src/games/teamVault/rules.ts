export type VaultPlayers = 2|3|4;
export type VaultPhase = "handoff"|"clue"|"guess"|"won"|"lost";
export type VaultClue = Readonly<{player:number;positions: readonly number[]}>;
export type VaultAttempt = Readonly<{guess:string;exact:number;shared:number}>;
export type VaultGame = Readonly<{
  players:VaultPlayers; seed:number; secret:readonly number[];
  clues:readonly VaultClue[]; viewed:readonly boolean[]; player:number;
  phase:VaultPhase; guess:string; history:readonly VaultAttempt[]; score:number;
}>;
const roll = (seed:number) => (Math.imul(seed,1664525)+1013904223)>>>0;
/** Fully local pass-and-play, not a server-backed secret or online room. */
export function createVault(players:VaultPlayers=2,seed=1):VaultGame {
  if(![2,3,4].includes(players)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
    throw new Error("Configuração inválida do cofre.");
  const pool=[1,2,3,4,5,6,7,8,9];
  let current=seed;
  for(let i=pool.length-1;i>0;i--) {
    current=roll(current);
    const j=current%(i+1);
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  const secret=pool.slice(0,4);
  const clues=Array.from({length:players},(_,player)=>({
    player,
    positions:[0,1,2,3].filter(slot=>slot%players===player),
  }));
  return {players,seed,secret,clues,viewed:Array(players).fill(false),
    player:0,phase:"handoff",guess:"",history:[],score:0};
}
export function revealClue(game:VaultGame):VaultGame {
  if(game.phase!=="handoff"||game.viewed[game.player])return game;
  const viewed=[...game.viewed];viewed[game.player]=true;
  return {...game,viewed,phase:"clue"};
}
export function hideClue(game:VaultGame):VaultGame {
  if(game.phase!=="clue")return game;
  const next=game.player+1;
  return {...game,player:next===game.players?game.player:next,
    phase:next===game.players?"guess":"handoff"};
}
export function enterCode(game:VaultGame,code:string):VaultGame {
  if(game.phase!=="guess"||!/^\d{4}$/.test(code)||code.includes("0")||
     new Set(code).size!==4)return game;
  return {...game,guess:code};
}
export function submitCode(game:VaultGame):VaultGame {
  if(game.phase!=="guess"||!/^[1-9]{4}$/.test(game.guess))return game;
  const solution=game.secret.join("");
  const exact=Array.from(game.guess).filter((c,i)=>c===solution[i]).length;
  const shared=Array.from(game.guess).filter(c=>solution.includes(c)).length-exact;
  const history=[...game.history,{guess:game.guess,exact,shared}];
  const won=exact===4, lost=!won&&history.length>=4;
  return {...game,history,guess:"",phase:won?"won":lost?"lost":"guess",
    score:won?Math.max(100,500-(history.length-1)*100):0};
}
export function nextVault(game:VaultGame):VaultGame {
  return createVault(game.players,roll(game.seed));
}
