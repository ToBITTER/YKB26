import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { FACE_OFF_SIZE, getFaceOffQuestion, publicQuestion } from "@/lib/face-off";

export async function GET(_: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in to enter this Face-Off." }, { status: 401 });
  const code = (await params).code.toUpperCase();
  const duel = await db.duel.findUnique({ where: { code }, include: { host: { select: { username: true } }, guest: { select: { username: true } } } });
  if (!duel) return NextResponse.json({ error: "Face-Off not found." }, { status: 404 });
  if (![duel.hostId, duel.guestId].includes(user.id)) return NextResponse.json({ error: "Join this room to play.", joinable: duel.status === "WAITING" && !duel.guestId }, { status: 403 });
  const side = duel.hostId === user.id ? "host" : "guest";
  const myIndex = side === "host" ? duel.hostIndex : duel.guestIndex;
  const opponentIndex = side === "host" ? duel.guestIndex : duel.hostIndex;
  const myScore = side === "host" ? duel.hostScore : duel.guestScore;
  const opponentScore = side === "host" ? duel.guestScore : duel.hostScore;
  const myCorrect = side === "host" ? duel.hostCorrect : duel.guestCorrect;
  const opponentCorrect = side === "host" ? duel.guestCorrect : duel.hostCorrect;
  const complete = duel.status === "COMPLETE" || (duel.hostIndex >= FACE_OFF_SIZE && duel.guestIndex >= FACE_OFF_SIZE);
  return NextResponse.json({ code, status: complete ? "COMPLETE" : duel.status, side, me: { username: user.username, index: myIndex, score: myScore, correct: myCorrect }, opponent: { username: side === "host" ? duel.guest?.username ?? null : duel.host.username, index: opponentIndex, score: opponentScore, correct: opponentCorrect }, question: duel.status === "ACTIVE" && myIndex < FACE_OFF_SIZE ? publicQuestion(getFaceOffQuestion(duel.questionIds[myIndex]!)) : null, total: FACE_OFF_SIZE, xpEarned: complete ? Math.ceil(myScore / 2) : 0, expiresAt: duel.expiresAt });
}
