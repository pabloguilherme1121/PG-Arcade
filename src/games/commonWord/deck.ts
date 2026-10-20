const prompts = [
 ['Praia','Mar','Sol','Areia','Férias'],
 ['Noite','Lua','Estrelas','Sono','Silêncio'],
 ['Viagem','Aventura','Mala','Estrada','Descoberta'],
 ['Chuva','Guarda-chuva','Janela','Frio','Poça'],
 ['Festa','Música','Dança','Bolo','Amigos'],
 ['Casa','Conforto','Família','Descanso','Comida'],
 ['Escola','Caderno','Amizade','Recreio','Aprender'],
 ['Verão','Calor','Piscina','Sorvete','Sol'],
 ['Inverno','Cobertor','Chocolate','Frio','Casaco'],
 ['Cinema','Pipoca','História','Tela','Emoção'],
 ['Floresta','Árvore','Sombra','Trilha','Animal'],
 ['Cozinha','Tempero','Receita','Panela','Cheiro'],
 ['Cidade','Rua','Prédio','Trânsito','Encontro'],
 ['Espaço','Planeta','Foguete','Estrela','Mistério'],
 ['Jardim','Flor','Cor','Terra','Borboleta'],
 ['Manhã','Café','Luz','Despertador','Começo'],
 ['Música','Ritmo','Voz','Dança','Lembrança'],
 ['Esporte','Equipe','Energia','Treino','Vitória'],
 ['Livro','Página','Imaginação','História','Biblioteca'],
 ['Amizade','Conversa','Confiança','Diversão','Ajuda'],
] as const;

/** A shared deck, not a hidden-answer puzzle. Seed is chosen by the host. */
export function createDeck(seed:number,count=10): {prompt:string;options:string[]}[] {
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff||!Number.isInteger(count)||count<1||count>prompts.length) throw new Error('Semente ou tamanho inválido.');
 const order=prompts.map((_,i)=>i);
 let rng=seed;
 for(let i=order.length-1;i>0;i--){rng=(Math.imul(rng,1664525)+1013904223)>>>0;const j=rng%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 return order.slice(0,count).map(i=>({prompt:prompts[i][0],options:prompts[i].slice(1)}));
}
