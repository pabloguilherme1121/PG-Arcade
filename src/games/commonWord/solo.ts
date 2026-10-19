const clues:Record<string,string> = {
 Mar:'Água salgada até o horizonte.',Sol:'A estrela que aquece nosso planeta.',Areia:'Grãos que ficam nos pés depois de caminhar na praia.',Férias:'Uma pausa prolongada na rotina de trabalho ou estudo.',
 Lua:'Satélite natural da Terra.',Estrelas:'Pontos luminosos distantes no céu noturno.',Sono:'A vontade de fechar os olhos e descansar.',Silêncio:'Quando os ruídos dão lugar à quietude.',
 Aventura:'Uma experiência nova, com descobertas e riscos.',Mala:'Guarda roupas e objetos para uma viagem.',Estrada:'Liga lugares por onde passam veículos.',Descoberta:'Encontrar algo que ainda não conhecíamos.',
 'Guarda-chuva':'Abre sobre a cabeça para proteger da água.',Janela:'Uma abertura que deixa entrar luz e permite olhar para fora.',Frio:'A sensação que nos faz procurar um agasalho.',Poça:'Água acumulada numa pequena depressão do chão.',
 Música:'Sons organizados que podemos ouvir e cantar.',Dança:'Movimentos do corpo acompanhando um ritmo.',Bolo:'Doce de forno que costuma receber velas.',Amigos:'Pessoas com quem escolhemos dividir bons momentos.',
 Conforto:'A sensação de estar à vontade e bem acomodado.',Família:'Pessoas ligadas por parentesco ou laços de cuidado.',Descanso:'Um intervalo para recuperar as energias.',Comida:'Aquilo que preparamos para nos alimentar.',
 Caderno:'Folhas reunidas para escrever e fazer anotações.',Amizade:'Um vínculo de carinho e confiança entre pessoas.',Recreio:'Intervalo entre as aulas para brincar e conversar.',Aprender:'Adquirir um conhecimento ou uma habilidade.',
 Calor:'A sensação que aumenta quando a temperatura sobe.',Piscina:'Reservatório preparado para nadar e se refrescar.',Sorvete:'Sobremesa gelada servida em bola, casquinha ou pote.',
 Cobertor:'Cobre o corpo para mantê-lo aquecido.',Chocolate:'Doce preparado com cacau.',Casaco:'Peça de roupa que vestimos por cima para aquecer.',
 Pipoca:'Grãos de milho que estouram ao aquecer.',História:'Uma sequência de acontecimentos que pode ser contada.',Tela:'Superfície onde aparecem imagens de um filme.',Emoção:'Sentimento provocado por uma experiência.',
 Árvore:'Planta com tronco e copa de folhas.',Sombra:'Área protegida da luz por um obstáculo.',Trilha:'Caminho estreito usado numa caminhada pela natureza.',Animal:'Ser vivo que pode andar, nadar ou voar e precisa se alimentar.',
 Tempero:'Ingrediente usado para realçar o sabor.',Receita:'Instruções com ingredientes e etapas de preparo.',Panela:'Recipiente usado no fogão para cozinhar.',Cheiro:'O que percebemos pelo olfato.',
 Rua:'Via urbana por onde circulam pessoas e veículos.',Prédio:'Construção que pode ter vários andares.',Trânsito:'Circulação de veículos e pessoas nas vias.',Encontro:'Quando pessoas chegam ao mesmo lugar para se ver.',
 Planeta:'Corpo celeste que percorre uma órbita ao redor de uma estrela.',Foguete:'Veículo lançado para levar cargas além da atmosfera.',Estrela:'Corpo celeste que produz sua própria luz.',Mistério:'Algo ainda sem explicação.',
 Flor:'Parte de muitas plantas que pode ter pétalas coloridas.',Cor:'Qualidade visual que distingue o azul do vermelho.',Terra:'Solo onde raízes podem crescer.',Borboleta:'Inseto de asas coloridas que antes foi lagarta.',
 Café:'Bebida preparada com grãos torrados e moídos.',Luz:'Permite enxergar os objetos ao nosso redor.',Despertador:'Toca no horário marcado para acordar alguém.',Começo:'O ponto inicial de uma atividade.',
 Ritmo:'Organização regular de batidas e pausas.',Voz:'Som produzido por uma pessoa ao falar ou cantar.',Lembrança:'Algo do passado que guardamos na memória.',
 Equipe:'Grupo que trabalha junto por um objetivo.',Energia:'Disposição para agir e realizar atividades.',Treino:'Prática repetida para melhorar uma habilidade.',Vitória:'Resultado de quem vence uma disputa.',
 Página:'Um dos lados de uma folha de livro.',Imaginação:'Capacidade de criar imagens e situações na mente.',Biblioteca:'Lugar que organiza livros para consulta e leitura.',
 Conversa:'Troca de ideias entre pessoas.',Confiança:'Crença de que podemos contar com alguém.',Diversão:'Atividade que proporciona entretenimento.',Ajuda:'Apoio oferecido para facilitar uma tarefa.',
};
/** Mix all seed bits before sampling; low LCG bits produce four-round cycles. */
export function soloChallenge(seed:number,round:number,options:readonly string[]) {
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff||!Number.isInteger(round)||round<0||!options.length||options.some(o=>!Object.hasOwn(clues,o))) throw new Error('Desafio de pistas inválido.');
 let x=(seed^Math.imul(round+1,0x9e3779b9))>>>0;
 x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);x=(x^(x>>>15))>>>0;
 const target=x%options.length;
 return {target,hint:clues[options[target]]};
}
