import { describe, expect, it } from "vitest";
import careers from "./career-paths.generated.json";
import headToHead from "./head-to-head.generated.json";
import xiPlayers from "./xi-players.generated.json";

describe("expanded game modes",()=>{
  it("provides 20 valid career-path questions",()=>{expect(careers).toHaveLength(20);for(const question of careers){expect(question.choices).toHaveLength(4);expect(new Set(question.choices).size).toBe(4);expect(question.choices).toContain(question.answer)}});
  it("provides seven valid head-to-head question families",()=>{expect(headToHead.length).toBeGreaterThanOrEqual(20);const families=new Set(headToHead.map(question=>question.id.match(/^head-(younger|older|higher-number|lower-number|club|nationality|position)-/)?.[1]));expect(families.size).toBe(7);for(const question of headToHead){expect([question.left.name,question.right.name]).toContain(question.answer);expect(question.left.value).not.toBe(question.right.value)}});
  it("provides 300+ XI players ordered by positional group",()=>{expect(xiPlayers.length).toBeGreaterThanOrEqual(300);const order=["GK","DEF","MID","FWD"];const indexes=xiPlayers.map(player=>order.indexOf(player.role));expect(indexes).toEqual([...indexes].sort((a,b)=>a-b));expect(new Set(xiPlayers.map(player=>player.id)).size).toBe(xiPlayers.length)});
});
