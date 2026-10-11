import {expect,it,vi} from 'vitest';
import {createCanvasFeedback} from './canvasFeedback';

it('shows actual earned points once, expires in simulation time, and restores drawing state',()=>{
  const c={save:vi.fn(),restore:vi.fn(),strokeRect:vi.fn(),fillRect:vi.fn(),fillText:vi.fn()} as unknown as CanvasRenderingContext2D;
  const initial={score:40,lives:3,time:2};
  const draw=createCanvasFeedback(initial);
  const earned={score:65,lives:3,time:2.1};
  draw(c,earned,380,false);
  expect(c.fillText).toHaveBeenLastCalledWith('+25',455,33);
  draw(c,{...earned,time:3},380,false);
  expect(c.fillText).toHaveBeenCalledTimes(1);
  expect(c.save).toHaveBeenCalledTimes(2);expect(c.restore).toHaveBeenCalledTimes(2);
  expect(initial.score).toBe(40);
});

it('never paints motion effects under reduced motion or leaks a previous round',()=>{
  const c={save:vi.fn(),restore:vi.fn(),strokeRect:vi.fn(),fillRect:vi.fn(),fillText:vi.fn()} as unknown as CanvasRenderingContext2D;
  const draw=createCanvasFeedback({score:0,lives:3,time:0});
  draw(c,{score:20,lives:2,time:1},360,true);
  expect(c.save).not.toHaveBeenCalled();
  draw(c,{score:0,lives:3,time:0},360,false);
  expect(c.fillText).not.toHaveBeenCalled();expect(c.strokeRect).not.toHaveBeenCalled();
});
