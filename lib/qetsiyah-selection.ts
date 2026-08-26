export type QetsiyahQuestion = { id: string; category: "Pop Culture" | "History" | "General Knowledge"; sourceCategory: string; difficulty: string; prompt: string; answer: string; choices: string[] };

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target]!, copy[index]!];
  }
  return copy;
}

export function selectQetsiyahSet(bank: QetsiyahQuestion[], seenIds: Iterable<string>, count = 20, category?: string, random: () => number = Math.random): QetsiyahQuestion[] {
  const seen = new Set(seenIds);
  const eligible = bank.filter((question) => !seen.has(question.id) && (!category || category === "Mixed" || question.category === category));
  if (category && category !== "Mixed") return shuffle(eligible, random).slice(0, count).map((question) => ({ ...question, choices: shuffle(question.choices, random) }));
  const groups = ["Pop Culture", "History", "General Knowledge"].map((name) => shuffle(eligible.filter((question) => question.category === name), random));
  const selected: QetsiyahQuestion[] = [];
  while (selected.length < count && groups.some((group) => group.length)) {
    for (const group of groups) {
      const question = group.pop();
      if (question) selected.push({ ...question, choices: shuffle(question.choices, random) });
      if (selected.length === count) break;
    }
  }
  return selected;
}
