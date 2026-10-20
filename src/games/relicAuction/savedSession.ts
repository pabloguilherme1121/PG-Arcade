import {botBid,createAuction,nextLot,submitBid,type Auction,type Level} from './rules';
export const SAVE_KEY='pg-arcade-relic-auction-v1';
export type Settings={mode:'solo'|'local';players:number;level:Level};
type Snapshot=Settings&{schema:1;savedAt:number;seed:number;commands:(number|null)[][]};
export function restoreAuction(raw:string,now=Date.now()):{match:Auction;settings:Settings}|null {
 try {
  if(raw.length>16000)return null;
  const d=JSON.parse(raw) as Snapshot;
  if(!d||d.schema!==1||!Number.isSafeInteger(d.savedAt)||d.savedAt>now+60000||now-d.savedAt>7*86400000||
   !['solo','local'].includes(d.mode)||!['easy','normal','hard'].includes(d.level)||![2,3,4].includes(d.players)||
   (d.mode==='solo'&&d.players!==2)||!Array.isArray(d.commands)||!d.commands.length||d.commands.length>9)return null;
  let match=createAuction(d.seed,d.players);
  for(let r=0;r<d.commands.length;r++){
   const row=d.commands[r];
   if(!Array.isArray(row)||row.length!==d.players)return null;
   const complete=row.every(bid=>bid!==null);
   if(r<d.commands.length-1&&!complete)return null;
   if(d.mode==='solo'&&!complete&&row.some(bid=>bid!==null))return null;
   const bot=d.mode==='solo'?botBid(match,d.level):null;
   for(let p=0;p<row.length;p++)if(row[p]!==null){
    if(d.mode==='solo'&&p===1&&row[p]!==bot)return null;
    const updated=submitBid(match,p,r,row[p]!);if(updated===match)return null;match=updated;
   }
   if(r<d.commands.length-1)match=nextLot(match);
  }
  return {match,settings:{mode:d.mode,players:d.players,level:d.level}};
 }catch{return null;}
}
export function readAuction(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?restoreAuction(raw):null;}catch{return null;}}
export function saveAuction(match:Auction,settings:Settings):boolean {
 try {
  if(match.phase==='finished'){localStorage.removeItem(SAVE_KEY);return true;}
  const commands=match.history.map(result=>[...result.bids] as (number|null)[]);
  if(match.phase==='bidding')commands.push([...match.bids]);
  const snapshot:Snapshot={...settings,players:match.coins.length,schema:1,savedAt:Date.now(),seed:match.seed,commands};
  localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot));return true;
 }catch{return false;}
}
export function discardAuction(){try{localStorage.removeItem(SAVE_KEY);}catch{/* Playing remains available. */}}
