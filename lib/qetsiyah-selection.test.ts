import { describe, expect, it } from "vitest";
import bank from "../data/qetsiyah-questions.generated.json";
import { selectQetsiyahSet, type QetsiyahQuestion } from "./qetsiyah-selection";

describe("Qetsiyah question bank", () => {
  const questions = bank as QetsiyahQuestion[];
  it("contains exactly 2,000 unique, valid questions", () => {
    expect(questions).toHaveLength(2000);
    expect(new Set(questions.map((question) => question.id)).size).toBe(2000);
    expect(new Set(questions.map((question) => question.prompt.toLowerCase())).size).toBe(2000);
    expect(questions.every((question) => question.choices.length === 4 && new Set(question.choices).size === 4 && question.choices.includes(question.answer))).toBe(true);
  });
  it("rotates 20 unseen questions with all three categories", () => {
    const first = selectQetsiyahSet(questions, [], 20, "Mixed", () => .42);
    const second = selectQetsiyahSet(questions, first.map((question) => question.id), 20, "Mixed", () => .73);
    expect(first).toHaveLength(20);
    expect(second).toHaveLength(20);
    expect(new Set([...first, ...second].map((question) => question.id)).size).toBe(40);
    expect(new Set(first.map((question) => question.category)).size).toBe(3);
  });
});
