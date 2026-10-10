import {evaluateWord, type LetterState} from "./wordGame";

/** Record only information earned by submitted guesses, strongest evidence wins. */
export function wordKeyboardFeedback(guesses: readonly string[],answer: string): Record<string,LetterState> {
  const priority:Record<LetterState,number>={absent:1,present:2,correct:3};
  const knowledge:Record<string,LetterState>={};
  for(const guess of guesses) {
    const clues=evaluateWord(guess,answer);
    for(let i=0;i<clues.length;i++) {
      const letter=guess[i];
      const clue=clues[i];
      const previous=knowledge[letter];
      if(!previous || priority[clue]>priority[previous]) knowledge[letter]=clue;
    }
  }
  return knowledge;
}
