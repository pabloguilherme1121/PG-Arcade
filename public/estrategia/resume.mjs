import { getMission } from './catalog.mjs';
import { initMission, play } from './core.mjs';
export const SESSION_KEY='pg-estrategia-session-v1';
const MAX_BYTES=4096,MAX_ACTIONS=40;
export function acceptedMove(before,after){return Boolean(before&&after&&(after.turn>before.turn||after.history?.length>before.history?.length));}
export function encodeSession(id,actions){return JSON.stringify({v:1,id,actions});}
function normalizeAction(family,action){
 if(!action||typeof action!=='object'||Array.isArray(action))return null;
 const keys=Object.keys(action);
 if(['territorio','rotas','logistica'].includes(family))return keys.length===1&&keys[0]==='cell'&&Number.isInteger(action.cell)&&action.cell>=0&&action.cell<25?{cell:action.cell}:null;
 if(family==='defesa'){
  if(keys.length===1&&keys[0]==='type'&&action.type==='wave')return {type:'wave'};
  if(keys.length===2&&keys.includes('type')&&keys.includes('lane')&&action.type==='build'&&Number.isInteger(action.lane)&&action.lane>=0&&action.lane<=2)return {type:'build',lane:action.lane};
  return null;
 }
 if(keys.length!==1||keys[0]!=='type')return null;
 if(family==='economia'&&['cultivar','minerar','comerciar','investir'].includes(action.type))return {type:action.type};
 if(family==='cidade'&&['solar','reservatorio','comunidade','equilibrio'].includes(action.type))return {type:action.type};
 return null;
}
export function decodeSession(raw){
 if(typeof raw!=='string'||raw.length>MAX_BYTES)return null;
 try{
  const data=JSON.parse(raw);
  if(data?.v!==1||typeof data.id!=='string'||!getMission(data.id)||!Array.isArray(data.actions)||data.actions.length>MAX_ACTIONS)return null;
  let state=initMission(data.id);const actions=[];
  for(const candidate of data.actions){const action=normalizeAction(state.family,candidate);if(!action)return null;const next=play(state,action);if(!acceptedMove(state,next))return null;state=next;actions.push(action);}
  return state.status==='playing'?{id:state.id,actions,state}:null;
 }catch{return null;}
}
