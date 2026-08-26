import { describe, expect, it } from "vitest";
import careers from "./career-paths.generated.json";
import headToHead from "./head-to-head.generated.json";
import xiPlayers from "./xi-players.generated.json";

describe("expanded game modes",()=>{
  it("provides 60 valid rotating career-path questions",()=>{expect(careers.length).toBeGreaterThanOrEqual(60);expect(new Set(careers.map(question=>question.answer)).size).toBe(careers.length);for(const question of careers){expect(question.clubs.length).toBeGreaterThanOrEqual(2);expect(question.choices).toHaveLength(4);expect(new Set(question.choices).size).toBe(4);expect(question.choices).toContain(question.answer)}});
  it("provides varied head-to-head families without squad-number comparisons",()=>{expect(headToHead.length).toBeGreaterThanOrEqual(20);const families=new Set(headToHead.map(question=>question.id.match(/^head-(younger|older|teammate|compatriot|club|nationality|position)-/)?.[1]));expect(families.size).toBe(7);expect(headToHead.every(question=>!question.prompt.toLowerCase().includes("squad number"))).toBe(true);for(const question of headToHead){expect([question.left.name,question.right.name]).toContain(question.answer);expect(question.left.value).not.toBe(question.right.value)}});
  it("provides 300+ XI players ordered by positional group",()=>{expect(xiPlayers.length).toBeGreaterThanOrEqual(300);const order=["GK","DEF","MID","FWD"];const indexes=xiPlayers.map(player=>order.indexOf(player.role));expect(indexes).toEqual([...indexes].sort((a,b)=>a-b));expect(new Set(xiPlayers.map(player=>player.id)).size).toBe(xiPlayers.length)});
});
