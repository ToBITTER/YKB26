"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, LogIn, LogOut, ShieldCheck, UserPlus } from "lucide-react";

type User = { id: string; email: string; username: string; country: string };
const QETSIYAH_EMAIL = "favouroyelade1@gmail.com";

export default function Account() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => { fetch("/api/auth/me").then((response) => response.json()).then((payload) => setUser(payload.user)).catch(() => setUser(null)); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) return setError(payload.error ?? "Something went wrong.");
    setUser(payload.user);
    if (payload.user.email.toLowerCase() === QETSIYAH_EMAIL) router.push("/qetsiyah");
  }

  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); }
  if (user === undefined) return <main className="shell page"><div className="auth-loading">Checking your session…</div></main>;
  const isQetsiyah = user?.email.toLowerCase() === QETSIYAH_EMAIL;
  return <main className="shell page"><header className="page-head"><span>YOUR BALLER ID</span><h1>{isQetsiyah ? <>WELCOME,<br />QETSIYAH.</> : user ? "SIGNED IN." : <>SAVE YOUR<br />PROGRESS.</>}</h1><p>{isQetsiyah ? "Your private game room is ready for you." : user ? "Your account is protected by a database-backed session." : "Guest play stays available. Create an account when you want a persistent identity."}</p></header>{user ? <section className="account-card"><ShieldCheck /><span>AUTHENTICATED PLAYER</span><h2>{isQetsiyah ? "Qetsiyah" : user.username}</h2><p>{user.email}</p>{isQetsiyah && <Link className="qetsiyah-entry" href="/qetsiyah"><Crown />ENTER YOUR GAME ROOM</Link>}<button onClick={logout}><LogOut />SIGN OUT</button></section> : <section className="auth-layout"><div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}><LogIn />SIGN IN</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}><UserPlus />CREATE ACCOUNT</button></div><form className="auth-form" onSubmit={submit}>{mode === "register" && <label>USERNAME<input name="username" required minLength={3} maxLength={24} autoComplete="username" placeholder="Your baller name" /></label>}<label>EMAIL<input name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label><label>PASSWORD<input name="password" required type="password" minLength={mode === "register" ? 10 : 1} maxLength={72} autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder={mode === "register" ? "At least 10 characters" : "Your password"} /></label>{error && <div className="auth-error" role="alert">{error}</div>}<button className="primary" disabled={busy}>{busy ? "PLEASE WAIT…" : mode === "login" ? "SIGN IN" : "CREATE BALLER ID"}</button><small>Passwords are one-way hashed. BALLER never stores or displays your original password.</small></form></section>}</main>;
}
