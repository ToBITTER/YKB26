import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser, sameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { FACE_OFF_SIZE, getFaceOffQuestion } from "@/lib/face-off";

const schema = z.object({ index: z.number().int().min(0).max(FACE_OFF_SIZE - 1), choice: z.string().max(300).nullable() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!await sameOrigin()) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
  const duel = await db.duel.findUnique({ where: { code: (await params).code.toUpperCase() } });
  if (!duel || duel.status !== "ACTIVE" || ![duel.hostId, duel.guestId].includes(user.id)) return NextResponse.json({ error: "This match is not active." }, { status: 409 });
  const side = duel.hostId === user.id ? "host" : "guest";
  const currentIndex = side === "host" ? duel.hostIndex : duel.guestIndex;
  if (currentIndex !== parsed.data.index) return NextResponse.json({ error: "That question was already answered." }, { status: 409 });
  const question = getFaceOffQuestion(duel.questionIds[currentIndex]!);
  if (!question) return NextResponse.json({ error: "Question unavailable." }, { status: 500 });
  const correct = parsed.data.choice === question.answer, points = correct ? 10 : 0, nextIndex = currentIndex + 1, finished = nextIndex === FACE_OFF_SIZE;
  const data = side === "host" ? { hostIndex: { increment: 1 }, hostScore: { increment: points }, hostCorrect: { increment: correct ? 1 : 0 }, ...(finished ? { hostFinishedAt: new Date() } : {}) } : { guestIndex: { increment: 1 }, guestScore: { increment: points }, guestCorrect: { increment: correct ? 1 : 0 }, ...(finished ? { guestFinishedAt: new Date() } : {}) };
  const updated = await db.duel.updateMany({ where: { id: duel.id, status: "ACTIVE", ...(side === "host" ? { hostIndex: currentIndex } : { guestIndex: currentIndex }) }, data });
  if (!updated.count) return NextResponse.json({ error: "That question was already answered." }, { status: 409 });
  if (finished) {
    const finalScore = side === "host" ? duel.hostScore + points : duel.guestScore + points;
    const xpEarned = Math.ceil(finalScore / 2);
    await db.userStats.upsert({ where: { userId: user.id }, create: { userId: user.id, xp: xpEarned, gamesPlayed: 1, correct: side === "host" ? duel.hostCorrect + Number(correct) : duel.guestCorrect + Number(correct), answers: FACE_OFF_SIZE }, update: { xp: { increment: xpEarned }, gamesPlayed: { increment: 1 }, correct: { increment: side === "host" ? duel.hostCorrect + Number(correct) : duel.guestCorrect + Number(correct) }, answers: { increment: FACE_OFF_SIZE } } });
    const latest = await db.duel.findUnique({ where: { id: duel.id } });
    if (latest?.hostFinishedAt && latest.guestFinishedAt) await db.duel.update({ where: { id: duel.id }, data: { status: "COMPLETE" } });
  }
  return NextResponse.json({ correct, correctAnswer: question.answer, points, nextIndex });
}
