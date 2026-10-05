export type MotionTuning = {
  speed: number;
  invulnerability: number;
  goodWindow: number;
  perfectWindow: number;
  scoreMultiplier: number;
};

const profiles: readonly MotionTuning[] = [
  {
    speed: 0.9,
    invulnerability: 0.75,
    goodWindow: 56,
    perfectWindow: 22,
    scoreMultiplier: 0.9,
  },
  {
    speed: 1,
    invulnerability: 0.55,
    goodWindow: 44,
    perfectWindow: 15,
    scoreMultiplier: 1,
  },
  {
    speed: 1.18,
    invulnerability: 0.4,
    goodWindow: 34,
    perfectWindow: 11,
    scoreMultiplier: 1.2,
  },
];

export function motionTuning(difficulty: number): MotionTuning {
  const index = Math.max(0, Math.min(2, Math.round(difficulty)));
  return profiles[index];
}

export function rhythmHitQuality(
  offset: number,
  difficulty: number,
): "perfect" | "good" | "miss" {
  const tuning = motionTuning(difficulty);
  const distance = Math.abs(offset);
  if (distance <= tuning.perfectWindow) return "perfect";
  if (distance <= tuning.goodWindow) return "good";
  return "miss";
}
