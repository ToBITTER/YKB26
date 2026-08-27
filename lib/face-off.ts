import questions from "../data/questions.generated.json";
import type { QuizQuestion } from "../types";

export const FACE_OFF_SIZE = 20;
export const FACE_OFF_SECONDS = 10;
export const faceOffBank = questions as QuizQuestion[];
const byId = new Map(faceOffBank.map((question) => [question.id, question]));
export const getFaceOffQuestion = (id: string) => byId.get(id);
export function publicQuestion(question: QuizQuestion | undefined) {
  if (!question) return null;
  return { id: question.id, prompt: question.prompt, choices: question.choices, category: question.category, kind: question.kind };
}
