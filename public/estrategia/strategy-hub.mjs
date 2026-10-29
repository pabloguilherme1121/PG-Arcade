import {EXISTING_STRATEGY} from './catalog.mjs';

// Game engines remain in PG Arcade. The same-origin player is mounted only after
// a user selects a title, so saved favorites, records and GameId URLs remain intact.
export const STRATEGY_GROUPS=Object.freeze({
 tabuleiro:Object.freeze(['climas','liga4','xadrez','domino','damas','velha','knight','queens','gomoku','hex','ataxx','isolation','breakthrough','mancala','chomp','territory','nim','reversi','batalha','pontes','dados']),
 gestao:Object.freeze(['fortalezas','cidade','irrigacao','colheita','mercadores','resgate','farois','alquimia','contrato','mochila','tendas']),
 logica:Object.freeze(['reles','trilhos','arquipelago','puzzle','2048','peg','slideblock','sokoban','constelacao','trilha-soma','sapos']),
 acao:Object.freeze(['trem','passagem','cofre','neon']),
});
const idToGroup=new Map(Object.entries(STRATEGY_GROUPS).flatMap(([group,ids])=>ids.map(id=>[id,group])));
const legacyNames=new Map(EXISTING_STRATEGY);
const simplify=text=>String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const strategyGroupFor=id=>legacyNames.has(id)?idToGroup.get(id)??null:null;
export function filterStrategyLibrary(term='',group='all'){
 if(group!=='all'&&!Object.hasOwn(STRATEGY_GROUPS,group))return [];
 const search=simplify(term);
 return EXISTING_STRATEGY
   .filter(([id,name])=>(group==='all'||strategyGroupFor(id)===group)&&simplify(id+' '+name).includes(search))
   .map(([id,name])=>({id,name,group:strategyGroupFor(id)}));
}
export const arcadeGameUrl=id=>legacyNames.has(id)?'../#/jogar/'+encodeURIComponent(id):null;
export const strategyLaunchUrl=id=>legacyNames.has(id)?'?arcade='+encodeURIComponent(id)+'#classicos':null;

export function initStrategyHub(){
 const root=document.getElementById('classics-list');
 const search=document.getElementById('classic-search');
 const select=document.getElementById('classic-filter');
 const count=document.getElementById('classic-count');
 const empty=document.getElementById('classic-empty');
 const dialog=document.getElementById('classic-player');
 const iframe=document.getElementById('classic-game-frame');
 const fullscreen=document.getElementById('classic-open-new');
 const heading=document.getElementById('classic-player-title');
 let launcher=null;
 const cards=EXISTING_STRATEGY.map(([id,name])=>{
   const link=document.createElement('a');
   link.className='classic-item';
   link.dataset.arcadeGame=id;
   link.href=strategyLaunchUrl(id);
   const icon=document.createElement('span');icon.textContent='◇';icon.setAttribute('aria-hidden','true');
   const title=document.createElement('span');title.textContent=name;
   link.append(icon,title);
   return link;
 });
 root.replaceChildren(...cards);
 function render(){
   const visible=new Set(filterStrategyLibrary(search.value,select.value).map(g=>g.id));
   for(const item of cards)item.hidden=!visible.has(item.dataset.arcadeGame);
   count.textContent=visible.size+' '+(visible.size===1?'jogo encontrado':'jogos encontrados');
   empty.hidden=visible.size!==0;
 }
 function open(id,trigger=null){
   const src=arcadeGameUrl(id);
   if(!src)return false;
   launcher=trigger;
   heading.textContent='Jogando: '+legacyNames.get(id);
   fullscreen.href=src;
   iframe.title='PG Arcade: '+legacyNames.get(id);
   dialog.showModal();
   // Delay heavy React / game engine loading until the dialog is actually open.
   iframe.src=src;
   document.getElementById('classic-player-close').focus({preventScroll:true});
   return true;
 }
 function close(){if(dialog.open)dialog.close();}
 root.addEventListener('click',event=>{
   const link=event.target.closest('a[data-arcade-game]');
   if(!link)return;
   event.preventDefault();
   open(link.dataset.arcadeGame,link);
 });
 search.addEventListener('input',render);
 select.addEventListener('change',render);
 document.getElementById('classic-clear').addEventListener('click',()=>{
   search.value='';select.value='all';render();search.focus();
 });
 document.getElementById('classic-player-close').addEventListener('click',close);
 dialog.addEventListener('close',()=>{
   iframe.removeAttribute('src'); // Stops audio, timers and game loops on exit.
   const target=launcher?.isConnected?launcher:search;
   launcher=null;target.focus({preventScroll:true});
 });
 dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
 render();
 const requested=new URLSearchParams(location.search).get('arcade');
 if(requested&&legacyNames.has(requested))open(requested);
}
