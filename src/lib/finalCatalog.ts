const entries = [
  ["lanternas","Jardim de Lanternas","Ilumine a grade sem cruzar lanternas.","Inteligência"],
  ["hitori","Hitori","Risque repetições sem isolar casas.","Inteligência"],
  ["kakurasu","Kakurasu","Resolva somas com pesos de posição.","Inteligência"],
  ["tendas","Acampamento","Arme tendas sem encostar nas vizinhas.","Estratégia"],
  ["termometros","Termômetros","Preencha tubos a partir do bulbo.","Inteligência"],
  ["aquarios","Aquários","Encha regiões sem inclinar a água.","Inteligência"],
  ["constelacao","Constelação","Distribua estrelas sem contato.","Estratégia"],
  ["dominosa","Dominosa","Cubra números sem repetir dominós.","Inteligência"],
  ["retangulos","Retângulos de Giz","Divida a grade nas áreas indicadas.","Inteligência"],
  ["ilhas","Ilhas de Pedra","Cerque ilhas com um mar contínuo.","Inteligência"],
  ["visibilidade","Mirantes","Controle o alcance dos mirantes.","Inteligência"],
  ["mosaico","Mosaico de Pistas","Reconstrua a figura pelas pistas.","Inteligência"],
  ["trilha-soma","Trilha da Soma","Trace um caminho com a soma exata.","Estratégia"],
  ["baldes","Medida Exata","Meça quatro litros por transferências.","Inteligência"],
  ["mochila","Mochila de Expedição","Maximize o valor dentro do peso.","Estratégia"],
  ["panquecas","Torre de Panquecas","Ordene a pilha invertendo o topo.","Inteligência"],
  ["sapos","Travessia dos Sapos","Troque os grupos com saltos à frente.","Estratégia"],
  ["restos","Cofre dos Restos","Combine discos e restos de divisão.","Inteligência"],
] as const;
export const finalGames = entries.map(([id,name,description,category])=>({id,name,description,category}));
export type FinalId = typeof finalGames[number]['id'];
const ids = new Set<string>(finalGames.map(g => g.id));
export const isFinalId = (id: string): id is FinalId => ids.has(id);
