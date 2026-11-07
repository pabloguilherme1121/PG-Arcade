import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {games} from './catalog';
import {matchesGame} from './discovery';

const hasUnsafeSvgContent=(svg:string)=>/<script\b|https?:\/\//i.test(svg.replaceAll('xmlns="http://www.w3.org/2000/svg"',''));

describe('mechanic artwork and mode search',()=>{
  it('ships a valid local SVG for every playable title',()=>{
    for(const game of games){
      const svg=readFileSync(`public/covers/${game.id}.svg`,'utf8');
      expect(svg,game.id).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg,game.id).toContain('viewBox="0 0 240 150"');
      expect(hasUnsafeSvgContent(svg),game.id).toBe(false);
    }
  });
  it('rejeita dominios que imitam www.w3.org no SVG',()=>{
    const forged='<svg xmlns="http://www.w3.org/2000/svg"><image href="https://wwwXw3Xorg.evil/track.svg"/></svg>';
    expect(hasUnsafeSvgContent(forged)).toBe(true);
  });
  it('finds real modes with accents and combined keywords',()=>{
    const chess=games.find(g=>g.id==='xadrez')!;
    expect(matchesGame(chess,'xadrez dupla')).toBe(true);
    expect(matchesGame(chess,'contra o bot')).toBe(true);
    expect(matchesGame(chess,'sobrevivencia')).toBe(false);
    expect(matchesGame(games.find(g=>g.id==='runner')!,'sobrevivencia')).toBe(true);
  });
});
