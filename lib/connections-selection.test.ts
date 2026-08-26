import { describe, expect, it } from "vitest";
import puzzles from "../data/connections.json";
import { selectConnectionPuzzle, type ConnectionPuzzle } from "./connections-selection";

describe("Football Connections rotation", () => {
  const bank = puzzles as ConnectionPuzzle[];
  it("contains multiple valid boards", () => {
    expect(bank.length).toBeGreaterThanOrEqual(6);
    for (const puzzle of bank) {
      expect(puzzle.groups).toHaveLength(4);
      expect(new Set(puzzle.groups.flatMap((group) => group.items)).size).toBe(16);
      expect(puzzle.groups.every((group) => group.items.length === 4 && Boolean(group.hint))).toBe(true);
    }
  });
  it("chooses an unseen board when one is available", () => {
    const seen = bank.slice(0, -1).map((puzzle) => `connections-${puzzle.id}`);
    expect(selectConnectionPuzzle(bank, seen, () => 0).id).toBe(bank.at(-1)!.id);
  });
  it("rotates through consecutive sessions without returning the same players", () => {
    const seen: string[] = [];
    const boards = Array.from({ length: bank.length }, () => {
      const puzzle = selectConnectionPuzzle(bank, seen, () => 0);
      seen.push(`connections-${puzzle.id}`);
      return puzzle;
    });
    expect(new Set(boards.map((puzzle) => puzzle.id)).size).toBe(bank.length);
    for (let index = 1; index < boards.length; index++) {
      expect(boards[index]!.groups.flatMap((group) => group.items)).not.toEqual(boards[index - 1]!.groups.flatMap((group) => group.items));
    }
  });
});
