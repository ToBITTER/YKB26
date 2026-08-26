"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import styles from "./qetsiyah-nav.module.css";

export function QetsiyahNav() {
  const pathname = usePathname();
  const inGame = pathname.startsWith("/qetsiyah/play");
  return <nav className={styles.nav} aria-label="Qetsiyah navigation"><Link className={styles.back} href={inGame ? "/qetsiyah" : "/"}><ArrowLeft /><span>{inGame ? "BACK TO YOUR ROOM" : "BACK TO BALLER"}</span></Link><Link className={styles.brand} href="/qetsiyah"><Heart fill="currentColor" /><strong>QETSIYAH’S</strong><span>PRIVATE ROOM</span></Link><div className={styles.one}>ONE OF ONE</div></nav>;
}
