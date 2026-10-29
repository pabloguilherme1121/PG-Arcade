import { createCouncil, commandCouncil, councilVotes, availableCouncilActions, COUNCIL_FACTIONS } from './game.mjs';
const $ = id => document.getElementById(id);
const STORAGE = 'pg-estrategia-conselho-recordes-v1';
let current;
let scores = {};
try {
  const data=JSON.parse(localStorage.getItem(STORAGE)||'{}');
  if(data && typeof data==='object' && !Array.isArray(data))
    scores=Object.fromEntries(Object.entries(data).filter(([key,value]) =>
      /^(reformas|estabilidade):(recruta|tatico|veterano)$/.test(key)
      && Number.isSafeInteger(value) && value>=0 && value<=100));
} catch { /* Storage is optional. */ }

function element(tag,className='',text='') {
  const node=document.createElement(tag);node.className=className;node.textContent=text;return node;
}
function createButton(label,type,faction=null,disabled=false) {
  const button=element('button','action-button',label);
  button.type='button';button.dataset.action=type;
  if(faction!==null)button.dataset.faction=String(faction);
  button.disabled=disabled;
  return button;
}
function report() {
  const key=current.mode+':'+current.difficulty;
  const record=scores[key];
  $('record').textContent=record===undefined?'Sem recorde registrado.':('Melhor pontuação local: '+record);
}
function saveIfWon() {
  if(current.phase!=='won')return;
  const key=current.mode+':'+current.difficulty;
  const score=current.mode==='reformas'?current.limit-current.round+1:current.trust+councilVotes(current);
  if(scores[key]===undefined||score>scores[key]) {
    scores[key]=score;
    try {localStorage.setItem(STORAGE,JSON.stringify(scores));} catch { /* no account or remote sync */ }
  }
}
function draw() {
  const s=current,votes=councilVotes(s),allowed=availableCouncilActions(s);
  $('round').textContent='Rodada '+s.round+' / '+s.limit;
  $('stats').replaceChildren(...[
    ['Caixa',s.treasury],['Influência',s.influence],['Confiança',s.trust],['Reformas',s.laws+'/3']
  ].map(([title,value])=>{const box=element('div','stat');box.append(element('span','stat-label',title),element('strong','stat-value',String(value)));return box;}));
  $('objective').textContent=s.mode==='reformas'?'Aprove 3 reformas antes do prazo.':'Mantenha confiança ≥ 5 e pelo menos 5 cadeiras no fim do prazo.';
  $('votes').textContent='Apoio à sua coalizão: '+votes+' das 7 cadeiras. Maioria necessária: 5.';
  const factionNodes=COUNCIL_FACTIONS.map((faction,index)=>{
    const panel=element('article','faction');
    panel.dataset.faction=String(index);
    const heading=element('h3','',faction.name);
    const support=element('p','support','Apoio: '+s.support[index]+'/10 · '+faction.seats+' cadeiras');
    const bar=element('div','support-track');
    const fill=element('span','support-fill');
    fill.style.width=(s.support[index]*10)+'%';
    bar.append(fill);
    const vote=element('span','faction-vote',s.support[index]>=5?'Na coalizão':'Sem acordo');
    panel.append(heading,support,bar,vote);
    return panel;
  });
  $('factions').replaceChildren(...factionNodes);
  const controls=[];
  for(let i=0;i<COUNCIL_FACTIONS.length;i++){
    controls.push(createButton('Negociar com '+COUNCIL_FACTIONS[i].name+' · 1 crédito','negotiate',i,!allowed.includes('negotiate')));
  }
  controls.push(createButton('Fazer campanha · 2 créditos','campaign',null,!allowed.includes('campaign')));
  controls.push(createButton('Reforçar o caixa · +3 créditos','fund',null,!allowed.includes('fund')));
  controls.push(createButton('Aprovar reforma · maioria + 2 influência','propose',null,!allowed.includes('propose')));
  const outreachWrap=element('div','outreach-row');
  for(let i=0;i<COUNCIL_FACTIONS.length;i++) {
    outreachWrap.append(createButton('Ouvir '+COUNCIL_FACTIONS[i].name+' · 2 créditos','outreach',i,!allowed.includes('outreach')));
  }
  $('actions').replaceChildren(...controls,outreachWrap);
  $('status').textContent=s.notice;
  $('status').dataset.phase=s.phase;
  $('pause').textContent=s.paused?'Retomar':'Pausar';
  $('pause').setAttribute('aria-pressed',String(s.paused));
  $('pause').disabled=s.phase!=='playing';
  report();
}
function start() {
  const seed=Math.floor(Math.random()*0x7fffffff);
  current=createCouncil({mode:$('mode').value,difficulty:$('difficulty').value,seed});
  draw();
}
function advance(action,button=null) {
  const previous=current;
  current=commandCouncil(current,action);
  if(current===previous)return;
  saveIfWon();
  draw();
  if(button) {
    const selector='[data-action="'+button.dataset.action+'"]'+
      (button.hasAttribute('data-faction')?'[data-faction="'+button.dataset.faction+'"]':'');
    const candidate=$('actions').querySelector(selector);
    if(candidate && !candidate.disabled)candidate.focus({preventScroll:true});
  }
}
$('actions').addEventListener('click',event=>{
  const target=event.target.closest('button[data-action]');
  if(!target||target.disabled)return;
  advance({type:target.dataset.action,...(target.hasAttribute('data-faction')?{faction:Number(target.dataset.faction)}:{})},target);
});
$('restart').addEventListener('click',start);
$('mode').addEventListener('change',start);
$('difficulty').addEventListener('change',start);
$('pause').addEventListener('click',()=>advance({type:current.paused?'resume':'pause'}));
$('pg-bot').addEventListener('click',event=>{
 const button=event.target.closest('button[data-help]');
 if(!button)return;
 const support=councilVotes(current);
 const messages={
   objective:current.mode==='reformas'?'Para vencer, aprove três reformas. Consiga pelo menos cinco cadeiras, dois pontos de influência e um crédito antes de propor.':'Na última rodada, você precisa ter cinco pontos de confiança e maioria de cinco cadeiras. Negocie para manter a coalizão.',
   controls:'Selecione uma ordem e toque ou use Tab e Enter. Negociar aumenta apoio, Campanha dá influência, Reforçar o caixa recupera créditos. Pausa e reinício não gastam rodada.',
   situation:'Rodada '+current.round+'/'+current.limit+'. Você tem '+support+' de 7 cadeiras, '+current.influence+' de influência, '+current.trust+' de confiança, '+current.treasury+' créditos e '+current.laws+' reformas. '+(support>=5?'Você tem maioria.':'Negocie com facções fora da coalizão.'),
 };
 $('bot-answer').textContent=messages[button.dataset.help]||'Ajuda indisponível.';
});
start();
if('serviceWorker' in navigator && location.protocol==='https:')
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
