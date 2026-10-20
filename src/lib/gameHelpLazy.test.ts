import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { newGames } from "./newCatalog";
import { gameHelp } from "./gameHelp";

describe("gameplay help is loaded when entering an arena, not inside the initial catalog", () => {
  it("keeps the full help module behind the existing lazy boundary", () => {
    const app = readFileSync("src/App.tsx", "utf8");
    const help = readFileSync("src/QuickHelpText.tsx", "utf8");
    expect(app).not.toContain('import { gameHelp } from "./lib/gameHelp"');
    expect(app).toContain("const QuickHelpText = lazy(");
    expect(app).toContain("<QuickHelpText id={game.id}");
    expect(help).toContain('import { gameHelp } from "./lib/gameHelp"');
    expect(help).toContain("gameHelp[id]");
    expect(help).toContain("leadOnly");
    expect(help).toContain("Alt + Shift + B");
  });
  it("keeps detailed guidance while catalog metadata stays compact", () => {
    expect(newGames).toHaveLength(50);
    for (const game of newGames) {
      expect(game).not.toHaveProperty("help");
      expect(game.description.length).toBeLessThanOrEqual(150);
      expect(gameHelp[game.id].length).toBeGreaterThan(65);
    }
  });
});
