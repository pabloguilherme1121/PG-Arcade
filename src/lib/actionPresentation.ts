import type { ActionState } from './actionCollection';
import { renderBetween } from './renderInterpolation';

/** Visual samples never feed back into the simulation. */
export function actionPresentation(previous: ActionState, current: ActionState, alpha: number): ActionState {
  if (!Number.isFinite(alpha) || alpha >= 1 || current.done || previous.id !== current.id || previous.lives !== current.lives || previous.level !== current.level) return current;
  const blend = Math.max(0, alpha);
  const scalar = (a: number, b: number) => Math.abs(b - a) > 64 ? b : a + (b - a) * blend;
  const ball = previous.score !== current.score && current.id === 'pong'
    ? current.ball
    : Math.hypot(current.ball.x - previous.ball.x, current.ball.y - previous.ball.y) > 64
      ? current.ball
      : {...current.ball, x: scalar(previous.ball.x, current.ball.x), y: scalar(previous.ball.y, current.ball.y)};
  return {...renderBetween(previous, current, alpha), ball, paddle: scalar(previous.paddle, current.paddle), enemy: scalar(previous.enemy, current.enemy)};
}
