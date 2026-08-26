"use client";

import puzzles from "@/data/connections.json";
import { useEffect, useMemo, useRef, useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { useProgress } from "@/components/progress-provider";
import { calculateScore } from "@/lib/game";
import { selectConnectionPuzzle, type ConnectionPuzzle } from "@/lib/connections-selection";
import type { GameResult } from "@/types";
import { Result } from "./result";

export function ConnectionsGame() {
  const [run, setRun] = useState(0);
  return <Round key={run} again={() => setRun((value) => value + 1)} />;
}

function Round({ again }: { again: () => void }) {
  const { complete, progress, markQuestionsSeen } = useProgress();
  const [puzzle] = useState(() => selectConnectionPuzzle(puzzles as ConnectionPuzzle[], progress.seenQuestionIds));
  const groups = puzzle.groups;
  const items = useMemo(() => groups.flatMap((group) => group.items).sort(() => .5 - Math.random()), [groups]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(4);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintGroupIndex, setHintGroupIndex] = useState<number | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const started = useRef(Date.now());
  const hintedGroup = hintGroupIndex === null ? null : groups[hintGroupIndex];

  useEffect(() => {
    markQuestionsSeen([`connections-${puzzle.id}`]);
    // The chosen board remains fixed for the whole round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(item: string) {
    if (solved.includes(item)) return;
    setSelected((current) => current.includes(item) ? current.filter((entry) => entry !== item) : current.length < 4 ? [...current, item] : current);
  }

  function useHint() {
    const groupIndex = hintGroupIndex ?? groups.findIndex((group) => !group.items.every((item) => solved.includes(item)));
    if (groupIndex < 0) return;
    setHintGroupIndex(groupIndex);
    if (hintLevel === 0) setHintLevel(1);
    else if (hintLevel === 1) {
      setHintLevel(2);
      setSelected(groups[groupIndex]!.items.filter((item) => !solved.includes(item)).slice(0, 2));
    }
  }

  function submit() {
    if (selected.length !== 4) return;
    const group = groups.find((candidate) => candidate.items.every((item) => selected.includes(item)));
    if (group) {
      const next = [...solved, ...group.items];
      setSolved(next);
      setFlash("good");
      setSelected([]);
      if (hintedGroup?.category === group.category) {
        setHintLevel(0);
        setHintGroupIndex(null);
      }
      if (next.length === 16) {
        const xp = calculateScore("connections", 4, 4, 4) + (mistakes * 50);
        const gameResult = { score: xp, xp, correct: 4, total: 4, bestStreak: 4, elapsed: Math.round((Date.now() - started.current) / 1000), mode: "Football Connections" };
        complete(gameResult, "World");
        setTimeout(() => setResult(gameResult), 700);
      }
    } else {
      setFlash("bad");
      setMistakes((value) => value - 1);
      setSelected([]);
      if (mistakes <= 1) {
        const score = solved.length / 4 * 100;
        const gameResult = { score, xp: score, correct: solved.length / 4, total: 4, bestStreak: solved.length / 4, elapsed: Math.round((Date.now() - started.current) / 1000), mode: "Football Connections" };
        complete(gameResult, "World");
        setTimeout(() => setResult(gameResult), 700);
      }
    }
    setTimeout(() => setFlash(null), 600);
  }

  if (result) return <main className="game-shell"><Result result={result} onAgain={again} /></main>;
  return <main className="game-shell"><header className="game-hud"><div><span>GROUPS</span><strong>{solved.length / 4}<i>/4</i></strong></div><div className="hud-progress"><i style={{ width: `${solved.length / 16 * 100}%` }} /></div><div><X /><strong>{mistakes}</strong></div></header><section className="question-card connections"><div className="mode-label">FOOTBALL CONNECTIONS</div><h1>FIND FOUR GROUPS OF FOUR.</h1><p>Select four items linked by one football connection.</p><div className="solved-groups">{groups.filter((group) => group.items.every((item) => solved.includes(item))).map((group) => <div key={group.category}><strong>{group.category}</strong><span>{group.items.join(" · ")}</span></div>)}</div>{hintLevel > 0 && hintedGroup && <aside className="connection-hint" aria-live="polite"><Lightbulb /><div><strong>HINT {hintLevel}/2</strong><span>{hintedGroup.hint}</span>{hintLevel === 2 && <small>Two matching players have been selected for you.</small>}</div></aside>}<div className={`connection-grid ${flash ?? ""}`}>{items.filter((item) => !solved.includes(item)).map((item) => <button onClick={() => choose(item)} className={selected.includes(item) ? "selected" : ""} key={item}>{item}</button>)}</div><div className="connection-actions"><button className="hint-choice" disabled={hintLevel === 2} onClick={useHint}><Lightbulb />{hintLevel === 0 ? "GET A HINT" : hintLevel === 1 ? "STRONGER HINT" : "HINT USED"}</button><button className="submit-choice" disabled={selected.length !== 4} onClick={submit}>SUBMIT FOUR</button></div></section></main>;
}
