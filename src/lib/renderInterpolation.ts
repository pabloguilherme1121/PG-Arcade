/** Interpolate presentation only; fixed-step physics and collisions stay authoritative. */
export function renderBetween<T extends {x:number;y:number;angle:number}>(previous:T,current:T,alpha:number):T {
  if (!Number.isFinite(alpha) || alpha>=1 || Math.hypot(current.x-previous.x,current.y-previous.y)>64) return current;
  const blend=Math.max(0,alpha);
  const angleDelta=Math.atan2(Math.sin(current.angle-previous.angle),Math.cos(current.angle-previous.angle));
  return {...current,x:previous.x+(current.x-previous.x)*blend,y:previous.y+(current.y-previous.y)*blend,angle:previous.angle+angleDelta*blend};
}
