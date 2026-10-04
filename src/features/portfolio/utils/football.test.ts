import { describe, expect, it } from "vitest";
import { chooseFootballKeeperPosition, resolveFootballShot } from "./football";
describe("football shots", () => {
  it("makes harder keepers anticipate the selected corner", () => {
    const easy = chooseFootballKeeperPosition("easy", 80, () => 0);
    const master = chooseFootballKeeperPosition("master", 80, () => 0);
    expect(Math.abs(master - 80)).toBeLessThan(Math.abs(easy - 80));
  });
  it("rejects excessive power and shots outside the goal", () => {
    expect(resolveFootballShot("penalty", 50, 100, 0, 0).result).toBe("fora");
    expect(resolveFootballShot("penalty", 0, 60, 0, 50).result).toBe("fora");
  });
  it("allows the keeper to save and rewards placement", () => {
    expect(resolveFootballShot("penalty", 50, 65, 0, 50).result).toBe("defesa");
    expect(resolveFootballShot("penalty", 20, 65, 0, 70).result).toBe("gol");
  });
  it("requires height or curve to beat the free-kick wall", () => {
    expect(resolveFootballShot("free-kick", 50, 40, 0, 10).result).toBe(
      "barreira",
    );
    expect(resolveFootballShot("free-kick", 50, 65, 70, 10).result).toBe("gol");
  });
});
