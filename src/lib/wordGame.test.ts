import { describe, expect, it } from "vitest";
import { evaluateWord, words } from "./wordGame";
describe("word feedback", () => {
  it("allocates duplicated letters only once, after exact matches", () => {
    expect(evaluateWord("AAAAA", "PRAIA")).toEqual([
      "absent",
      "absent",
      "correct",
      "absent",
      "correct",
    ]);
    expect(evaluateWord("CARRO", "CARRO")).toEqual(Array(5).fill("correct"));
    expect(evaluateWord("ARCAR", "CARRO")).toEqual([
      "present",
      "present",
      "present",
      "absent",
      "present",
    ]);
  });
  it("has unique five-letter answers", () => {
    expect(new Set(words).size).toBe(words.length);
    expect(words.every((w) => /^[A-Z]{5}$/.test(w))).toBe(true);
  });
});
