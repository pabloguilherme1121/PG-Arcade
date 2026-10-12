type Snapshot = {score:number;lives:number;time:number};
export function createCanvasFeedback(initial:Snapshot) {
  let previous=initial, earned=0, scoredAt=-Infinity, damagedAt=-Infinity;
  return (context:CanvasRenderingContext2D,current:Snapshot,height:number,reduced:boolean) => {
    if(current.time<previous.time) {earned=0;scoredAt=damagedAt=-Infinity;}
    if(current.score>previous.score) {earned=current.score-previous.score;scoredAt=current.time;}
    if(current.lives<previous.lives) damagedAt=current.time;
    previous=current;
    if(reduced) return;
    context.save();
    const damageAge=current.time-damagedAt;
    if(damageAge>=0 && damageAge<.35) {
      context.strokeStyle=`rgba(255,172,130,${(1-damageAge/.35)*.65})`;
      context.lineWidth=4;context.strokeRect(3,3,474,height-6);
    }
    const age=current.time-scoredAt;
    if(age>=0 && age<.65) {
      context.globalAlpha=1-age/.65;context.font='bold 18px sans-serif';context.textAlign='right';
      context.fillStyle='#10261e';context.fillRect(385,12-age*8,82,30);
      context.fillStyle='#e2ffac';context.fillText(`+${earned}`,455,33-age*8);
    }
    context.restore();
  };
}
