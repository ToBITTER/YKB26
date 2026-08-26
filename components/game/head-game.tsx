"use client";

import games from "@/data/head-to-head.generated.json";
import { useEffect, useRef, useState } from "react";
import { Check, X, Zap } from "lucide-react";
import { calculateScore } from "@/lib/game";
import { selectUnseenHeadSet, type HeadQuestion } from "@/lib/head-selection";
import { useProgress } from "@/components/progress-provider";
import type { GameResult } from "@/types";
import { Result } from "./result";

export function HeadGame() {
  const [run, setRun] = useState(0);
  const { progress, historyReady, markQuestionsSeen } = useProgress();
  if (!historyReady) return <main className="game-shell"><p>Loading your unseen matchups…</p></main>;
  return <Round key={run} seenIds={progress.seenQuestionIds} markSeen={markQuestionsSeen} again={() => setRun((value) => value + 1)} />;
}

function Round({ again, seenIds, markSeen }: { again: () => void; seenIds: string[]; markSeen: (ids: string[]) => void }) {
  const [questions] = useState(() => selectUnseenHeadSet(games as HeadQuestion[], seenIds));
  const { complete } = useProgress();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const started = useRef(Date.now());

  useEffect(() => {
    if (questions.length === 20) markSeen(questions.map((question) => question.id));
    // A round's random selection stays fixed after it mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (questions.length < 20) return <main className="game-shell"><section className="question-card"><div className="mode-label">MATCHUPS COMPLETE</div><h1>YOU’VE CLEARED EVERY FRESH HEAD-TO-HEAD.</h1><p>We will not repeat questions you have already played. More verified matchups are coming.</p></section></main>;
  const q = questions[i]!;

  function answer(name: string) {
    if (pick) return;
    setPick(name);
    const yes = name === q.answer;
    const next = yes ? streak + 1 : 0;
    const earned = yes ? calculateScore("head-to-head", 1, 1, next) : 0;
    setTimeout(() => {
      if (i === questions.length - 1) {
        const gameResult = { score: xp + earned, xp: xp + earned, correct: correct + (yes ? 1 : 0), total: questions.length, bestStreak: Math.max(best, next), elapsed: Math.round((Date.now() - started.current) / 1000), mode: "Head-to-Head" };
        complete(gameResult, q.category);
        setResult(gameResult);
      } else {
        setI((value) => value + 1);
        setPick(null);
        if (yes) {
          setCorrect((value) => value + 1);
          setStreak(next);
          setBest((value) => Math.max(value, next));
          setXp((value) => value + earned);
        } else setStreak(0);
      }
    }, 1000);
  }

  if (result) return <main className="game-shell"><Result result={result} onAgain={again} /></main>;
  return <main className="game-shell"><header className="game-hud"><div><span>DUEL</span><strong>{i + 1}<i>/{questions.length}</i></strong></div><div className="hud-progress"><i style={{ width: `${i / questions.length * 100}%` }} /></div><div><Zap /><strong>{xp}</strong></div></header><section className="question-card head"><div className="mode-label">HEAD-TO-HEAD · 20 QUESTIONS · {streak} STREAK</div><h1>{q.prompt}</h1><div className="versus"><button disabled={!!pick} onClick={() => answer(q.left.name)} className={pick ? (q.left.name === q.answer ? "correct" : pick === q.left.name ? "wrong" : "dim") : ""}><span className="player-initial">{q.left.name.split(" ").map((part) => part[0]).join("").slice(0, 3)}</span><strong>{q.left.name}</strong>{pick && <small>{q.left.value} {q.left.label}</small>}</button><b>VS</b><button disabled={!!pick} onClick={() => answer(q.right.name)} className={pick ? (q.right.name === q.answer ? "correct" : pick === q.right.name ? "wrong" : "dim") : ""}><span className="player-initial">{q.right.name.split(" ").map((part) => part[0]).join("").slice(0, 3)}</span><strong>{q.right.name}</strong>{pick && <small>{q.right.value} {q.right.label}</small>}</button></div>{pick && <div className={pick === q.answer ? "feedback good" : "feedback bad"}>{pick === q.answer ? <Check /> : <X />}<strong>{pick === q.answer ? `BIG CALL! +${calculateScore("head-to-head", 1, 1, streak + 1)} XP` : `${q.answer.toUpperCase()} WINS THIS ONE`}</strong></div>}</section></main>;
}
