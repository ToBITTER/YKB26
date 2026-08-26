export type ConnectionPuzzle = { id: string; groups: { category: string; hint: string; items: string[] }[] };

export function selectConnectionPuzzle(puzzles: ConnectionPuzzle[], seenIds: Iterable<string>, random: () => number = Math.random): ConnectionPuzzle {
  const seen = new Set(seenIds);
  const fresh = puzzles.filter((puzzle) => !seen.has(`connections-${puzzle.id}`));
  const pool = fresh.length ? fresh : puzzles;
  return pool[Math.floor(random() * pool.length)]!;
}
