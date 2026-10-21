import {describe,expect,it} from "vitest";
import {candidateCount,confirmCoordinate,manhattan,newCoordinates,nextCoordinates,restartCoordinates,revealBeacon,selectCoordinate} from "./rules";
describe("Coordenadas Perdidas — distâncias de Manhattan e dedução",()=>{
 it("gera 360 mapas reproduzíveis e cada trio de pistas identifica uma única coordenada",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<120;seed++){
   const game=newCoordinates(difficulty,seed);
   expect(game).toEqual(newCoordinates(difficulty,seed));
   expect(game.size).toBe(5+2*difficulty);
   expect(game.target).not.toBe(0);
   expect(game.beacons).toHaveLength(3);
   expect(game.beacons.some(b=>b.position===game.target)).toBe(false);
   expect(candidateCount(game,3)).toBe(1);
   expect(candidateCount(game)).toBeGreaterThanOrEqual(1);
   for(const beacon of game.beacons)expect(beacon.distance).toBe(manhattan(game.size,beacon.position,game.target));
  }
 });
 it("usa a distância horizontal + vertical, rejeitando índices fora do mapa",()=>{
  expect(manhattan(5,0,24)).toBe(8);
  expect(manhattan(5,5,8)).toBe(3);
  expect(()=>manhattan(5,-1,0)).toThrow();
  expect(()=>manhattan(5,0,25)).toThrow();
 });
 it("limita pistas e palpites e nunca permite vitória com coordenada errada",()=>{
  let game=newCoordinates(2,35);
  expect(game.shown).toBe(1);
  expect(confirmCoordinate(game)).toBe(game);
  expect(selectCoordinate(game,-1)).toBe(game);
  game=revealBeacon(revealBeacon(game));
  expect(game.shown).toBe(3);
  expect(revealBeacon(game)).toBe(game);
  expect(candidateCount(game)).toBe(1);
  game=confirmCoordinate(selectCoordinate(game,0));
  expect(game.phase).toBe("playing");
  expect(game.lastDistance).toBeGreaterThan(0);
  game=confirmCoordinate(selectCoordinate(game,0));
  game=confirmCoordinate(selectCoordinate(game,0));
  expect(game.phase).toBe("lost");
  expect(revealBeacon(game)).toBe(game);
 });
 it("pode localizar o destino e registra pontuação sem mutar os estados anteriores",()=>{
  const base=newCoordinates(1,59);
  const wrong=confirmCoordinate(selectCoordinate(base,0));
  const win=confirmCoordinate(selectCoordinate(wrong,base.target));
  expect(wrong.phase).toBe("playing");
  expect(win.phase).toBe("won");
  expect(win.score).toBeGreaterThan(0);
  expect(confirmCoordinate(win)).toBe(win);
  expect(restartCoordinates(win)).toEqual(base);
  expect(nextCoordinates(win).seed).not.toBe(base.seed);
  expect(base.attempts).toBe(0);
 });
 it("rejeita dificuldade e seed inválidas",()=>{
  expect(()=>newCoordinates(3 as never)).toThrow();
  expect(()=>newCoordinates(0,-1)).toThrow();
 });
});