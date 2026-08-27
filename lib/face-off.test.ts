import { describe, expect, it } from "vitest";
import { FACE_OFF_SECONDS, FACE_OFF_SIZE, faceOffBank, getFaceOffQuestion, publicQuestion } from "./face-off";

describe("Face-Off question delivery", () => {
  it("has enough questions for a full timed duel", () => {
    expect(FACE_OFF_SIZE).toBe(20);
    expect(FACE_OFF_SECONDS).toBe(10);
    expect(faceOffBank.length).toBeGreaterThanOrEqual(FACE_OFF_SIZE);
  });

  it("never sends the answer or explanation before a player answers", () => {
    const source = faceOffBank[0]!;
    const delivered = publicQuestion(getFaceOffQuestion(source.id));
    expect(delivered).toMatchObject({ id: source.id, prompt: source.prompt, choices: source.choices });
    expect(delivered).not.toHaveProperty("answer");
    expect(delivered).not.toHaveProperty("explanation");
  });

  it("returns null for an unknown stored question id", () => {
    expect(publicQuestion(getFaceOffQuestion("missing-question"))).toBeNull();
  });
});
