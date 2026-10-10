/** A deterministic visual identity for each arcade title, with no image downloads. */
type GameCoverSource = { id: string; name: string; category: string };
const palette: Record<string, readonly [string,string,string]> = {
  "Estratégia": ["#101C38","#D4B5FF","#7ACCD4"],
  "Inteligência": ["#12243C","#D6FB7B","#7EC8FA"],
  "Casuais": ["#25203D","#FFC688","#F68BCB"],
  "Reflexos": ["#192440","#82D9FF","#D6FE89"],
  "Corrida": ["#152B40","#FFC77B","#80DFF8"],
  "Carros": ["#20243A","#FFBC89","#B9D4F6"],
  "Tiro": ["#1A183B","#E2A1FF","#7EE7D6"],
  "Esportes": ["#12372E","#CBFFAC","#A4E7FE"],
  "Memória": ["#2D203B","#E6A9FF","#B8F6D4"],
};
function hashTitle(value: string): number {
  let h=2166136261;
  for (let i=0; i<value.length; i++) h=Math.imul(h ^ value.charCodeAt(i),16777619);
  return h >>> 0;
}
export function coverArtFor(game: GameCoverSource) {
  const seed=hashTitle(game.id);
  const [background,accent,secondary]=palette[game.category] ?? ["#17243B","#D6F7A0","#8DC5E9"];
  const words=game.name.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").split(/\s+/).filter(Boolean);
  const code=(words.length>1 ? words.slice(0,3).map(w=>w[0]).join("") : words[0].slice(0,3)).toUpperCase();
  return {
    id:game.id, background, accent, secondary, seed,
    fingerprint:`${game.id}-${seed.toString(36)}`,
    code,
    ornament:seed % 5,
    offset:seed % 41,
    rotation:((seed >>> 5) % 60)-30,
    chapter: String((seed % 999)+1).padStart(3,"0"),
  };
}
