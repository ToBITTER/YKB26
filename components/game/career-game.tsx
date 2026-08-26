"use client";

import careers from "@/data/career-paths.generated.json";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, X } from "lucide-react";
import { useProgress } from "@/components/progress-provider";
import { calculateScore } from "@/lib/game";
import { selectUnseenCareers } from "@/lib/career-selection";
import type { Career, GameResult } from "@/types";
import { Result } from "./result";

export function CareerGame() {
  const [run, setRun] = useState(0);
  const { progress, historyReady, markQuestionsSeen } = useProgress();
  if (!historyReady) return <main className="game-shell"><p>Loading your unseen career paths…</p></main>;
  return <CareerRound key={run} seenIds={progress.seenQuestionIds} markSeen={markQuestionsSeen} again={() => setRun((value) => value + 1)} />;
}

function CareerRound({ again, seenIds, markSeen }: { again: () => void; seenIds: string[]; markSeen: (ids: string[]) => void }) {
  const [questions] = useState(() => selectUnseenCareers(careers as Career[], seenIds));
  const { complete } = useProgress();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const started = useRef(Date.now());
  const question = questions[index];

  useEffect(() => {
    if (questions.length === 20) markSeen(questions.map((item) => item.id));
    // Keep this randomly selected round fixed after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answer(name: string) {
    if (selected || !question) return;
    setSelected(name);
    const yes = name === question.answer;
    const nextStreak = yes ? streak + 1 : 0;
    const earned = yes ? calculateScore("career-path", 1, 1, nextStreak) : 0;
    window.setTimeout(() => {
      if (index === questions.length - 1) {
        const gameResult = { score: xp + earned, xp: xp + earned, correct: correct + (yes ? 1 : 0), total: questions.length, bestStreak: Math.max(best, nextStreak), elapsed: Math.round((Date.now() - started.current) / 1000), mode: "Career Path" };
        complete(gameResult, "Career Path");
        setResult(gameResult);
      } else {
        setIndex((value) => value + 1);
        setSelected(null);
        if (yes) {
          setCorrect((value) => value + 1);
          setXp((value) => value + earned);
          setStreak(nextStreak);
          setBest((value) => Math.max(value, nextStreak));
        } else setStreak(0);
      }
    }, 1000);
  }

  if (result) return <main className="game-shell"><Result result={result} onAgain={again} /></main>;
  if (questions.length < 20 || !question) return <main className="game-shell"><section className="question-card"><div className="mode-label">CAREER PATH</div><h1>WE COULDN’T BUILD THIS ROUND.</h1><p>Please refresh and try again.</p></section></main>;
  return <main className="game-shell"><header className="game-hud"><div><span>PATH</span><strong>{index + 1}<i>/{questions.length}</i></strong></div><div className="hud-progress"><i style={{ width: `${index / questions.length * 100}%` }} /></div><div><strong>{xp} XP</strong></div></header><section className="question-card"><div className="mode-label">CAREER PATH · 20 QUESTIONS</div><h1>WHO MADE THIS JOURNEY?</h1><div className="career-path">{question.clubs.map((club, clubIndex) => <div key={`${club}-${clubIndex}`}><span>{club.slice(0, 3).toUpperCase()}</span><strong>{club}</strong>{clubIndex < question.clubs.length - 1 && <ArrowDown />}</div>)}</div><div className="answers two">{question.choices.map((choice) => <button key={choice} disabled={!!selected} onClick={() => answer(choice)} className={selected ? choice === question.answer ? "correct" : choice === selected ? "wrong" : "dim" : ""}>{choice}{selected && choice === question.answer ? <Check /> : selected === choice ? <X /> : null}</button>)}</div>{selected && <div className={selected === question.answer ? "feedback good" : "feedback bad"}><strong>{selected === question.answer ? `CORRECT · +${calculateScore("career-path", 1, 1, streak + 1)} XP` : `THE PLAYER WAS ${question.answer.toUpperCase()}`}</strong><span>{question.nationality} · {question.position}</span></div>}</section></main>;
}
