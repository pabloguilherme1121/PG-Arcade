export type Difficulty=0|1|2;
export type Island=Readonly<{id:number;x:number;y:number;goal:number}>;
export type Bridge=Readonly<{a:number;b:number;count:number;solution:number}>;
export type Archipelago=Readonly<{difficulty:Difficulty;seed:number;islands:readonly Island[];bridges:readonly Bridge[];moves:number;history:readonly (readonly number[])[];phase:"playing"|"won";score:number}>;
const layouts:readonly (readonly (readonly [number,number])[])[]=[
 [[0,0],[0,4],[2,0],[2,4],[4,0],[4,4]],
 [[0,0],[0,2],[0,4],[2,0],[2,4],[4,0],[4,2],[4,4]],
 [[0,0],[0,2],[0,4],[2,0],[2,2],[2,4],[4,0],[4,2],[4,4]]
];
const next=(v:number)=>(Math.imul(v,1664525)+1013904223)>>>0;
const possible=(a:readonly [number,number],b:readonly [number,number],pts:readonly (readonly [number,number])[])=>{
 if(a[0]!==b[0]&&a[1]!==b[1])return false;
 return !pts.some(p=>p!==a&&p!==b&&((a[0]===b[0]&&p[0]===a[0]&&p[1]>Math.min(a[1],b[1])&&p[1]<Math.max(a[1],b[1]))||(a[1]===b[1]&&p[1]===a[1]&&p[0]>Math.min(a[0],b[0])&&p[0]<Math.max(a[0],b[0]))));
};
export function bridgesCross(a:Bridge,b:Bridge,islands:readonly Island[]):boolean {
 if(a.a===b.a||a.a===b.b||a.b===b.a||a.b===b.b)return false;
 const p=islands[a.a],q=islands[a.b],r=islands[b.a],s=islands[b.b];
 if(p.y===q.y&&r.x===s.x)return r.x>Math.min(p.x,q.x)&&r.x<Math.max(p.x,q.x)&&p.y>Math.min(r.y,s.y)&&p.y<Math.max(r.y,s.y);
 if(p.x===q.x&&r.y===s.y)return p.x>Math.min(r.x,s.x)&&p.x<Math.max(r.x,s.x)&&r.y>Math.min(p.y,q.y)&&r.y<Math.max(p.y,q.y);
 return false;
}
export function isConnected(islands:readonly Island[],bridges:readonly Bridge[],solution=false){
 if(!islands.length)return false;
 const visited=new Set([0]);let changed=true;
 while(changed){changed=false;for(const b of bridges){if((solution?b.solution:b.count)===0)continue;
  if(visited.has(b.a)&&!visited.has(b.b)){visited.add(b.b);changed=true;}
  if(visited.has(b.b)&&!visited.has(b.a)){visited.add(b.a);changed=true;}
 }}return visited.size===islands.length;
}
export function solved(g:Archipelago):boolean {
 if(!isConnected(g.islands,g.bridges))return false;
 if(g.bridges.some((a,i)=>a.count>0&&g.bridges.some((b,j)=>j>i&&b.count>0&&bridgesCross(a,b,g.islands))))return false;
 return g.islands.every(island=>g.bridges.reduce((n,b)=>n+((b.a===island.id||b.b===island.id)?b.count:0),0)===island.goal);
}
export function createArchipelago(difficulty:Difficulty=0,seed=13):Archipelago {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Configuração inválida");
 const pts=layouts[difficulty],islandCoords=pts.map(([x,y],id)=>({id,x,y,goal:0}));
 const edges:Bridge[]=[];
 for(let a=0;a<pts.length;a++)for(let b=a+1;b<pts.length;b++)if(possible(pts[a],pts[b],pts))edges.push({a,b,count:0,solution:0});
 const parents=pts.map((_,i)=>i),root=(v:number):number=>{while(parents[v]!==v)v=parents[v];return v;};
 const ordered=edges.map((_,i)=>i).sort((a,b)=>next(seed^Math.imul(a+1,2654435761))-next(seed^Math.imul(b+1,2654435761))||a-b);
 for(const i of ordered){const e=edges[i],aa=root(e.a),bb=root(e.b);
  if(aa===bb||edges.some((other,j)=>j!==i&&other.solution>0&&bridgesCross(e,other,islandCoords)))continue;
  parents[aa]=bb;edges[i]={...e,solution:1+(next(seed+i+7919)%2)};
 }
 const islands=pts.map(([x,y],id)=>({id,x,y,goal:edges.reduce((n,b)=>n+(b.solution>0&&(b.a===id||b.b===id)?b.solution:0),0)}));
 if(!islands.every(i=>i.goal>0)||!isConnected(islands,edges,true))throw Error("Layout sem solução");
 return {difficulty,seed,islands,bridges:edges,moves:0,history:[],phase:"playing",score:0};
}
export function setBridge(g:Archipelago,index:number):Archipelago {
 if(g.phase!=="playing"||!Number.isInteger(index)||index<0||index>=g.bridges.length)return g;
 const edge=g.bridges[index],count=(edge.count+1)%3;
 if(count>0&&g.bridges.some((b,j)=>j!==index&&b.count>0&&bridgesCross(edge,b,g.islands)))return g;
 const bridges=g.bridges.map((b,j)=>j===index?{...b,count}:b);
 const draft={...g,bridges,history:[...g.history,g.bridges.map(b=>b.count)],moves:g.moves+1};
 const won=solved(draft);
 return {...draft,phase:won?"won":"playing",score:won?Math.max(50,1000-g.moves*12+g.difficulty*120):0};
}
export function undoBridge(g:Archipelago):Archipelago {
 if(!g.history.length)return g;
 const counts=g.history[g.history.length-1];
 return {...g,bridges:g.bridges.map((b,i)=>({...b,count:counts[i]})),history:g.history.slice(0,-1),moves:g.moves-1,phase:"playing",score:0};
}
export const restartArchipelago=(g:Archipelago)=>createArchipelago(g.difficulty,g.seed);
export const nextArchipelago=(g:Archipelago)=>createArchipelago(g.difficulty,next(g.seed));
