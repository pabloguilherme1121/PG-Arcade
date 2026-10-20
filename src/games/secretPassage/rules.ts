export type PassagePlayers=2|3|4;
export type PassageMove="up"|"right"|"down"|"left"|"wait";
export type PassagePhase="handoff"|"planning"|"result";
export type PassageFrame=Readonly<{positions:readonly number[];collisions:number}>;
export type PassageGame=Readonly<{
  players:PassagePlayers;seed:number;phase:PassagePhase;player:number;
  routes:readonly (readonly PassageMove[])[];draft:readonly PassageMove[];
  positions:readonly number[];walls:readonly number[];gems:readonly number[];
  claimed:readonly number[];scores:readonly number[];collisions:number;
  history:readonly PassageFrame[];winners:readonly number[];
}>;
const rng=(seed:number)=>(Math.imul(seed,1664525)+1013904223)>>>0;
const starts=[0,4,20,24];
const walls=[6,8,16,18];
export function createPassage(players:PassagePlayers=2,seed=1):PassageGame {
  if(![2,3,4].includes(players)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
    throw new Error("Jogadores ou semente inválidos.");
  const gems=[2,10,12,14,22];
  const rotated=seed%4;
  const chosen=[...gems.slice(0,4).slice(rotated),...gems.slice(0,4).slice(0,rotated),12];
  return {players,seed,phase:"handoff",player:0,
    routes:Array.from({length:players},()=>[]),draft:[],positions:starts.slice(0,players),
    walls,gems:chosen,claimed:[],scores:Array(players).fill(0),collisions:0,history:[],winners:[]};
}
export function startPlan(game:PassageGame):PassageGame {
  return game.phase==="handoff"?{...game,phase:"planning"}:game;
}
export function chooseMove(game:PassageGame,move:PassageMove):PassageGame {
  if(game.phase!=="planning"||game.draft.length>=4||
      !["up","right","down","left","wait"].includes(move))return game;
  return {...game,draft:[...game.draft,move]};
}
export function undoMove(game:PassageGame):PassageGame {
  return game.phase==="planning"&&game.draft.length>0?{...game,draft:game.draft.slice(0,-1)}:game;
}
function nextPosition(position:number,move:PassageMove,walls:readonly number[]):number {
  const row=Math.floor(position/5),col=position%5;
  const r=row+(move==="down"?1:move==="up"?-1:0);
  const c=col+(move==="right"?1:move==="left"?-1:0);
  if(r<0||r>=5||c<0||c>=5)return position;
  const target=r*5+c;
  return walls.includes(target)?position:target;
}
function resolve(game:PassageGame):PassageGame {
  let positions=[...game.positions],scores=[...game.scores],collisions=0;
  const claimed=new Set(game.claimed);
  const history:PassageFrame[]=[];
  for(let turn=0;turn<4;turn++){
    const proposals=positions.map((p,i)=>nextPosition(p,game.routes[i][turn],game.walls));
    // Resolve collisions to a fixed point. When one player is blocked, their
    // occupied tile must remain unavailable to players moving behind them.
    const invalid=new Set<number>();
    for(let pass=0;pass<=game.players;pass++){
      const effective=proposals.map((p,i)=>invalid.has(i)?positions[i]:p);
      let changed=false;
      for(let i=0;i<game.players;i++)for(let j=i+1;j<game.players;j++){
        const collide=effective[i]===effective[j] ||
          (effective[i]===positions[j]&&effective[j]===positions[i] &&
            effective[i]!==positions[i]);
        if(!collide)continue;
        if(!invalid.has(i)){invalid.add(i);changed=true;}
        if(!invalid.has(j)){invalid.add(j);changed=true;}
      }
      if(!changed)break;
    }
    const updated=proposals.map((p,i)=>invalid.has(i)?positions[i]:p);
    collisions+=invalid.size;
    for(let player=0;player<game.players;player++){
      if(updated[player]===positions[player])continue;
      scores[player]+=5;
      if(game.gems.includes(updated[player])&&!claimed.has(updated[player])){
        claimed.add(updated[player]);
        scores[player]+=updated[player]===12?100:25;
      }
    }
    positions=updated;
    history.push({positions:[...positions],collisions:invalid.size});
  }
  const highest=Math.max(...scores);
  const winners=scores.flatMap((score,i)=>score===highest?[i]:[]);
  return {...game,phase:"result",positions,scores,collisions,
    claimed:[...claimed],history,winners,draft:[]};
}
export function lockPlan(game:PassageGame):PassageGame {
  if(game.phase!=="planning"||game.draft.length!==4)return game;
  const routes=game.routes.map((path,i)=>i===game.player?[...game.draft]:path);
  if(game.player+1===game.players) return resolve({...game,routes,draft:[]});
  return {...game,player:game.player+1,phase:"handoff",draft:[],routes};
}
export function replayPassage(game:PassageGame):PassageGame {
  return createPassage(game.players,rng(game.seed));
}
