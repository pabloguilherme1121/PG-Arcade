import {createDeck} from './deck';
import {choose,createMatch,nextRound,type Match} from './rules';
import {soloChallenge} from './solo';
export const SAVE_KEY='pg-arcade-common-word-session-v1';
export type Session={match:Match;seed:number;current:number;covered:boolean;answers:number[][]};
export type SavedSession={schema:1;savedAt:number;seed:number;mode:'solo'|'local';players:number;count:number;answers:number[][]};
/** Rebuild scores and private choices from bounded commands; never trust saved scores. */
export function restoreSession(raw:string,now=Date.now()):{session:Session;mode:'solo'|'local';players:number;count:number}|null {
 try {
  if(raw.length>16000)return null;
  const data:unknown=JSON.parse(raw);
  if(!data || typeof data!=='object')return null;
  const d=data as SavedSession;
  if(d.schema!==1 || !Number.isSafeInteger(d.savedAt) || d.savedAt>now+60000 || now-d.savedAt>7*86400000 ||
   !Number.isInteger(d.seed) || d.seed<0 || d.seed>0xffffffff || !['solo','local'].includes(d.mode) ||
   ![2,3,4].includes(d.players) || ![5,10,20].includes(d.count) || !Array.isArray(d.answers) || !d.answers.length || d.answers.length>d.count)return null;
  if(d.mode==='solo' && d.players!==2)return null;
  const ids=d.mode==='solo'?['Você','Bot de pistas']:Array.from({length:d.players},(_,i)=>`Jogador ${i+1}`);
  let match=createMatch(ids,createDeck(d.seed,d.count));
  for(let r=0;r<d.answers.length;r++) {
   const answers=d.answers[r];
   if(!Array.isArray(answers) || answers.length>ids.length || (r<d.answers.length-1 && answers.length!==ids.length) ||
    (d.mode==='solo' && answers.length!==0 && answers.length!==2))return null;
   for(let p=0;p<answers.length;p++) {
    if(d.mode==='solo' && p===1 && answers[p]!==soloChallenge(d.seed,r,match.rounds[r].options).target)return null;
    const updated=choose(match,ids[p],r,answers[p]);
    if(updated===match)return null;
    match=updated;
   }
   if(r<d.answers.length-1)match=nextRound(match);
  }
  const current=Math.min(d.answers.at(-1)!.length,ids.length-1);
  return {mode:d.mode,players:d.players,count:d.count,session:{match,seed:d.seed,current,covered:d.mode==='local'&&match.phase==='choosing',answers:d.answers.map(row=>[...row])}};
 }catch{return null;}
}
export function readSavedSession() {
 try {const raw=localStorage.getItem(SAVE_KEY);return raw?restoreSession(raw):null;}catch{return null;}
}
export function saveSession(session:Session,mode:string,players:number,count:number):boolean {
 try {
  if(session.match.phase==='finished'){localStorage.removeItem(SAVE_KEY);return true;}
  const data:SavedSession={schema:1,savedAt:Date.now(),seed:session.seed,mode:mode==='solo'?'solo':'local',players:mode==='solo'?2:players,count,answers:session.answers};
  localStorage.setItem(SAVE_KEY,JSON.stringify(data));return true;
 }catch{return false;}
}
export function discardSavedSession(){try{localStorage.removeItem(SAVE_KEY);}catch{/* Gameplay still works without storage. */}}
