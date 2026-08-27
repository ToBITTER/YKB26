"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Swords, Timer, Users } from "lucide-react";

export function FaceOffLobby() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function room(action: "create" | "join") {
    setBusy(true); setError("");
    const response = await fetch("/api/face-off", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(action === "create" ? { action } : { action, code: code.trim().toUpperCase() }) });
    const payload = await response.json();
    setBusy(false);
    if (response.status === 401) return router.push("/account");
    if (!response.ok) return setError(payload.error ?? "Could not enter that room.");
    router.push(`/play/face-off/${payload.code}`);
  }

  return <main className="shell page face-lobby">
    <header className="page-head"><span>LIVE 1V1</span><h1>FACE<br />OFF.</h1><p>Create a private room, send the link to another baller and answer the same 20 questions head-to-head.</p></header>
    <section className="face-rules"><article><Users /><b>2 PLAYERS</b><span>One private room</span></article><article><Copy /><b>SHARE A CODE</b><span>Your opponent joins instantly</span></article><article><Timer /><b>10 SECONDS</b><span>For every question</span></article><article><Swords /><b>20 QUESTIONS</b><span>Highest score wins</span></article></section>
    <section className="face-lobby-actions">
      <div><span>HOST A MATCH</span><h2>CALL OUT A BALLER.</h2><p>We create the room and question set. Share the link when you get inside.</p><button className="primary" disabled={busy} onClick={() => room("create")}><Swords />CREATE FACE-OFF</button></div>
      <form onSubmit={(event: FormEvent) => { event.preventDefault(); room("join"); }}><span>GOT A CODE?</span><h2>JOIN THE ROOM.</h2><label>6-CHARACTER ROOM CODE<input value={code} onChange={(event) => setCode(event.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase())} placeholder="AB7K2P" required minLength={6} maxLength={6} /></label><button className="secondary" disabled={busy}>JOIN FACE-OFF</button></form>
    </section>
    {error && <div className="auth-error" role="alert">{error} <Link href="/account">Sign in</Link></div>}
  </main>;
}
