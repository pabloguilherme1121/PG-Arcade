import {describe,expect,it} from "vitest";
import {newContracts,startContracts,chooseContractColor,nextContracts,scoreCollection,type ColorContracts} from "./rules";
describe("Contrato das Cores — escolha compartilhada e coleção competitiva",()=>{
  it("gera rodada determinística e mercado com três alternativas",()=>{
    const a=newContracts(3,7);
    expect(a).toEqual(newContracts(3,7));
    expect(a.market).toHaveLength(3);
    expect(new Set(a.market).size).toBe(3);
    expect(a.collections).toHaveLength(3);
    expect(a.turn).toBe(0);
    expect(a.phase).toBe("ready");
    expect(startContracts(a).phase).toBe("playing");
  });
  it("cada jogador escolhe exatamente uma peça e afeta o mercado compartilhado",()=>{
    const before=startContracts(newContracts(2,7));
    const chosen=before.market[1];
    const after=chooseContractColor(before,1);
    expect(after.collections[0]).toEqual([chosen]);
    expect(after.collections[1]).toHaveLength(0);
    expect(after.turn).toBe(1);
    expect(after.market).toHaveLength(3);
    expect(after.market[0]).toBe(before.market[0]);
    expect(after.market[1]).not.toBeUndefined();
    expect(before.collections[0]).toEqual([]);
    expect(chooseContractColor(after,-1)).toBe(after);
    expect(chooseContractColor(after,4)).toBe(after);
    expect(chooseContractColor(after,1.5)).toBe(after);
  });
  it("contratos públicos incentivam pares, trincas e diversidade",()=>{
    const contract=["rubro","jade"] as const;
    expect(scoreCollection([],contract)).toBe(0);
    expect(scoreCollection(["rubro"],contract)).toBe(6);
    expect(scoreCollection(["rubro","rubro"],contract)).toBe(17);
    expect(scoreCollection(["rubro","rubro","rubro"],contract)).toBe(38);
    expect(scoreCollection(["rubro","ciano","jade","ouro"],contract)).toBe(28);
  });
  it("encerra exatamente após quatro escolhas por jogador e admite empates",()=>{
    let g:ColorContracts=startContracts(newContracts(4,13));
    for(let step=0;step<16;step++){
      expect(g.phase).toBe("playing");
      g=chooseContractColor(g,step%3);
    }
    expect(g.phase).toBe("done");
    expect(g.turn).toBe(16);
    expect(g.collections.every(c=>c.length===4)).toBe(true);
    expect(g.winners.length).toBeGreaterThan(0);
    expect(g.winners.every(i=>g.scores[i]===Math.max(...g.scores))).toBe(true);
    expect(chooseContractColor(g,0)).toBe(g);
    const reset=nextContracts(g);
    expect(reset.phase).toBe("ready");
    expect(reset.seed).not.toBe(g.seed);
    expect(reset.collections.every(c=>c.length===0)).toBe(true);
  });
});
