"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock3, Lightbulb, X, Zap } from "lucide-react";
import curatedQuestions from "@/data/questions.json";
import generatedQuestions from "@/data/questions.generated.json";
import clubs from "@/data/clubs.generated.json";
import type { GameResult, Mode, QuizQuestion } from "@/types";
import { calculateScore, dailyIndex } from "@/lib/game";
import { selectUnseenQuestionSet } from "@/lib/question-selection";
import { useProgress } from "@/components/progress-provider";
import { Result } from "./result";

const QUESTIONS_PER_SESSION = 20;
const SECONDS_PER_QUESTION = 10;
const TIMEOUT = "__timeout__";

export function QuizGame({ mode = "whos-that-baller", daily = false, category, competition }: { mode?: Mode; daily?: boolean; category?: string; competition?: string }) {
  const { progress, historyReady, markQuestionsSeen } = useProgress();
  const [run, setRun] = useState(0);
  const questions = useMemo(() => {
    const generated = generatedQuestions as QuizQuestion[];
    const curated = curatedQuestions as QuizQuestion[];
    const nigerianRecords = new Set(generated.filter((q) => (q.kind === "nationality" || q.kind === "birth-country") && q.answer.toLowerCase() === "nigeria").map((q) => q.sourceRecordId));
    const fullBank = mode === "nigeria"
      ? [...curated.filter((q) => q.mode === "nigeria"), ...generated.filter((q) => nigerianRecords.has(q.sourceRecordId))]
      : generated;
    const league = competition?.toLowerCase();
    const leagueClubs = league ? clubs.filter((club) => club.league.toLowerCase() === league).map((club) => club.name.toLowerCase()) : [];
    const filtered = category
      ? fullBank.filter((q) => q.category.toLowerCase() === category.toLowerCase())
      : leagueClubs.length ? fullBank.filter((q) => leagueClubs.includes(q.category.toLowerCase())) : fullBank;
    const seen = new Set(progress.seenQuestionIds);
    const bank = filtered.filter((q) => !seen.has(q.id));
    if (daily) {
      const today = new Date().toISOString().slice(0, 10);
      return bank.length ? [bank[dailyIndex(today, bank.length)]!] : [];
    }
    return selectUnseenQuestionSet(filtered, progress.seenQuestionIds, QUESTIONS_PER_SESSION);
  }, [category, competition, daily, historyReady, mode, run]);

  useEffect(() => {
    if (historyReady && questions.length) markQuestionsSeen(questions.map((question) => question.id));
  }, [historyReady, questions]);

  if (!historyReady) return <main className="game-shell"><p>Loading your unseen questions…</p></main>;
  if (questions.length < (daily ? 1 : QUESTIONS_PER_SESSION)) return <main className="game-shell"><section className="question-card"><div className="mode-label">CATEGORY COMPLETE</div><h1>YOU’VE CLEARED THIS 20-QUESTION CATEGORY.</h1><p>We will never recycle questions you have already seen. Choose another club or competition while fresh verified questions are added.</p></section></main>;
  return <QuizRound key={run} questions={questions} mode={mode} daily={daily} again={() => setRun((value) => value + 1)} />;
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
