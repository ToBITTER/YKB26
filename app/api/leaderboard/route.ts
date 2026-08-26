import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const viewer = await currentUser();
  const scope = request.nextUrl.searchParams.get("scope") ?? "GLOBAL";
  const where = scope === "COUNTRY" && viewer ? { user: { country: viewer.country } } : scope === "WEEKLY" ? { updatedAt: { gte: new Date(Date.now() - 7 * 86400000) } } : {};
  const stats = await db.userStats.findMany({ where, orderBy: [{ xp: "desc" }, { correct: "desc" }], take: 100, include: { user: { select: { id: true, username: true, country: true } } } });
  return NextResponse.json({ rows: stats.map((entry, index) => ({ rank: index + 1, id: entry.user.id, username: entry.user.username, country: entry.user.country, xp: entry.xp, gamesPlayed: entry.gamesPlayed, correct: entry.correct, answers: entry.answers, isYou: entry.user.id === viewer?.id })) });
}
