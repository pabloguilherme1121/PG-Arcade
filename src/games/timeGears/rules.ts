export type GearDifficulty=0|1|2;
export type GearMove=Readonly<{index:number;direction:1|-1}>;
export type GearGame=Readonly<{
  difficulty:GearDifficulty;seed:number;turns:readonly number[];
  scramble:readonly GearMove[];history:readonly GearMove[];
  moves:number;phase:"playing"|"won";
}>;
const nextSeed=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
function step(turns:readonly number[],index:number,direction:1|-1):number[]{
  return turns.map((value,i)=>{
    const change=i===index?direction:Math.abs(i-index)===1?-direction:0;
    return (value+change+4)%4;
  });
}
export function newTimeGears(difficulty:GearDifficulty=0,seed=13):GearGame{
  if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
    throw new Error("Configuração inválida de engrenagens.");
  const count=4+difficulty;
  let random=seed,turns=Array<number>(count).fill(0);
  const scramble:GearMove[]=[];
  for(let i=0;i<6+4*difficulty;i++){
    random=nextSeed(random);
    const move:GearMove={index:(random>>>9)%count,direction:((random>>>17)&1)?1:-1};
    turns=step(turns,move.index,move.direction);scramble.push(move);
  }
  if(turns.filter(n=>n!==0).length<2){
    const move:GearMove={index:1,direction:1};
    turns=step(turns,move.index,move.direction);scramble.push(move);
    if(turns.filter(n=>n!==0).length<2){
      const extra:GearMove={index:count-2,direction:1};
      turns=step(turns,extra.index,extra.direction);scramble.push(extra);
    }
  }
  return {difficulty,seed,turns,scramble,history:[],moves:0,phase:"playing"};
}
export function rotateGear(game:GearGame,index:number,direction:1|-1):GearGame{
  if(game.phase!=="playing"||!Number.isInteger(index)||index<0||index>=game.turns.length||(direction!==1&&direction!==-1))return game;
  const turns=step(game.turns,index,direction);
  return {...game,turns,history:[...game.history,{index,direction}],moves:game.moves+1,
    phase:turns.every(n=>n===0)?"won":"playing"};
}
export function undoGear(game:GearGame):GearGame{
  if(!game.history.length)return game;
  const move=game.history[game.history.length-1];
  return {...game,turns:step(game.turns,move.index,move.direction===1?-1:1),
    history:game.history.slice(0,-1),moves:game.moves-1,phase:"playing"};
}
export function resetGears(game:GearGame):GearGame{return newTimeGears(game.difficulty,game.seed);}
export function nextGears(game:GearGame):GearGame{return newTimeGears(game.difficulty,nextSeed(game.seed));}
export function scoreGears(game:GearGame):number{
  return game.phase==="won"?Math.max(100,1000+game.difficulty*400-game.moves*22):0;
}