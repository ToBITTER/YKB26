import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProgress } from "@/lib/game";
import type { Progress } from "@/types";

const schema = z.object({
  result: z.object({ score: z.number().finite().min(0).max(1000), xp: z.number().int().min(0).max(500), correct: z.number().int().min(0).max(20), total: z.number().int().min(1).max(20), bestStreak: z.number().int().min(0).max(20), elapsed: z.number().int().min(0).max(86400), mode: z.string().trim().min(1).max(60) }),
  category: z.string().trim().min(1).max(100).default("World"),
  daily: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in to sync progress." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.result.correct > parsed.data.result.total) return NextResponse.json({ error: "Invalid game result." }, { status: 400 });
  const stats = user.stats;
  const current: Progress = {
    username: user.username, country: user.country, xp: stats?.xp ?? 0, gamesPlayed: stats?.gamesPlayed ?? 0,
    correct: stats?.correct ?? 0, answers: stats?.answers ?? 0, bestStreak: stats?.bestStreak ?? 0,
    gameStreak: stats?.gameStreak ?? 0, dailyStreak: stats?.dailyStreak ?? 0,
    lastDaily: stats?.lastDaily?.toISOString().slice(0, 10) ?? null, badges: stats?.badges ?? [],
    categoryScores: (stats?.categoryScores ?? {}) as Progress["categoryScores"], seenQuestionIds: stats?.seenQuestionIds ?? [],
  };
  const next = updateProgress(current, parsed.data.result, parsed.data.category, parsed.data.daily);
  await db.userStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, xp: next.xp, gamesPlayed: next.gamesPlayed, correct: next.correct, answers: next.answers, bestStreak: next.bestStreak, gameStreak: next.gameStreak, dailyStreak: next.dailyStreak, lastDaily: next.lastDaily ? new Date(`${next.lastDaily}T00:00:00.000Z`) : null, badges: next.badges, categoryScores: next.categoryScores, seenQuestionIds: next.seenQuestionIds },
    update: { xp: next.xp, gamesPlayed: next.gamesPlayed, correct: next.correct, answers: next.answers, bestStreak: next.bestStreak, gameStreak: next.gameStreak, dailyStreak: next.dailyStreak, lastDaily: next.lastDaily ? new Date(`${next.lastDaily}T00:00:00.000Z`) : null, badges: next.badges, categoryScores: next.categoryScores },
  });
  return NextResponse.json({ progress: next });
}
