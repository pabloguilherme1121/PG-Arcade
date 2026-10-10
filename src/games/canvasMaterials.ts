/** Lightweight vector materials remain sharp at every display resolution. */
export function paintOrb(c: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  if (radius <= 0) return;
  const material = c.createRadialGradient(x - radius * .35, y - radius * .4, 0, x, y, radius * 1.2);
  material.addColorStop(0, "#f4fbff");
  material.addColorStop(.3, color);
  material.addColorStop(1, "#152a3d");
  c.fillStyle = material;
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#ffffff40";
  c.lineWidth = 1;
  c.stroke();
}
export function paintBlock(c: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
  if (width <= 0 || height <= 0) return;
  c.fillStyle = "#00000038";
  c.fillRect(x + 2, y + 4, width, height);
  const material = c.createLinearGradient(x, y, x, y + height);
  material.addColorStop(0, color);
  material.addColorStop(1, "#243e50");
  c.fillStyle = material;
  c.beginPath();
  c.roundRect(x, y, width, height, Math.min(4, height / 3));
  c.fill();
  c.fillStyle = "#ffffff45";
  c.fillRect(x + 2, y + 1, Math.max(0, width - 4), Math.min(2, height));
}
export function paintAtmosphere(c: CanvasRenderingContext2D, height: number, snow = false) {
  if (snow) {
    c.strokeStyle = "#9ebed240";
    c.lineWidth = 2;
    for (let x = -120; x < 600; x += 64) {
      c.beginPath();
      c.moveTo(x, 0);
      c.bezierCurveTo(x + 60, height / 3, x - 10, height * .7, x + 80, height);
      c.stroke();
    }
    c.fillStyle = "#ffffffaa";
    for (let i = 0; i < 48; i++) c.fillRect((i * 139) % 480, (i * 83) % height, 2, 2);
    return;
  }
  const haze = c.createRadialGradient(340, 70, 8, 290, 120, 300);
  haze.addColorStop(0, "#628dc426");
  haze.addColorStop(.5, "#61479712");
  haze.addColorStop(1, "#101d2b00");
  c.fillStyle = haze;
  c.fillRect(0, 0, 480, height);
  for (let i = 0; i < 56; i++) {
    c.fillStyle = i % 3 === 0 ? "#d6e7ff88" : "#aac9ef38";
    c.fillRect((i * 137 + 19) % 480, (i * 79 + 13) % height, i % 5 === 0 ? 2 : 1, 1);
  }
}

export function paintRock(c: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  paintOrb(c,x,y,radius,"#8e9caa");
  for (const [dx,dy,r] of [[-.3,-.18,.24],[.32,.3,.16],[.25,-.4,.1]]) {
    c.fillStyle="#23384880";
    c.beginPath();c.arc(x+dx*radius,y+dy*radius,r*radius,0,Math.PI*2);c.fill();
    c.strokeStyle="#d5e1ea55";c.lineWidth=1;c.stroke();
  }
}

export function paintRoadCar(c: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, direction: number) {
  c.save();c.translate(x,y);c.scale(direction<0?-1:1,1);
  c.fillStyle="#07121d";
  for(const dx of [-radius*.55,radius*.55]) for(const dy of [-14,10]) c.fillRect(dx-5,dy,10,4);
  paintBlock(c,-radius,-12,radius*2,24,color);
  c.fillStyle="#0c243a";c.beginPath();c.roundRect(-radius*.3,-9,radius*.6,18,3);c.fill();
  c.fillStyle="#94cbe4";c.fillRect(radius*.13,-7,3,14);
  c.fillStyle="#ffedb5";c.fillRect(radius-4,-8,2,5);c.fillRect(radius-4,3,2,5);
  c.fillStyle="#ec6d66";c.fillRect(-radius+2,-8,2,5);c.fillRect(-radius+2,3,2,5);
  c.restore();
}

export function paintFrog(c: CanvasRenderingContext2D, x: number, y: number) {
  c.fillStyle="#87bc62";
  for(const side of [-1,1]) {c.beginPath();c.ellipse(x+side*8,y+4,3,5,side*.3,0,Math.PI*2);c.fill();}
  c.fillStyle="#b6df78";c.beginPath();c.ellipse(x,y,8,10,0,0,Math.PI*2);c.fill();
  for(const side of [-1,1]) {
    c.fillStyle="#e0f4ba";c.beginPath();c.arc(x+side*5,y-6,3,0,Math.PI*2);c.fill();
    c.fillStyle="#152a20";c.beginPath();c.arc(x+side*5,y-7,1.4,0,Math.PI*2);c.fill();
  }
}
