"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { GameResult, Progress } from "@/types";
import { DEFAULT_PROGRESS, updateProgress } from "@/lib/game";

type Context = {
  progress: Progress;
  historyReady: boolean;
  complete: (result: GameResult, category?: string, daily?: boolean) => Progress;
  rename: (name: string) => void;
  markQuestionsSeen: (ids: string[]) => void;
};

const ProgressContext = createContext<Context | null>(null);
const STORAGE_KEY = "baller-progress-v1";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [historyReady, setHistoryReady] = useState(false);

  useEffect(() => {
    let local = DEFAULT_PROGRESS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) local = { ...DEFAULT_PROGRESS, ...JSON.parse(stored), seenQuestionIds: JSON.parse(stored).seenQuestionIds ?? [] };
    } catch {}
    setProgress(local);
    fetch("/api/questions/seen", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { ids: [] })
      .then(({ ids }: { ids: string[] }) => {
        if (!ids.length) return;
        setProgress((current) => {
          const next = { ...current, seenQuestionIds: [...new Set([...current.seenQuestionIds, ...ids])] };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {})
      .finally(() => setHistoryReady(true));
  }, []);

  const persist = (next: Progress) => {
    setProgress(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo<Context>(() => ({
    progress,
    historyReady,
    complete: (result, category = "World", daily = false) => {
      const next = updateProgress(progress, result, category, daily);
      persist(next);
      return next;
    },
    rename: (username) => persist({ ...progress, username: username.trim().slice(0, 24) || "Guest Baller" }),
    markQuestionsSeen: (ids) => {
      const fresh = ids.filter((id) => !progress.seenQuestionIds.includes(id));
      if (!fresh.length) return;
      persist({ ...progress, seenQuestionIds: [...progress.seenQuestionIds, ...fresh] });
      void fetch("/api/questions/seen", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: fresh }) }).catch(() => {});
    },
  }), [historyReady, progress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("Progress provider missing");
  return value;
}
