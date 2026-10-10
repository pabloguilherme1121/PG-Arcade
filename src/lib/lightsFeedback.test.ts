import {describe,expect,it} from "vitest";
import {lightsAffectedCells, lightsFocusTarget, lightsMoveImpact} from "./lightsFeedback";

describe("Lights Out preview and keyboard navigation",()=>{
  it("highlights the exact self/orthogonal cross without wrapping rows",()=>{
    expect(lightsAffectedCells(0)).toEqual([0,1,5]);
    expect(lightsAffectedCells(4)).toEqual([3,4,9]);
    expect(lightsAffectedCells(12)).toEqual([7,11,12,13,17]);
    expect(lightsAffectedCells(24)).toEqual([19,23,24]);
  });
  it("previews how many lights turn on versus off without touching the board",()=>{
    const board=Array(25).fill(false);
    board[12]=true;board[7]=true;
    expect(lightsMoveImpact(board,12)).toEqual({on:3,off:2});
    expect(board[12]).toBe(true);
    expect(board[7]).toBe(true);
  });
  it("never wraps rows, skips disabled keys and respects board edges",()=>{
    expect(lightsFocusTarget(4,"ArrowRight")).toBeNull();
    expect(lightsFocusTarget(5,"ArrowLeft")).toBeNull();
    expect(lightsFocusTarget(0,"ArrowUp")).toBeNull();
    expect(lightsFocusTarget(24,"ArrowDown")).toBeNull();
    expect(lightsFocusTarget(12,"ArrowUp")).toBe(7);
    expect(lightsFocusTarget(12,"ArrowRight")).toBe(13);
    expect(lightsFocusTarget(12,"Enter")).toBeNull();
  });
});
