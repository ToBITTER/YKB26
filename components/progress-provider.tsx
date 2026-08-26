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
    setHistoryReady(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : { user: null })
      .then(({ user }) => {
        if (!user) return;
        setProgress((current) => {
          const stats = user.stats ?? {};
          const next = { ...current, ...stats, username: user.username, country: user.country, lastDaily: stats.lastDaily?.slice(0, 10) ?? null, categoryScores: stats.categoryScores ?? {}, badges: stats.badges ?? [], seenQuestionIds: [...new Set([...current.seenQuestionIds, ...(stats.seenQuestionIds ?? [])])] };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {})
      .finally(() => window.clearTimeout(timeout));
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
      void fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ result, category, daily }) })
        .then((response) => response.ok ? response.json() : null)
        .then((payload) => {
          if (!payload?.progress) return;
          setProgress(payload.progress);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.progress));
        })
        .catch(() => {});
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
