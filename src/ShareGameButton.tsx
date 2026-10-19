import { Link as LinkIcon } from 'lucide-react';
import type { GameId } from './lib/catalog';
import { shareGame } from './lib/shareGame';

export default function ShareGameButton({id,name,onMessage}:{id:GameId;name:string;onMessage:(message:string)=>void}) {
  async function share() {
    const url=new URL(location.pathname,location.origin);
    url.hash=`/jogar/${id}`;
    const result=await shareGame(name,url.href);
    if(result==='cancelled') return;
    onMessage(result==='shared'?'Compartilhamento concluído.':result==='copied'
      ?'Link do jogo copiado.':'Copie o endereço da barra do navegador para compartilhar este jogo.');
  }
  return <button onClick={share} aria-label="Compartilhar jogo"><LinkIcon size={19}/><span className="hide-small">Compartilhar</span></button>;
}
