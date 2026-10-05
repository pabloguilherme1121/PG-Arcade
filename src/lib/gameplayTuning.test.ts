import { describe, expect, it } from "vitest";
import { motionTuning, rhythmHitQuality } from "./gameplayTuning";

describe("motion difficulty tuning", () => {
  it("builds a readable three-step difficulty curve without changing control semantics", () => {
    expect(motionTuning(0)).toMatchObject({
      speed: 0.9,
      invulnerability: 0.75,
      goodWindow: 56,
      perfectWindow: 22,
    });
    expect(motionTuning(1)).toMatchObject({
      speed: 1,
      invulnerability: 0.55,
      goodWindow: 44,
      perfectWindow: 15,
    });
    expect(motionTuning(2)).toMatchObject({
      speed: 1.18,
      invulnerability: 0.4,
      goodWindow: 34,
      perfectWindow: 11,
    });
  });

  it("gives beginners a larger rhythm window while advanced play rewards precision", () => {
    expect(rhythmHitQuality(20, 0)).toBe("perfect");
    expect(rhythmHitQuality(48, 0)).toBe("good");
    expect(rhythmHitQuality(48, 1)).toBe("miss");
    expect(rhythmHitQuality(12, 2)).toBe("good");
    expect(rhythmHitQuality(8, 2)).toBe("perfect");
    expect(rhythmHitQuality(36, 2)).toBe("miss");
  });
});
