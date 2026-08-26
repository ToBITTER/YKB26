import { describe, expect, it } from "vitest";
import games from "../data/head-to-head.generated.json";
import { selectUnseenHeadSet, type HeadQuestion } from "./head-selection";

describe("head-to-head rotation", () => {
  it("returns 20 varied unseen questions per session", () => {
    const bank = games as HeadQuestion[];
    const first = selectUnseenHeadSet(bank, [], 20, () => 0.42);
    const second = selectUnseenHeadSet(bank, first.map((question) => question.id), 20, () => 0.73);
    expect(first).toHaveLength(20);
    expect(second).toHaveLength(20);
    expect(new Set([...first, ...second].map((question) => question.id)).size).toBe(40);
    expect(new Set(first.map((question) => question.id.match(/^head-([^-]+)/)?.[1])).size).toBeGreaterThanOrEqual(6);
  });

  it("never recycles exhausted questions", () => {
    const bank = games as HeadQuestion[];
    expect(selectUnseenHeadSet(bank, bank.map((question) => question.id), 20)).toEqual([]);
  });
});
