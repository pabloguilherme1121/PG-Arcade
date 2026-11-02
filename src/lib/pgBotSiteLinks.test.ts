import {describe,expect,it} from "vitest";
import {pgBotSiteUrl} from "./pgBotSiteLinks";

describe("links externos oficiais do PG Bot",()=>{
 it("usa o site do PG Bot e o ambiente correto",()=>{
  expect(pgBotSiteUrl("arcade")).toBe("https://pabloguilherme1121.github.io/PG-Bot/?projeto=arcade");
  expect(pgBotSiteUrl("arcade","snake")).toBe("https://pabloguilherme1121.github.io/PG-Bot/?projeto=arcade&jogo=snake");
  expect(pgBotSiteUrl("estrategia","est-001")).toBe("https://pabloguilherme1121.github.io/PG-Bot/?projeto=estrategia&jogo=est-001");
 });
 it("recusa IDs inseguros e mantém o destino oficial",()=>{
  expect(pgBotSiteUrl("arcade","javascript:alert(1)")).toBe(pgBotSiteUrl("arcade"));
  expect(pgBotSiteUrl("arcade","../outro")).toBe(pgBotSiteUrl("arcade"));
  expect(pgBotSiteUrl("arcade","")).toBe(pgBotSiteUrl("arcade"));
 });
});
