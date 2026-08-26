"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { calculateScore } from "@/lib/game";
import type { QetsiyahQuestion } from "@/lib/qetsiyah-selection";
import type { GameResult } from "@/types";
import { Result } from "./result";
import styles from "./qetsiyah-game.module.css";

export function QetsiyahGame({ category }: { category: string }) {
  const [run, setRun] = useState(0);
  return <Round key={run} category={category} again={() => setRun((value) => value + 1)} />;
}

function Round({ category, again }: { category: string; again: () => void }) {
  const { progress, markQuestionsSeen, complete } = useProgress();
  const [questions, setQuestions] = useState<QetsiyahQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(10);
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const started = useRef(Date.now());
  const question = questions?.[index];

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/qetsiyah/round", { method: "POST", headers: { "content-type": "application/json" }, signal: controller.signal, body: JSON.stringify({ category, seenIds: progress.seenQuestionIds }) })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Quiz unavailable")))
      .then(({ questions: selected }: { questions: QetsiyahQuestion[] }) => { setQuestions(selected); if (selected.length === 20) markQuestionsSeen(selected.map((item) => item.id)); })
      .catch((error) => { if (error.name !== "AbortError") setQuestions([]); });
    return () => controller.abort();
    // Fetch exactly once for this mounted round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (picked !== undefined || result || !question) return;
    if (seconds === 0) { answer(null); return; }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
    // answer uses the current question and score state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, picked, result, question]);

  function answer(choice: string | null) {
    if (picked !== undefined || !question) return;
    setPicked(choice);
    const yes = choice === question.answer;
    const nextStreak = yes ? streak + 1 : 0;
    const earned = yes ? calculateScore("qetsiyah", 1, 1, nextStreak) : 0;
    window.setTimeout(() => {
      if (index === questions!.length - 1) {
        const gameResult = { score: xp + earned, xp: xp + earned, correct: correct + (yes ? 1 : 0), total: questions!.length, bestStreak: Math.max(best, nextStreak), elapsed: Math.round((Date.now() - started.current) / 1000), mode: `Qetsiyah · ${category}` };
        complete(gameResult, `Qetsiyah ${category}`);
        setResult(gameResult);
      } else {
        setIndex((value) => value + 1);
        setSeconds(10);
        setPicked(undefined);
        if (yes) {
          setCorrect((value) => value + 1);
          setStreak(nextStreak);
          setBest((value) => Math.max(value, nextStreak));
          setXp((value) => value + earned);
        } else setStreak(0);
      }
    }, 900);
  }

  if (result) return <div className={styles.shell}><Result result={result} onAgain={again} /></div>;
  if (questions === null) return <main className={styles.shell}><section className={styles.empty}><h1>GETTING YOUR QUESTIONS…</h1><p>Building a fresh round just for Qetsiyah.</p></section></main>;
  if (questions.length < 20) return <main className={styles.shell}><section className={styles.empty}><h1>CATEGORY COMPLETE.</h1><p>You have played every fresh question currently available in {category}.</p><Link href="/qetsiyah">BACK TO YOUR ROOM</Link></section></main>;
  if (!question) return <main className={styles.shell}><section className={styles.empty}><h1>ROUND COMPLETE.</h1><Link href="/qetsiyah">BACK TO YOUR ROOM</Link></section></main>;
  return <main className={styles.shell}><div className={styles.game}><header className={styles.hud}><div><span>QETSIYAH · {category.toUpperCase()}</span><strong>{index + 1}/20</strong></div><div className={styles.bar}><i style={{ width: `${seconds * 10}%` }} /></div><div className={styles.timer}><strong>{seconds}</strong></div></header><section className={styles.card}><div className={styles.label}>{question.category.toUpperCase()} · {question.difficulty.toUpperCase()} · {streak} STREAK</div><h1>{question.prompt}</h1><div className={styles.answers}>{question.choices.map((choice) => <button key={choice} disabled={picked !== undefined} onClick={() => answer(choice)} className={picked !== undefined ? choice === question.answer ? styles.correct : choice === picked ? styles.wrong : styles.dim : ""}>{choice}</button>)}</div>{picked !== undefined && <div className={styles.feedback}>{picked === question.answer ? `CORRECT · +${calculateScore("qetsiyah", 1, 1, streak + 1)} XP` : picked === null ? `TIME’S UP · ${question.answer}` : `THE ANSWER WAS ${question.answer}`}</div>}</section></div></main>;
}
