import type { Career } from "@/types";

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target]!, copy[index]!];
  }
  return copy;
}

export function selectUnseenCareers(bank: Career[], seenIds: Iterable<string>, count = 20, random: () => number = Math.random): Career[] {
  const seen = new Set(seenIds);
  return shuffle(bank.filter((question) => !seen.has(question.id)), random).slice(0, count).map((question) => ({ ...question, choices: shuffle(question.choices, random) }));
}
