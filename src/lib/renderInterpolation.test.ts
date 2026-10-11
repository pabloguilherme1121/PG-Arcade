import {it,expect} from 'vitest';
import {renderBetween} from './renderInterpolation';
it('smooths presentation without mutating physics or interpolating a respawn',()=>{
  const old={x:10,y:20,angle:Math.PI-.1,score:2};
  const next={x:20,y:30,angle:-Math.PI+.1,score:3};
  const visual=renderBetween(old,next,.5);
  expect(visual.x).toBe(15);expect(visual.y).toBe(25);
  expect(visual.angle).toBeCloseTo(Math.PI);expect(visual.score).toBe(3);
  expect(next.x).toBe(20);expect(old.x).toBe(10);
  expect(renderBetween(old,{...next,x:200},.5).x).toBe(200);
  expect(renderBetween(old,next,NaN)).toBe(next);
});
