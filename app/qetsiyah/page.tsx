import Link from "next/link";
import { BookOpen, Clapperboard, Crown, Globe2, Heart, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import styles from "./qetsiyah.module.css";

const QETSIYAH_EMAIL = (process.env.QETSIYAH_EMAIL ?? "favouroyelade1@gmail.com").toLowerCase();

export const metadata = { title: "Qetsiyah’s Game Room" };

export default async function QetsiyahPage() {
  const user = await currentUser();
  if (!user) redirect("/account?next=/qetsiyah");
  if (user.email.toLowerCase() !== QETSIYAH_EMAIL) redirect("/");

  return <main className={styles.room}><div className={styles.glow} /><section className={styles.hero}><div className={styles.crown}><Crown /></div><span className={styles.eyebrow}><Sparkles /> MADE FOR ONE PLAYER</span><h1>WELCOME,<br /><em>QETSIYAH.</em></h1><p>Your own 2,000-question universe of pop culture, history and general knowledge.</p><div className={styles.identity}><Heart fill="currentColor" /><div><small>PRIVATE PLAYER</small><strong>QETSIYAH</strong></div><span>ONE OF ONE</span></div></section><section className={styles.games}><header><span>YOUR GAME ROOM · 2,000 QUESTIONS</span><h2>CHOOSE YOUR WORLD.</h2></header><div className={styles.grid}><Link href="/qetsiyah/play"><b>01</b><Sparkles /><strong>THE QETSIYAH MIX</strong><span>All three worlds in one 20-question round.</span></Link><Link href="/qetsiyah/play?category=Pop%20Culture"><b>02</b><Clapperboard /><strong>POP CULTURE</strong><span>Film, television, music, books and celebrity culture.</span></Link><Link href="/qetsiyah/play?category=History"><b>03</b><BookOpen /><strong>HISTORY</strong><span>People, places and moments that shaped the world.</span></Link><Link href="/qetsiyah/play?category=General%20Knowledge"><b>04</b><Globe2 /><strong>GENERAL KNOWLEDGE</strong><span>Science, geography, nature and everything between.</span></Link></div></section><footer className={styles.note}><Heart fill="currentColor" /><span>Private to {user.email} · Trivia data from Open Trivia DB (CC BY-SA 4.0).</span></footer></main>;
}
