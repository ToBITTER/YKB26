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
  const fresh = shuffle(bank.filter((question) => !seen.has(question.id)), random);
  const selected = fresh.slice(0, count);
  if (selected.length < count) {
    const selectedIds = new Set(selected.map((question) => question.id));
    selected.push(...shuffle(bank.filter((question) => !selectedIds.has(question.id)), random).slice(0, count - selected.length));
  }
  return selected.map((question) => ({ ...question, choices: shuffle(question.choices, random) }));
}
