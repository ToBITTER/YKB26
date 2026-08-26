import { describe, expect, it } from "vitest";
import careers from "../data/career-paths.generated.json";
import type { Career } from "../types";
import { selectUnseenCareers } from "./career-selection";

describe("Career Path rotation", () => {
  const bank = careers as Career[];
  it("returns different players across three 20-question sessions", () => {
    const seen: string[] = [];
    const sessions = Array.from({ length: 3 }, (_, index) => {
      const session = selectUnseenCareers(bank, seen, 20, () => .31 + index * .2);
      seen.push(...session.map((question) => question.id));
      return session;
    });
    expect(sessions.every((session) => session.length === 20)).toBe(true);
    expect(new Set(sessions.flat().map((question) => question.id)).size).toBe(60);
  });
});
