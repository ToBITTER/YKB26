export type HeadQuestion = {
  id: string;
  prompt: string;
  left: { name: string; value: string | number; label: string };
  right: { name: string; value: string | number; label: string };
  answer: string;
  category: string;
};

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

export function selectUnseenHeadSet(bank: HeadQuestion[], seenIds: Iterable<string>, count = 20, random: () => number = Math.random): HeadQuestion[] {
  const seen = new Set(seenIds);
  const groups = new Map<string, HeadQuestion[]>();
  for (const question of bank) {
    if (seen.has(question.id)) continue;
    const family = question.id.match(/^head-(younger|older|teammate|compatriot|club|nationality|position)-/)?.[1] ?? "other";
    groups.set(family, [...(groups.get(family) ?? []), question]);
  }
  const buckets = shuffle([...groups.values()].map((group) => shuffle(group, random)), random);
  const selected: HeadQuestion[] = [];
  while (selected.length < count && buckets.some((bucket) => bucket.length)) {
    for (const bucket of buckets) {
      const question = bucket.pop();
      if (question) selected.push(question);
      if (selected.length === count) break;
    }
  }
  return selected;
}
