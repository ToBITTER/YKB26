"use client";

import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import styles from "./qetsiyah.module.css";

const notes = [
  "This little corner of the internet was made with you in mind.",
  "May every question remind you just how brilliant you are.",
  "Your smile deserves its own leaderboard—and you would still be number one.",
  "No pressure here. Just play, enjoy yourself and keep being wonderful.",
  "You make ordinary things feel special. This room should feel special too.",
  "A tiny reminder from your game room: you are deeply appreciated.",
];

export function LovingNote() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  function reveal() {
    if (open) setIndex((value) => (value + 1) % notes.length);
    setOpen(true);
  }

  return <section className={`${styles.loveNote} ${open ? styles.open : ""}`}><div className={styles.noteHearts} aria-hidden="true"><Heart fill="currentColor" /><Heart fill="currentColor" /><Sparkles /></div><span>A LITTLE NOTE FOR QETSIYAH</span>{open ? <><p>{notes[index]}</p><button type="button" onClick={reveal}><Sparkles />SHOW ME ANOTHER</button></> : <><p>There’s something sweet waiting inside.</p><button type="button" onClick={reveal}><Heart fill="currentColor" />OPEN YOUR NOTE</button></>}</section>;
}
