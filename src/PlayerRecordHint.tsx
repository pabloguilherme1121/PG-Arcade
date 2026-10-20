import type {GameId} from './lib/catalog';
import {recordUnits} from './lib/recordUnits';
export default function PlayerRecordHint({id,record}:{id:GameId;record:number|undefined}) {
 const text=id==='comum'?'Resultados apenas desta partida':['snake','2048','memoria','blocos','reflexo','minas','puzzle','palavra'].includes(id)?'Recorde por configuração no placar do jogo':record?`Recorde histórico geral: ${record} ${recordUnits[id]??'pontos'}`:'Primeira partida — faça sua marca';
 return <small data-player-record>{text}</small>;
}
