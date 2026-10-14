type Geometry = { height: number; primary: Path2D; secondary: Path2D };
// Keep only the last height of each theme. Paths stay in world coordinates and
// remain sharp after DPR/viewport changes without allocating raster layers.
let stars: Geometry | undefined;
let snowTracks: Geometry | undefined;

function geometry(height: number, snow: boolean): Geometry {
  const cached = snow ? snowTracks : stars;
  if (cached?.height === height) return cached;
  const primary = new Path2D(), secondary = new Path2D();
  if (snow) {
    for (let x = -120; x < 600; x += 64) {
      primary.moveTo(x, 0);
      primary.bezierCurveTo(x + 60, height / 3, x - 10, height * .7, x + 80, height);
    }
    for (let i = 0; i < 48; i++) secondary.rect((i * 139) % 480, (i * 83) % height, 2, 2);
  } else {
    for (let i = 0; i < 56; i++) {
      (i % 3 === 0 ? primary : secondary).rect(
        (i * 137 + 19) % 480, (i * 79 + 13) % height, i % 5 === 0 ? 2 : 1, 1,
      );
    }
  }
  const result = { height, primary, secondary };
  if (snow) snowTracks = result; else stars = result;
  return result;
}

/** Batch static decoration; physics, dynamic objects and resolution are unchanged. */
export function paintAtmosphere(c: CanvasRenderingContext2D, height: number, snow = false) {
  if (!Number.isFinite(height) || height <= 0) return;
  const { primary, secondary } = geometry(height, snow);
  if (snow) {
    c.strokeStyle = "#9ebed240";
    c.lineWidth = 2;
    c.stroke(primary);
    c.fillStyle = "#ffffffaa";
    c.fill(secondary);
    return;
  }
  const haze = c.createRadialGradient(340, 70, 8, 290, 120, 300);
  haze.addColorStop(0, "#628dc426");
  haze.addColorStop(.5, "#61479712");
  haze.addColorStop(1, "#101d2b00");
  c.fillStyle = haze;
  c.fillRect(0, 0, 480, height);
  c.fillStyle = "#d6e7ff88";
  c.fill(primary);
  c.fillStyle = "#aac9ef38";
  c.fill(secondary);
}
