export type RuneDifficulty=0|1|2;
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const runes=[..."ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᛠᛡ"] as const;
export const challenges=[
  [{phrase:"LUA CLARA",hint:"Ilumina o céu à noite"},
   {phrase:"SOL NASCE",hint:"O amanhecer começa assim"},
   {phrase:"RIO AZUL",hint:"Água corrente de cor celeste"}],
  [{phrase:"PORTA SECRETA",hint:"Entrada que esconde um mistério"},
   {phrase:"TESOURO PERDIDO",hint:"Riqueza ainda não encontrada"},
   {phrase:"ESTRELA DISTANTE",hint:"Brilha longe no espaço"}],
  [{phrase:"MAPA DO LABIRINTO",hint:"Ajuda a escapar de corredores confusos"},
   {phrase:"GUARDIAO DA FLORESTA",hint:"Protege as árvores de um bosque"},
   {phrase:"MISTERIO DAS MONTANHAS",hint:"Enigma entre grandes elevações"}]
] as const;
export type RuneGame=Readonly<{
 difficulty:RuneDifficulty;seed:number;phrase:string;hint:string;cipher:string;
 symbols:readonly string[];solution:Readonly<Record<string,string>>;
 assignments:Readonly<Record<string,string>>;revealed:readonly string[];
 attempts:number;hintsUsed:number;matched:number;status:"playing"|"won";score:number;
}>;
const nextSeed=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export function decodeCipher(cipher:string,assignments:Readonly<Record<string,string>>):string {
 return [...cipher].map(ch=>ch===" "?" ":assignments[ch]||"·").join("");
}
export function newRuneGame(difficulty:RuneDifficulty=0,seed=43):RuneGame {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 const challenge=challenges[difficulty][seed%challenges[difficulty].length];
 let rng=nextSeed(seed),permutation=[...runes];
 for(let i=permutation.length-1;i>0;i--){rng=nextSeed(rng);const j=rng%(i+1);
  [permutation[i],permutation[j]]=[permutation[j],permutation[i]];}
 const solution:Record<string,string>={},symbols:string[]=[];
 const cipher=[...challenge.phrase].map(letter=>{
  if(letter===" ")return " ";
  const symbol=permutation[alphabet.indexOf(letter)];
  if(!symbols.includes(symbol))symbols.push(symbol);
  solution[symbol]=letter;
  return symbol;
 }).join("");
 return {difficulty,seed,phrase:challenge.phrase,hint:challenge.hint,cipher,symbols,solution,
  assignments:{},revealed:[],attempts:0,hintsUsed:0,matched:0,status:"playing",score:0};
}
export function assignRune(g:RuneGame,symbol:string,letter:string):RuneGame {
 if(g.status!=="playing"||!g.symbols.includes(symbol)||g.revealed.includes(symbol))return g;
 const next=letter.toUpperCase();
 if(next!==""&&(!/^[A-Z]$/.test(next)))return g;
 const assignments={...g.assignments};
 for(const [key,value] of Object.entries(assignments))if(key!==symbol&&value===next&&next!==""&&!g.revealed.includes(key))delete assignments[key];
 if(next!==""&&g.revealed.some(key=>g.assignments[key]===next))return g;
 if(next)assignments[symbol]=next;else delete assignments[symbol];
 return {...g,assignments,matched:0};
}
export function checkRunes(g:RuneGame):RuneGame {
 if(g.status!=="playing")return g;
 const matched=g.symbols.filter(s=>g.assignments[s]===g.solution[s]).length;
 const attempts=g.attempts+1,won=matched===g.symbols.length;
 return {...g,matched,attempts,status:won?"won":"playing",
  score:won?Math.max(100,1200+g.difficulty*150-attempts*65-g.hintsUsed*180):0};
}
export function revealRune(g:RuneGame):RuneGame {
 if(g.status!=="playing"||g.hintsUsed>=2)return g;
 const next=g.symbols.find(s=>!g.revealed.includes(s)&&g.assignments[s]!==g.solution[s]);
 if(!next)return g;
 const answer=g.solution[next],assignments={...g.assignments};
 for(const [s,letter] of Object.entries(assignments))if(s!==next&&letter===answer)delete assignments[s];
 assignments[next]=answer;
 return {...g,assignments,revealed:[...g.revealed,next],hintsUsed:g.hintsUsed+1,matched:0};
}
export const restartRunes=(g:RuneGame)=>newRuneGame(g.difficulty,g.seed);
export const nextRunes=(g:RuneGame)=>newRuneGame(g.difficulty,nextSeed(g.seed));
