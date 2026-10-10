import { describe, expect, it } from "vitest";
import { runLaneRadar, runTimeProgress } from "./runFeedback";

describe("Expedições: radar visual sem mexer no motor", () => {
  it("avisa apenas sobre objetos visíveis próximos, com perigo acima de bônus", () => {
    const objects = [
      {id:1,lane:0,y:45,reward:false},
      {id:2,lane:1,y:35,reward:true},
      {id:3,lane:1,y:65,reward:false},
      {id:4,lane:2,y:15,reward:false},
      {id:5,lane:2,y:95,reward:true},
    ];
    expect(runLaneRadar(objects)).toEqual(["danger","danger","clear"]);
    expect(objects[0].y).toBe(45);
    expect(runLaneRadar([{id:1,lane:2,y:60,reward:true}])).toEqual(["clear","clear","reward"]);
  });
  it("ignora faixas inexistentes e objetos fora do radar",()=>{
    expect(runLaneRadar([])).toEqual(["clear","clear","clear"]);
    expect(runLaneRadar([{id:1,lane:9,y:40,reward:false},{id:2,lane:0,y:-25,reward:false}]))
      .toEqual(["clear","clear","clear"]);
  });
  it("limita o progresso e oculta o cronômetro de sobrevivência infinita",()=>{
    expect(runTimeProgress(0,900)).toBe(0);
    expect(runTimeProgress(450,900)).toBe(50);
    expect(runTimeProgress(1200,900)).toBe(100);
    expect(runTimeProgress(-50,900)).toBe(0);
    expect(runTimeProgress(100,Infinity)).toBeNull();
    expect(runTimeProgress(100,0)).toBeNull();
  });
});
