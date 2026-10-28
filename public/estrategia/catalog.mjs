export const FAMILIES = Object.freeze([
  { id: 'territorio', title: 'Conquista territorial', tag: 'Tática', tone: 'violet', summary: 'Expanda sua frente antes que a facção rival tome o território.', icon: '◇', guide: 'Toque em uma casa livre vizinha ao seu território. O adversário também expande. Domine a meta antes do limite de turnos.' },
  { id: 'rotas', title: 'Rota crítica', tag: 'Planejamento', tone: 'cyan', summary: 'Abra um corredor entre a base e o objetivo, contornando barreiras.', icon: '⌁', guide: 'Expanda a rota por casas vizinhas. Bloqueios não podem ser atravessados. Use Desfazer para recuar sem gastar turnos.' },
  { id: 'economia', title: 'Comércio & recursos', tag: 'Economia', tone: 'amber', summary: 'Combine produção, comércio e investimentos para atingir a meta.', icon: '▣', guide: 'Cada operação consome um turno e recursos. Gere créditos, alimento, minério e influência para cumprir a meta.' },
  { id: 'defesa', title: 'Defesa de fronteira', tag: 'Defesa', tone: 'coral', summary: 'Escolha posições, fortaleça torres e sobreviva às ondas.', icon: '⬡', guide: 'Toque nas três pistas para construir ou aprimorar torres. Avance uma onda quando estiver pronto. Preserve a base.' },
  { id: 'logistica', title: 'Expedição tática', tag: 'Logística', tone: 'green', summary: 'Colete cargas, gerencie combustível e alcance o destino.', icon: '✦', guide: 'Mova o veículo para casas vizinhas. Colete os pacotes, visite os pontos de reabastecimento e chegue à saída.' },
  { id: 'cidade', title: 'Plano da cidade', tag: 'Gestão', tone: 'blue', summary: 'Equilibre energia, água e confiança pública antes do prazo.', icon: '▤', guide: 'Escolha projetos para equilibrar os três indicadores. Cada projeto ocupa um turno e tem ganhos e custos próprios.' },
]);
const ZONES = ['Aurora', 'Serra', 'Horizonte', 'Estuário', 'Fronteira', 'Mirante', 'Delta', 'Estação', 'Vale', 'Cidadela', 'Orvalho', 'Cânion', 'Órbita', 'Floresta', 'Bastilha', 'Planalto', 'Farol', 'Minério', 'Eclipse', 'Nascente', 'Arquipélago', 'Vórtice', 'Refúgio', 'Ponte', 'Sentinela'];
export const MISSIONS = Object.freeze(FAMILIES.flatMap((family, familyIndex) => ZONES.map((zone, i) => Object.freeze({
  id: `est-${String(familyIndex * 25 + i + 1).padStart(3,'0')}`,
  family: family.id,
  name: `${family.title}: ${zone}`,
  zone,
  level: i + 1,
  difficulty: i < 7 ? 'Iniciante' : i < 17 ? 'Intermediário' : 'Avançado',
  seed: ((familyIndex + 3) * 827 + i * 419 + (i*i*17)) >>> 0,
  turns: 12 + (i % 5),
}))));
export const getMission = id => MISSIONS.find(m => m.id === id) ?? null;
export const getFamily = id => FAMILIES.find(f => f.id === id);
export const EXISTING_STRATEGY = Object.freeze([
  ['xadrez','Xadrez'],['damas','Damas'],['reversi','Reversi'],['liga4','Liga 4'],['hex','Hex Conexões'],['ataxx','Colônia Ataxx'],['mancala','Mancala'],['gomoku','Cinco em Linha'],['batalha','Batalha Naval'],['sokoban','Sokoban'],['nim','Nim'],['territory','Fronteiras'],['breakthrough','Linha de Avanço'],['fortalezas','Fortalezas de Turnos'],['mercadores','Mercadores de Rotas'],['cidade','Cidade em Miniatura'],['irrigacao','Zonas de Irrigação'],['resgate','Barcos de Resgate'],['farois','Defesa de Faróis'],['trilhos','Trilhos Cruzados'],['arquipelago','Pontes do Arquipélago'],['reles','Rede de Relés'],['climas','Cartas de Climas'],['colheita','Colheita das Estações']
]);
