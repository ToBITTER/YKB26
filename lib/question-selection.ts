import type { QuizQuestion } from "@/types";

export function selectQuestionSet(bank: QuizQuestion[], count = 20, random: () => number = Math.random) {
  const shuffled = [...bank].sort(() => random() - .5);
  const selected: QuizQuestion[] = [];
  const selectedIds = new Set<string>();
  const seenAnswers = new Set<string>();
  const seenRecords = new Set<string>();

  const add = (question: QuizQuestion, requireNewRecord: boolean) => {
    const answer = question.answer.trim().toLowerCase();
    const record = question.sourceRecordId ?? answer;
    if (selectedIds.has(question.id) || seenAnswers.has(answer) || (requireNewRecord && seenRecords.has(record))) return;
    selected.push(question);
    selectedIds.add(question.id);
    seenAnswers.add(answer);
    seenRecords.add(record);
  };

  // Prefer twenty different footballers. Small club/category pools then fill
  // from other question types while still never repeating a question or answer.
  for (const question of shuffled) {
    add(question, true);
    if (selected.length === count) return selected;
  }
  for (const question of shuffled) {
    add(question, false);
    if (selected.length === count) return selected;
  }
  return selected;
}

export function selectUnseenQuestionSet(bank: QuizQuestion[], seenIds: Iterable<string>, count = 20, random: () => number = Math.random) {
  const seen = new Set(seenIds);
  return selectQuestionSet(bank.filter((question) => !seen.has(question.id)), count, random);
}

export function selectRotatingQuestionSet(bank: QuizQuestion[], seenIds: Iterable<string>, count = 20, random: () => number = Math.random) {
  const fresh = selectUnseenQuestionSet(bank, seenIds, count, random);
  return fresh.length === count ? fresh : selectQuestionSet(bank, count, random);
}
