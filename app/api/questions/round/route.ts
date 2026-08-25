import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import generatedData from "@/data/questions.generated.json";
import curatedData from "@/data/questions.json";
import clubs from "@/data/clubs.generated.json";
import type { QuizQuestion } from "@/types";
import { currentUser, sameOrigin } from "@/lib/auth";
import { dailyIndex } from "@/lib/game";
import { selectUnseenQuestionSet } from "@/lib/question-selection";
import { db } from "@/lib/db";

const schema = z.object({ mode: z.enum(["whos-that-baller", "nigeria"]).default("whos-that-baller"), daily: z.boolean().default(false), category: z.string().trim().max(100).optional(), competition: z.string().trim().max(100).optional(), seenIds: z.array(z.string().min(1).max(120)).max(10000).default([]) });

export async function POST(request: NextRequest) {
  if (!await sameOrigin()) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid round request" }, { status: 400 });
  const { mode, daily, category, competition } = parsed.data;
  const generated = generatedData as QuizQuestion[];
  const curated = curatedData as QuizQuestion[];
  const nigerianRecords = new Set(generated.filter((question) => ["nationality", "birth-country"].includes(question.kind ?? "") && question.answer.toLowerCase() === "nigeria").map((question) => question.sourceRecordId));
  const fullBank = mode === "nigeria" ? [...curated.filter((question) => question.mode === "nigeria"), ...generated.filter((question) => nigerianRecords.has(question.sourceRecordId))] : generated;
  const leagueClubs = competition ? clubs.filter((club) => club.league.toLowerCase() === competition.toLowerCase()).map((club) => club.name.toLowerCase()) : [];
  const filtered = category ? fullBank.filter((question) => question.category.toLowerCase() === category.toLowerCase()) : leagueClubs.length ? fullBank.filter((question) => leagueClubs.includes(question.category.toLowerCase())) : fullBank;
  const user = await currentUser();
  const seenIds = [...new Set([...parsed.data.seenIds, ...(user?.stats?.seenQuestionIds ?? [])])];
  const questions = daily ? (() => { const unseen = filtered.filter((question) => !seenIds.includes(question.id)); return unseen.length ? [unseen[dailyIndex(new Date().toISOString().slice(0, 10), unseen.length)]!] : []; })() : selectUnseenQuestionSet(filtered, seenIds, 20);
  if (user && questions.length) {
    const merged = [...new Set([...(user.stats?.seenQuestionIds ?? []), ...questions.map((question) => question.id)])];
    await db.userStats.upsert({ where: { userId: user.id }, create: { userId: user.id, seenQuestionIds: merged }, update: { seenQuestionIds: merged } });
  }
  return NextResponse.json({ questions });
}
