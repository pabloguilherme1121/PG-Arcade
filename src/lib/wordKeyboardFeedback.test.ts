import {describe,expect,it} from "vitest";
import {wordKeyboardFeedback} from "./wordKeyboardFeedback";

describe("Palavra Secreta keyboard knowledge",()=>{
  it("derives letter colors only from prior attempts",()=>{
    expect(wordKeyboardFeedback([], "CARRO")).toEqual({});
    const keys=wordKeyboardFeedback(["PORTA"],"CARRO");
    expect(keys.P).toBe("absent");
    expect(keys.O).toBe("present");
    expect(keys.R).toBe("correct");
    expect(keys.T).toBe("absent");
    expect(keys.A).toBe("present");
    expect(keys.C).toBeUndefined();
  });
  it("keeps the strongest known clue for repeated letters and attempts",()=>{
    const keys=wordKeyboardFeedback(["CAAAA","CARRO"],"CARRO");
    expect(keys.A).toBe("correct");
    expect(keys.C).toBe("correct");
    expect(keys.R).toBe("correct");
    expect(keys.O).toBe("correct");
    expect(keys.Z).toBeUndefined();
  });
});
