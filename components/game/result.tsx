"use client";

import Link from "next/link";
import { Check, Home, LoaderCircle, RotateCcw, Share2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { GameResult } from "@/types";
import { useProgress } from "@/components/progress-provider";
import { createResultGraphic } from "@/lib/result-card";
import { useState } from "react";

type ShareState = "idle" | "working" | "shared" | "saved" | "error";

export function Result({ result, onAgain }: { result: GameResult; onAgain: () => void }) {
  const { progress } = useProgress();
  const [shareState, setShareState] = useState<ShareState>("idle");

  async function share() {
    if (shareState === "working") return;
    setShareState("working");
    const playUrl = window.location.href.split("#")[0];
    const accuracy = Math.round((result.correct / Math.max(1, result.total)) * 100);
    const text = `I scored ${result.correct}/${result.total} (${accuracy}%) on BALLER. Think you know ball? Beat my score.`;

    try {
      const graphic = await createResultGraphic(result, playUrl, progress.username);
      const shareData: ShareData = { title: "My BALLER result", text, url: playUrl, files: [graphic] };
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [graphic] }))) {
        await navigator.share(shareData);
        setShareState("shared");
        return;
      }
      const downloadUrl = URL.createObjectURL(graphic);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "baller-result.png";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      await navigator.clipboard.writeText(`${text}\n${playUrl}`);
      setShareState("saved");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareState("idle");
      } else {
        console.error("result_share_failed", error);
        setShareState("error");
      }
    }
  }

  const shareLabel = shareState === "working" ? "CREATING GRAPHIC" : shareState === "shared" ? "SHARED" : shareState === "saved" ? "IMAGE SAVED · LINK COPIED" : shareState === "error" ? "TRY AGAIN" : "SHARE RESULT";

  return <motion.section className="result" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }}>
    <span>MATCH COMPLETE</span>
    <h1>{result.correct === result.total ? "PERFECT GAME" : "FULL TIME"}</h1>
    <div className="xp-burst"><Zap /><strong>+{result.xp}</strong><span>XP EARNED</span></div>
    <div className="result-stats">
      <div><strong>{result.correct}/{result.total}</strong><span>CORRECT</span></div>
      <div><strong>{Math.round(result.correct / Math.max(1, result.total) * 100)}%</strong><span>ACCURACY</span></div>
      <div><strong>{result.bestStreak}</strong><span>BEST STREAK</span></div>
      <div><strong>{result.elapsed}s</strong><span>TIME</span></div>
    </div>
    <p>Share your branded match card. The play link takes friends directly into this challenge.</p>
    <div className="result-actions">
      <button className="primary" onClick={onAgain}><RotateCcw />PLAY AGAIN</button>
      <button className="secondary" onClick={share} disabled={shareState === "working"}>{shareState === "working" ? <LoaderCircle className="share-spinner" /> : shareState === "shared" || shareState === "saved" ? <Check /> : <Share2 />}{shareLabel}</button>
      <Link href="/"><Home />HOME</Link>
    </div>
  </motion.section>;
}
