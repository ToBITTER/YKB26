"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, Copy, RotateCcw, Share2, Swords, Trophy, X, Zap } from "lucide-react";

type Question = { id: string; prompt: string; choices: string[]; category: string; kind: string };
type Player = { username: string | null; index: number; score: number; correct: number };
type Match = { code: string; status: "WAITING" | "ACTIVE" | "COMPLETE"; side: "host" | "guest"; me: Player; opponent: Player; question: Question | null; total: number; xpEarned: number };
type Feedback = { choice: string | null; correct: boolean; correctAnswer: string; points: number };
const SECONDS = 10;

export function FaceOffGame({ code }: { code: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(SECONDS);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [notice, setNotice] = useState("");
  const joining = useRef(false), answering = useRef(false), questionId = useRef("");
  const router = useRouter();

  const load = useCallback(async () => {
    const response = await fetch(`/api/face-off/${code}`, { cache: "no-store" });
    const payload = await response.json();
    if (response.status === 401) return router.push(`/account?next=/play/face-off/${code}`);
    if (response.status === 403 && payload.joinable && !joining.current) {
      joining.current = true;
      const joined = await fetch("/api/face-off", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "join", code }) });
      if (joined.ok) { joining.current = false; return load(); }
      const failed = await joined.json(); setError(failed.error ?? "Could not join this room."); return;
    }
    if (!response.ok) return setError(payload.error ?? "Could not load this Face-Off.");
    setError(""); setMatch(payload);
  }, [code, router]);

  useEffect(() => { load(); const poll = window.setInterval(load, 1600); return () => window.clearInterval(poll); }, [load]);
  useEffect(() => {
    if (!match?.question || match.status !== "ACTIVE" || feedback) return;
    if (questionId.current !== match.question.id) { questionId.current = match.question.id; setSeconds(SECONDS); answering.current = false; }
    const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { window.clearInterval(timer); void answer(null); return 0; } return value - 1; }), 1000);
    return () => window.clearInterval(timer);
  }, [match?.question?.id, match?.status, feedback]);

  async function answer(choice: string | null) {
    if (!match?.question || answering.current) return;
    answering.current = true;
    const response = await fetch(`/api/face-off/${code}/answer`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ index: match.me.index, choice }) });
    const payload = await response.json();
    if (!response.ok) { answering.current = false; await load(); return; }
    setFeedback({ choice, correct: payload.correct, correctAnswer: payload.correctAnswer, points: payload.points });
    window.setTimeout(async () => { setFeedback(null); await load(); }, 1050);
  }

  async function share() {
    const url = window.location.href, data = { title: "BALLER Face-Off", text: `I’m calling you out on BALLER. Join my Face-Off room ${code}.`, url };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(url); setNotice("INVITE LINK COPIED"); } } catch { /* sharing was dismissed */ }
  }
  async function copyCode() { await navigator.clipboard.writeText(code); setNotice("ROOM CODE COPIED"); window.setTimeout(() => setNotice(""), 1800); }
  async function rematch() { const response = await fetch("/api/face-off", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create" }) }); const payload = await response.json(); if (response.ok) router.push(`/play/face-off/${payload.code}`); }

  if (error) return <main className="game-shell"><section className="question-card"><div className="mode-label">FACE-OFF ERROR</div><h1>{error}</h1><div className="result-actions"><Link href="/play/face-off">BACK TO FACE-OFF</Link></div></section></main>;
  if (!match) return <main className="game-shell"><p>Opening Face-Off room…</p></main>;
  if (match.status === "WAITING") return <main className="game-shell"><section className="face-waiting"><Swords /><span>PRIVATE FACE-OFF</span><h1>ROOM<br />{code}</h1><p>You’re in. Send this code or invite link to one opponent. The match starts automatically when they arrive.</p><button className="room-code" onClick={copyCode}>{code}<Copy /></button><button className="primary" onClick={share}><Share2 />SHARE INVITE</button>{notice && <b className="face-notice">{notice}</b>}<div className="waiting-pulse"><i /><span>WAITING FOR OPPONENT…</span></div><Link href="/play/face-off">LEAVE ROOM</Link></section></main>;

  if (match.status === "COMPLETE") {
    const won = match.me.score > match.opponent.score, tied = match.me.score === match.opponent.score;
    return <main className="game-shell"><section className={`face-result ${won ? "won" : ""}`}><Trophy /><span>FACE-OFF COMPLETE</span><h1>{tied ? "DRAW GAME." : won ? "YOU OWNED IT." : "THEY GOT YOU."}</h1><div className="face-scoreboard"><div><small>YOU</small><b>{match.me.username}</b><strong>{match.me.score}</strong><span>{match.me.correct}/{match.total} correct</span></div><em>—</em><div><small>OPPONENT</small><b>{match.opponent.username}</b><strong>{match.opponent.score}</strong><span>{match.opponent.correct}/{match.total} correct</span></div></div><p>+{match.xpEarned} XP added to your BALLER profile.</p><div className="result-actions"><button className="primary" onClick={rematch}><RotateCcw />NEW FACE-OFF</button><Link href="/play">ALL GAMES</Link></div></section></main>;
  }

  if (!match.question) return <main className="game-shell"><section className="face-finished-wait"><Check /><h1>YOU’RE DONE.</h1><p>Your opponent is on question {Math.min(match.opponent.index + 1, match.total)} of {match.total}. Their score updates live.</p><div className="face-scoreboard compact"><div><b>YOU</b><strong>{match.me.score}</strong></div><em>—</em><div><b>{match.opponent.username}</b><strong>{match.opponent.score}</strong></div></div><div className="waiting-pulse"><i /><span>WAITING FOR FINAL WHISTLE…</span></div></section></main>;

  return <main className="game-shell">
    <header className="face-hud"><div><span>QUESTION</span><strong>{match.me.index + 1}<i>/{match.total}</i></strong></div><div className="face-player you"><span>YOU · {match.me.username}</span><b>{match.me.score}</b></div><Swords /><div className="face-player"><span>{match.opponent.username ?? "OPPONENT"} · Q{Math.min(match.opponent.index + 1, match.total)}</span><b>{match.opponent.score}</b></div></header>
    <div className="face-progress"><i style={{ width: `${(match.me.index / match.total) * 100}%` }} /></div>
    <section className="question-card"><div className="mode-label">LIVE FACE-OFF · {match.question.category}</div><div className={`face-timer ${seconds <= 3 ? "urgent" : ""}`}><Clock3 /><strong>{seconds}</strong><span>SECONDS</span></div><h1>{match.question.prompt}</h1><div className="answers">{match.question.choices.map((choice) => <button key={choice} disabled={!!feedback} onClick={() => answer(choice)} className={feedback ? (choice === feedback.correctAnswer ? "correct" : choice === feedback.choice ? "wrong" : "dim") : ""}><span>{choice}</span>{feedback && choice === feedback.correctAnswer ? <Check /> : feedback?.choice === choice ? <X /> : null}</button>)}</div>{feedback && <div className={feedback.correct ? "feedback good" : "feedback bad"}>{feedback.correct ? <Check /> : <X />}<div><strong>{feedback.correct ? `GOAL! +${feedback.points} POINTS` : feedback.choice === null ? "TIME’S UP!" : "MISSED IT."}</strong><span>The answer is {feedback.correctAnswer}.</span></div></div>}</section>
  </main>;
}
