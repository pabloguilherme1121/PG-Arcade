// Conteúdo local e explícito. Sem rede, API ou dados pessoais.
export const BOT_TOPICS = Object.freeze(['objetivo', 'controles', 'situacao']);
const TIPS = Object.freeze({
  'frota-oculta': {
    objetivo:'Encontre todas as embarcações inimigas antes que sua base perca integridade. O sonar informa a quantidade de alvos em uma linha.',
    controles:'Toque ou pressione Enter em um quadrante ainda oculto para disparar. Use os botões de sonar e reparo no painel lateral, quando disponíveis.'
  },
  'cartas-de-cerco': {
    objetivo:'Reduza a vida da fortaleza inimiga a zero antes que sua própria fortaleza caia. Combine cartas ofensivas, defesa e energia.',
    controles:'Escolha uma carta que caiba no seu limite de energia. Jogue as cartas na ordem desejada e finalize o turno para receber a resposta rival.'
  },
  'hex-conexao': {
    objetivo:'Conecte suas pedras de norte a sul por casas vizinhas hexagonais. O adversário tenta unir as bordas oeste e leste.',
    controles:'Toque ou pressione Enter sobre uma casa livre. Uma pedra colocada não pode ser movida. Role somente o tabuleiro horizontalmente no celular.'
  },
  'damas-taticas': {
    objetivo:'Capture as peças rivais ou deixe o adversário sem jogadas. Capturas são obrigatórias, saltos podem encadear e peças alcançam promoção.',
    controles:'Selecione uma peça clara e depois uma casa marcada como destino. Use Tab e Enter pelo teclado. O painel permite pausar e retomar.'
  },
  'patrulha-tatica': {
    objetivo:'No combate, neutralize os drones inimigos preservando seu esquadrão. Na extração, recolha o sinal central e retorne à base.',
    controles:'Toque nas casas vizinhas para andar ou nos drones ao alcance para atacar. Use Defender posição e Aplicar kit médico quando necessário.'
  },
  'muralha-das-torres': {
    objetivo:'Proteja a base de ondas inimigas. Na operação Maratona, vença duas ondas adicionais. Planeje o alcance das torres e seus créditos.',
    controles:'Escolha Canhão ou Gelo e toque numa casa livre fora da rota para construir. Toque numa torre para melhorar; use Iniciar onda e Avançar combate.'
  },
  'fronteira-orbital': {
    objetivo:'Na Expansão, conecte cinco colônias. Na Pesquisa, alcance 12 pontos de ciência. Evite que a facção rival domine o mapa.',
    controles:'Escolha a ordem Explorar ou Colonizar e toque em um setor válido. Use Extrair para recursos e Pesquisar quando possuir colônias suficientes.'
  },
  'refugio-do-inverno': {
    objetivo:'No modo Resistência, mantenha a comunidade viva até o último dia. Em Evacuação, construa três sinais e resista pelo menos cinco dias.',
    controles:'Cada ordem avança um dia. Coletar alimentos, cortar lenha, aquecer, descansar e construir sinais gastam recursos; observe o clima.'
  }
});
const MODES=Object.freeze({recruta:'Recruta',tatico:'Tático',veterano:'Veterano'});
export function botMessage(gameId,state={},topic='objetivo') {
  if(!Object.hasOwn(TIPS,gameId)) return 'Escolha um jogo para consultar o PG Bot.';
  if(!BOT_TOPICS.includes(topic)) return 'Selecione um assunto para receber orientação.';
  const game=TIPS[gameId];
  if(topic==='objetivo') {
    if(gameId==='patrulha-tatica' && state.mission==='extracao') return 'Na extração, recolha o sinal central e volte à base com seu esquadrão. Defender e curar também consomem turnos.';
    if(gameId==='fronteira-orbital' && state.mission==='pesquisa') return 'No objetivo Pesquisa, consiga 12 pontos de ciência enquanto protege suas colônias da facção rival.';
    if(gameId==='muralha-das-torres' && state.mission==='maratona') return 'Na operação Maratona, resista a duas ondas extras. Economize créditos para aprimorar torres antes dos ataques mais fortes.';
    return game.objetivo;
  }
  if(topic==='controles') return game.controles;
  if(state.phase==='won') return 'Você venceu esta partida! Seu resultado é registrado neste navegador. Pode reiniciar e experimentar outra dificuldade.';
  if(state.phase==='lost') return 'A partida terminou em derrota. Reinicie, revise o objetivo e tente uma ordem diferente de ações.';
  if(state.paused) return 'A partida está pausada. Retome no painel de comandos para continuar sem perder esta sessão.';
  const mode=Object.hasOwn(MODES,state.mode)?MODES[state.mode]:'não informado';
  return 'Partida em andamento. Dificuldade: '+mode+'. Observe os indicadores e ações disponíveis. Este PG Bot apresenta dicas prontas, não é uma IA conectada.';
}