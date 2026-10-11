import {expect, it} from 'vitest';
import {newAction} from './actionCollection';
import {actionPresentation} from './actionPresentation';

it('smooths ball and both paddles without changing authoritative velocities or inputs', () => {
  const previous = newAction('pong', 'normal', 'mission');
  const current = {...previous, paddle: previous.paddle + 10, enemy: previous.enemy - 10, ball: {...previous.ball, x: previous.ball.x + 8, y: previous.ball.y + 4}};
  const sample = actionPresentation(previous, current, .5);
  expect(sample.ball.x).toBe(previous.ball.x + 4);
  expect(sample.ball.y).toBe(previous.ball.y + 2);
  expect(sample.paddle).toBe(previous.paddle + 5);
  expect(sample.enemy).toBe(previous.enemy - 5);
  expect(sample.ball.vx).toBe(current.ball.vx);
  expect(current.ball.x).toBe(previous.ball.x + 8);
});

it('draws respawns, points and level changes immediately instead of sliding across the arena', () => {
  const previous = newAction('pong', 'normal', 'mission');
  const point = {...previous, score: previous.score + 1, ball: {...previous.ball, x: previous.ball.x + 12}};
  expect(actionPresentation(previous, point, .5).ball).toBe(point.ball);
  for (const current of [{...point, lives: previous.lives - 1}, {...point, level: previous.level + 1}, {...point, done: true}]) expect(actionPresentation(previous, current, .5)).toBe(current);
  const warp = {...previous, ball: {...previous.ball, x: previous.ball.x + 100}};
  expect(actionPresentation(previous, warp, .5).ball).toBe(warp.ball);
  expect(actionPresentation(previous, point, NaN)).toBe(point);
});
