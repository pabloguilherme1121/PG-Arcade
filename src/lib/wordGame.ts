export const words = [
  "CARRO",
  "PISTA",
  "NAVES",
  "JOGOS",
  "CORES",
  "LIVRO",
  "PRAIA",
  "PEDRA",
  "FESTA",
  "CAMPO",
  "TRATO",
  "PORTA",
  "MUNDO",
  "TEMPO",
  "VERDE",
];
export type LetterState = "correct" | "present" | "absent";
export function evaluateWord(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(5).fill("absent");
  const remaining = answer.split("");
  for (let i = 0; i < 5; i++)
    if (guess[i] === answer[i]) {
      result[i] = "correct";
      remaining[i] = "";
    }
  for (let i = 0; i < 5; i++)
    if (result[i] !== "correct") {
      const match = remaining.indexOf(guess[i]);
      if (match >= 0) {
        result[i] = "present";
        remaining[match] = "";
      }
    }
  return result;
}
