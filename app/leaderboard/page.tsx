"use client";

import { useEffect, useState } from "react";
import { Medal } from "lucide-react";
import { getLevelFromXP } from "@/lib/game";

type Scope = "GLOBAL" | "WEEKLY" | "COUNTRY";
type Row = { rank: number; id: string; username: string; country: string; xp: number; gamesPlayed: number; correct: number; answers: number; isYou: boolean };

export default function Leaderboard() {
  const [tab, setTab] = useState<Scope>("GLOBAL");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setRows(null);
    setError("");
    fetch(`/api/leaderboard?scope=${tab}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Leaderboard unavailable");
        return response.json();
      })
      .then((payload) => setRows(payload.rows))
      .catch((reason) => { if (reason.name !== "AbortError") setError("Could not load the table. Please try again."); });
    return () => controller.abort();
  }, [tab]);

  return <main className="shell page"><header className="page-head"><span>THE TABLE</span><h1>LEADERBOARD.</h1><p>Real ranked players from the BALLER database. Complete games while signed in to climb.</p></header><div className="tabs">{(["GLOBAL", "WEEKLY", "COUNTRY"] as Scope[]).map((scope) => <button className={tab === scope ? "active" : ""} onClick={() => setTab(scope)} key={scope}>{scope}</button>)}</div><section className="leaderboard"><div className="leader-head"><span>RANK</span><span>PLAYER</span><span>LEVEL</span><span>XP</span></div>{rows?.map((row) => <article className={row.isYou ? "you" : ""} key={row.id}><strong>#{row.rank}</strong><div className="avatar">{row.username.slice(0, 2).toUpperCase()}</div><div><b>{row.username}</b><small>{row.isYou ? "YOU · " : ""}{row.country} · {row.gamesPlayed} GAMES</small></div><span>LVL {getLevelFromXP(row.xp)}</span><strong>{row.xp.toLocaleString()} XP</strong></article>)}{rows === null && !error && <div className="honest-empty"><strong>LOADING THE TABLE…</strong></div>}{error && <div className="honest-empty"><Medal /><strong>TABLE UNAVAILABLE.</strong><p>{error}</p></div>}{rows?.length === 0 && <div className="honest-empty"><Medal /><strong>NO RANKED PLAYERS YET.</strong><p>{tab === "COUNTRY" ? "Sign in and complete a game to start your country table." : "Be the first signed-in player to complete a game."}</p></div>}</section></main>;
}
