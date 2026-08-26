import Link from "next/link";
import { Crown, Heart, Sparkles, Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import styles from "./qetsiyah.module.css";

const QETSIYAH_EMAIL = (process.env.QETSIYAH_EMAIL ?? "favouroyelade1@gmail.com").toLowerCase();

export const metadata = { title: "Qetsiyah’s Game Room" };

export default async function QetsiyahPage() {
  const user = await currentUser();
  if (!user) redirect("/account?next=/qetsiyah");
  if (user.email.toLowerCase() !== QETSIYAH_EMAIL) redirect("/");

  return <main className={styles.room}><div className={styles.glow} /><section className={styles.hero}><div className={styles.crown}><Crown /></div><span className={styles.eyebrow}><Sparkles /> MADE FOR ONE PLAYER</span><h1>WELCOME,<br /><em>QETSIYAH.</em></h1><p>Your own corner of BALLER—softer colours, special energy and challenges picked for you.</p><div className={styles.identity}><Heart fill="currentColor" /><div><small>PRIVATE PLAYER</small><strong>QETSIYAH</strong></div><span>ONE OF ONE</span></div></section><section className={styles.games}><header><span>YOUR GAME ROOM</span><h2>WHAT ARE WE PLAYING?</h2></header><div className={styles.grid}><Link href="/play/whos-that-baller"><b>01</b><Sparkles /><strong>WHO’S THAT BALLER?</strong><span>Read the clues. Name the star.</span></Link><Link href="/play/connections"><b>02</b><Heart /><strong>FOOTBALL CONNECTIONS</strong><span>Find the four hidden groups.</span></Link><Link href="/play/head-to-head"><b>03</b><Trophy /><strong>HEAD-TO-HEAD</strong><span>Back your football knowledge.</span></Link><Link href="/daily"><b>04</b><Crown /><strong>DAILY BALLER</strong><span>Keep your personal streak alive.</span></Link></div></section><footer className={styles.note}><Heart fill="currentColor" /><span>This room only opens for {user.email}.</span></footer></main>;
}
