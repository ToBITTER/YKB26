"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock3, Lightbulb, X, Zap } from "lucide-react";
import type { GameResult, Mode, QuizQuestion } from "@/types";
import { calculateScore } from "@/lib/game";
import { useProgress } from "@/components/progress-provider";
import { Result } from "./result";

const QUESTIONS_PER_SESSION = 20;
const SECONDS_PER_QUESTION = 10;
const TIMEOUT = "__timeout__";

export function QuizGame({ mode = "whos-that-baller", daily = false, category, competition }: { mode?: Mode; daily?: boolean; category?: string; competition?: string }) {
  const { progress, historyReady, markQuestionsSeen } = useProgress();
  const [run, setRun] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!historyReady) return;
    const controller = new AbortController();
    setLoadError(false);
    fetch("/api/questions/round", { method: "POST", headers: { "content-type": "application/json" }, signal: controller.signal, body: JSON.stringify({ mode, daily, category, competition, seenIds: progress.seenQuestionIds }) })
      .then(async (response) => { if (!response.ok) throw new Error("Round request failed"); return response.json(); })
      .then(({ questions: next }: { questions: QuizQuestion[] }) => { setQuestions(next); if (next.length) markQuestionsSeen(next.map((question) => question.id)); })
      .catch((error) => { if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true); });
    return () => controller.abort();
  }, [category, competition, daily, historyReady, mode, run]);

  if (loadError) return <main className="game-shell"><section className="question-card"><div className="mode-label">CONNECTION ERROR</div><h1>WE COULDN’T LOAD THIS ROUND.</h1><button className="primary" onClick={() => { setQuestions(null); setRun((value) => value + 1); }}>TRY AGAIN</button></section></main>;
  if (!historyReady || questions === null) return <main className="game-shell"><p>Loading your unseen questions…</p></main>;
  if (questions.length < (daily ? 1 : QUESTIONS_PER_SESSION)) return <main className="game-shell"><section className="question-card"><div className="mode-label">ROUND UNAVAILABLE</div><h1>WE COULDN’T BUILD 20 QUESTIONS.</h1><p>Please choose another category or try again shortly.</p><button className="primary" onClick={() => { setQuestions(null); setRun((value) => value + 1); }}>TRY AGAIN</button></section></main>;
  return <QuizRound key={run} questions={questions} mode={mode} daily={daily} again={() => { setQuestions(null); setRun((value) => value + 1); }} />;
}

function QuizRound({ questions, mode, daily, again }: { questions: QuizQuestion[]; mode: Mode; daily: boolean; again: () => void }) {
  const { complete } = useProgress();
  const [index, setIndex] = useState(0);
  const [clue, setClue] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [result, setResult] = useState<GameResult | null>(null);
  const started = useRef(Date.now());
  const locked = useRef(false);
  const q = questions[index];

  function answer(choice: string | null) {
    if (locked.current || !q) return;
    locked.current = true;
    const timedOut = choice === null;
    setSelected(timedOut ? TIMEOUT : choice);
    const yes = choice === q.answer;
    const nextStreak = yes ? streak + 1 : 0;
    const earned = yes ? calculateScore(mode, 1, 1, nextStreak, clue) : 0;
    if (yes) {
      setCorrect((value) => value + 1);
      setStreak(nextStreak);
      setBest((value) => Math.max(value, nextStreak));
      setXp((value) => value + earned);
    } else {
      setStreak(0);
    }

    window.setTimeout(() => {
      const done = index === questions.length - 1;
      if (done) {
        const gameResult = {
          score: xp + earned,
          xp: xp + earned,
          correct: correct + (yes ? 1 : 0),
          total: questions.length,
          bestStreak: Math.max(best, nextStreak),
          elapsed: Math.round((Date.now() - started.current) / 1000),
          mode: daily ? "Daily Baller" : mode,
        };
        complete(gameResult, q.category, daily);
        setResult(gameResult);
      } else {
        setIndex((value) => value + 1);
        setClue(0);
        setSelected(null);
        setSecondsLeft(SECONDS_PER_QUESTION);
        locked.current = false;
      }
    }, 1100);
  }

  useEffect(() => {
    if (selected || result) return;
    const deadline = Date.now() + SECONDS_PER_QUESTION * 1000;
    setSecondsLeft(SECONDS_PER_QUESTION);
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(timer);
        answer(null);
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [index]);

  if (result) return <main className="game-shell"><Result result={result} onAgain={again} /></main>;
  if (!q) return <main className="game-shell"><p>No questions are available for this mode yet.</p></main>;
  const timedOut = selected === TIMEOUT;

  return <main className="game-shell">
    <header className="game-hud timed-hud">
      <div><span>QUESTION</span><strong>{index + 1}<i>/{questions.length}</i></strong></div>
      <div className="hud-progress"><i style={{ width: `${(index / questions.length) * 100}%` }} /></div>
      <div className={`question-timer ${secondsLeft <= 3 ? "urgent" : ""}`} aria-label={`${secondsLeft} seconds remaining`}>
        <Clock3 /><strong>{secondsLeft}</strong><span>SEC</span>
      </div>
      <div><Zap /><strong>{xp}</strong></div>
    </header>
    <div className="timer-track"><motion.i animate={{ width: `${(secondsLeft / SECONDS_PER_QUESTION) * 100}%` }} transition={{ duration: .2, ease: "linear" }} /></div>
    <section className="question-card">
      <div className="mode-label">{daily ? "DAILY BALLER" : mode.replaceAll("-", " ")} · 10 SECONDS</div>
      <h1>{q.prompt}</h1>
      {q.clues && <div className="clues">
        {q.clues.slice(0, clue + 1).map((item, i) => <motion.div key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}><span>CLUE {i + 1}</span><strong>{item}</strong></motion.div>)}
        {clue < q.clues.length - 1 && !selected && <button onClick={() => setClue((value) => value + 1)}><Lightbulb />REVEAL CLUE <small>-2 potential XP</small></button>}
      </div>}
      <div className="answers">{q.choices.map((choice) => <button key={choice} disabled={!!selected} onClick={() => answer(choice)} className={selected ? (choice === q.answer ? "correct" : choice === selected ? "wrong" : "dim") : ""}><span>{choice}</span>{selected && choice === q.answer ? <Check /> : selected === choice ? <X /> : null}</button>)}</div>
      <AnimatePresence>{selected && <motion.div className={selected === q.answer ? "feedback good" : "feedback bad"} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {selected === q.answer ? <><Check /><div><strong>THAT’S BALL KNOWLEDGE! +{calculateScore(mode, 1, 1, streak + 1, clue)} XP</strong><span>{q.explanation}</span></div></> : <><X /><div><strong>{timedOut ? "TIME’S UP!" : "NOT QUITE."} IT’S {q.answer.toUpperCase()}.</strong><span>{q.explanation}</span></div></>}
      </motion.div>}</AnimatePresence>
    </section>
  </main>;
}
