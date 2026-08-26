import Link from "next/link";
import { BookOpen, Clapperboard, Crown, Globe2, Heart, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { LovingNote } from "./loving-note";
import styles from "./qetsiyah.module.css";

const QETSIYAH_EMAIL = (process.env.QETSIYAH_EMAIL ?? "favouroyelade1@gmail.com").toLowerCase();

export const metadata = { title: "Qetsiyah’s Game Room" };

export default async function QetsiyahPage() {
  const user = await currentUser();
  if (!user) redirect("/account?next=/qetsiyah");
  if (user.email.toLowerCase() !== QETSIYAH_EMAIL) redirect("/");

  const stats = user.stats;
  return <main className={styles.room}><div className={styles.glow} /><div className={styles.floatingHearts} aria-hidden="true"><Heart fill="currentColor" /><Heart fill="currentColor" /><Heart fill="currentColor" /></div><section className={styles.hero}><div className={styles.crown}><Crown /></div><span className={styles.eyebrow}><Sparkles /> A LITTLE WORLD MADE JUST FOR YOU</span><h1>WELCOME HOME,<br /><em>QETSIYAH.</em></h1><p>This is your soft place to play, learn, smile and be completely yourself. Every detail here was chosen with you in mind.</p><div className={styles.identity}><Heart fill="currentColor" /><div><small>THE ONE &amp; ONLY</small><strong>QETSIYAH</strong></div><span>ONE OF ONE</span></div><div className={styles.personalStats}><div><strong>{stats?.xp.toLocaleString() ?? "0"}</strong><span>YOUR XP</span></div><div><strong>{stats?.gamesPlayed ?? 0}</strong><span>GAMES PLAYED</span></div><div><strong>{stats?.bestStreak ?? 0}</strong><span>BEST STREAK</span></div></div></section><LovingNote /><section className={styles.games}><header><span>QETSIYAH’S GAME ROOM · 2,000 QUESTIONS</span><h2>PICK WHATEVER FEELS FUN.</h2><p>No pressure, no competition—just your moment.</p></header><div className={styles.grid}><Link href="/qetsiyah/play"><b>01</b><Sparkles /><strong>THE QETSIYAH MIX</strong><span>A little bit of everything, chosen especially for you.</span></Link><Link href="/qetsiyah/play?category=Pop%20Culture"><b>02</b><Clapperboard /><strong>POP CULTURE</strong><span>Film, television, music, books and all the fun stuff.</span></Link><Link href="/qetsiyah/play?category=History"><b>03</b><BookOpen /><strong>HISTORY</strong><span>Stories, people and moments that shaped our world.</span></Link><Link href="/qetsiyah/play?category=General%20Knowledge"><b>04</b><Globe2 /><strong>GENERAL KNOWLEDGE</strong><span>For the curious, clever mind that brought you here.</span></Link></div></section><footer className={styles.note}><Heart fill="currentColor" /><span>Made for Qetsiyah. No one else gets a room quite like this.</span></footer></main>;
}
