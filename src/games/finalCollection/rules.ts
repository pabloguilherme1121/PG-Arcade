import type { FinalId } from '../../lib/finalCatalog';
export type State = { cells: number[]; moves: number; history: number[][] };
const indices = Array.from({length:16}, (_,i)=>i);
export const adjacent = (a:number,b:number) => Math.abs((a/4|0)-(b/4|0))+Math.abs(a%4-b%4)===1;
const touching = (a:number,b:number) => a!==b && Math.max(Math.abs((a/4|0)-(b/4|0)),Math.abs(a%4-b%4))<=1;
export function components(list:number[]) {
  const remaining=new Set(list), groups:number[][]=[];
  while(remaining.size){const queue=[remaining.values().next().value!];remaining.delete(queue[0]);
    for(const i of queue)for(const j of [...remaining])if(adjacent(i,j)){remaining.delete(j);queue.push(j)}
    groups.push(queue);
  }return groups;
}
const bits = (list:number[]) => indices.map(i=>Number(list.includes(i)));
const row=(i:number)=>i/4|0, col=(i:number)=>i%4;
export const solutions: Partial<Record<FinalId,number[]>> = {
  lanternas:bits([0,6,9,15]),hitori:bits([0,6,9,15]),kakurasu:bits([0,2,5,6,8,11,13,15]),
  tendas:bits([0,3,12,15]),termometros:bits([3,5,7,9,10,11,12,13,14,15]),
  aquarios:bits([4,5,2,3,6,7,14,15]),constelacao:bits([1,7,8,14]),
  retangulos:[1,1,2,2,1,1,2,2,3,3,4,4,3,3,4,4],
  ilhas:bits([0,1,3,4,7,8,10]),visibilidade:bits([5,10]),mosaico:bits([0,2,3,5,8,9,11,14]),
  'trilha-soma':bits([0,1,5,6,10,11,15]),mochila:[0,0,1,0,1],panquecas:[1,2,3,4],
  sapos:[-1,-1,0,1,1],baldes:[3,4],restos:[2,3,4],
};
export const trees=[1,7,8,14];
export const islandClues=[{at:0,size:4},{at:3,size:2},{at:10,size:1}];
export const rectangleClues=[{at:0,size:4},{at:3,size:4},{at:12,size:4},{at:15,size:4}];
export const hitoriNumbers=indices.map(i=>[0,6,9,15].includes(i)?(row(i)+(col(i)+1)%4)%4+1:(row(i)+col(i))%4+1);
export const trailNumbers=indices.map(i=>i%4+1);
export const weights=[2,3,4,5,6], values=[3,5,7,9,11], capacity=10;
export const dominoNumbers=[0,0,0,1,0,2,0,3,1,1,1,2,1,3,2,2];
export const edges=indices.flatMap(i=>[...(col(i)<3?[[i,i+1]]:[]),...(row(i)<3?[[i,i+4]]:[])]);
solutions.dominosa=edges.map(([a,b])=>Number(row(a)===row(b)&&a%2===0));
export function lineTotals(cells:number[], weighted=false) {
  return {rows:[0,1,2,3].map(r=>indices.filter(i=>row(i)===r).reduce((s,i)=>s+cells[i]*(weighted?col(i)+1:1),0)),
    cols:[0,1,2,3].map(c=>indices.filter(i=>col(i)===c).reduce((s,i)=>s+cells[i]*(weighted?row(i)+1:1),0))};
}
export const nearbyCount=(cells:number[],i:number)=>indices.filter(j=>j===i||touching(i,j)).reduce((s,j)=>s+cells[j],0);
export function visible(cells:number[],i:number){let n=1;for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){
  let r=row(i)+dr,c=col(i)+dc;while(r>=0&&r<4&&c>=0&&c<4&&!cells[r*4+c]){n++;r+=dr;c+=dc}
}return n}
const equal=(a:number[],b:number[])=>a.length===b.length&&a.every((v,i)=>v===b[i]);
export function initial(id:FinalId):State {
  const cells=id==='baldes'?[0,0]:id==='panquecas'?[3,1,4,2]:id==='sapos'?[1,1,0,-1,-1]:id==='restos'?[0,0,0]:Array(id==='dominosa'?edges.length:id==='mochila'?5:16).fill(0);
  return {cells,moves:0,history:[]};
}
export function won(id:FinalId,c:number[]):boolean {
  if(c.length!==initial(id).cells.length || c.some(n=>!Number.isInteger(n)))return false;
  const selected=indices.filter(i=>c[i]===1);
  const solution=solutions[id]!;
  switch(id){
    case 'lanternas':return c.every(n=>n===0||n===1)&&selected.length===4&&selected.every((i,k)=>selected.every((j,l)=>k===l||(row(i)!==row(j)&&col(i)!==col(j))));
    case 'hitori':return selected.every(i=>selected.every(j=>!adjacent(i,j)))&&components(indices.filter(i=>!c[i])).length===1&&[0,1,2,3].every(n=>[indices.filter(i=>row(i)===n&&!c[i]),indices.filter(i=>col(i)===n&&!c[i])].every(line=>new Set(line.map(i=>hitoriNumbers[i])).size===line.length));
    case 'kakurasu':{const a=lineTotals(c,true),b=lineTotals(solution,true);return equal(a.rows,b.rows)&&equal(a.cols,b.cols)}
    case 'tendas':{const a=lineTotals(c),b=lineTotals(solution);if(!equal(a.rows,b.rows)||!equal(a.cols,b.cols)||trees.some(i=>c[i])||selected.some(i=>selected.some(j=>touching(i,j))))return false;
      const assign=(t:number,used:number[]):boolean=>t===trees.length||selected.some(i=>!used.includes(i)&&adjacent(i,trees[t])&&assign(t+1,[...used,i]));return selected.length===trees.length&&assign(0,[])}
    case 'termometros':return equal(lineTotals(c).rows,lineTotals(solution).rows)&&indices.every(i=>row(i)===3||!c[i]||!!c[i+4]);
    case 'aquarios':return equal(lineTotals(c).rows,lineTotals(solution).rows)&&equal(lineTotals(c).cols,lineTotals(solution).cols)&&[0,2,8,10].every(i=>c[i]===c[i+1]&&c[i+4]===c[i+5]&&c[i]<=c[i+4]);
    case 'constelacao':return equal(lineTotals(c).rows,[1,1,1,1])&&equal(lineTotals(c).cols,[1,1,1,1])&&!selected.some(i=>selected.some(j=>touching(i,j)));
    case 'dominosa':{const chosen=edges.filter((_,i)=>c[i]);const counts=indices.map(i=>chosen.filter(e=>e.includes(i)).length);const pairs=chosen.map(e=>e.map(i=>dominoNumbers[i]).sort().join('-'));return counts.every(n=>n===1)&&new Set(pairs).size===8}
    case 'retangulos':return c.every(n=>n>=1&&n<=4)&&[1,2,3,4].every(n=>{const group=indices.filter(i=>c[i]===n),clues=rectangleClues.filter(q=>group.includes(q.at));return clues.length===1&&group.length===clues[0].size&&(Math.max(...group.map(row))-Math.min(...group.map(row))+1)*(Math.max(...group.map(col))-Math.min(...group.map(col))+1)===group.length});
    case 'ilhas':{const land=components(selected),water=indices.filter(i=>!c[i]);return land.length===3&&land.every(g=>{const clues=islandClues.filter(q=>g.includes(q.at));return clues.length===1&&clues[0].size===g.length})&&components(water).length===1&&!indices.filter(i=>row(i)<3&&col(i)<3).some(i=>[i,i+1,i+4,i+5].every(j=>!c[j]))}
    case 'visibilidade':return ![0,3,6,9,12,15].some(i=>c[i]||visible(c,i)!==visible(solution,i))&&components(indices.filter(i=>!c[i])).length===1&&!selected.some(i=>selected.some(j=>adjacent(i,j)));
    case 'mosaico':return indices.every(i=>nearbyCount(c,i)===nearbyCount(solution,i));
    case 'trilha-soma':return c[0]===1&&c[15]===1&&components(selected).length===1&&selected.every(i=>selected.filter(j=>adjacent(i,j)).length===([0,15].includes(i)?1:2))&&selected.reduce((s,i)=>s+trailNumbers[i],0)===solutions[id]!.reduce((s,v,i)=>s+v*trailNumbers[i],0);
    case 'baldes':return c[0]>=0&&c[0]<=3&&c[1]===4;
    case 'mochila':return c.reduce((s,v,i)=>s+v*weights[i],0)<=capacity&&c.reduce((s,v,i)=>s+v*values[i],0)===18;
    case 'panquecas':return equal(c,[1,2,3,4]);
    case 'sapos':return equal(c,[-1,-1,0,1,1]);
    case 'restos':return c.every(v=>v>=0&&v<=6)&&(c[0]+c[1])%5===0&&(c[1]+c[2])%5===2&&(c[0]+c[2])%7===6&&c.reduce((s,v)=>s+v,0)===9;
  }
}
/** Every legal action is reversible; history contains only actual state changes. */
export function act(id:FinalId,state:State,index:number,paint=1):State {
  if(won(id,state.cells)||!Number.isInteger(index)||index<0)return state;
  const c=[...state.cells];
  if(id==='baldes'){
    if(index>5)return state;
    if(index===0)c[0]=3;if(index===1)c[1]=5;if(index===2)c[0]=0;if(index===3)c[1]=0;
    if(index===4){const n=Math.min(c[0],5-c[1]);c[0]-=n;c[1]+=n}
    if(index===5){const n=Math.min(c[1],3-c[0]);c[1]-=n;c[0]+=n}
  }else if(id==='panquecas'){if(index<2||index>4)return state;c.splice(0,index,...c.slice(0,index).reverse())}
  else if(id==='sapos'){if(index>=5||!c[index])return state;const d=c[index],one=index+d,two=index+d*2;
    if(one>=0&&one<5&&c[one]===0){c[one]=d;c[index]=0}
    else if(two>=0&&two<5&&c[one]===-d&&c[two]===0){c[two]=d;c[index]=0}else return state;
  }else if(index>=c.length)return state;
  else if(id==='restos')c[index]=(c[index]+1)%7;
  else if(id==='retangulos'){if(paint<1||paint>4)return state;c[index]=c[index]===paint?0:paint}
  else {if(id==='tendas'&&trees.includes(index))return state;if(id==='visibilidade'&&[0,3,6,9,12,15].includes(index))return state;c[index]=1-c[index]}
  if(equal(c,state.cells))return state;
  return {cells:c,moves:state.moves+1,history:[...state.history,state.cells]};
}
export const undo=(s:State):State=>s.history.length?{cells:s.history[s.history.length-1],moves:s.moves-1,history:s.history.slice(0,-1)}:s;
export const score=(s:State)=>Math.max(1,1000-s.moves*5);
