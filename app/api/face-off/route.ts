import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser, sameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { FACE_OFF_SIZE, faceOffBank } from "@/lib/face-off";
import { selectQuestionSet } from "@/lib/question-selection";
import { allow } from "@/lib/rate-limit";

const schema = z.discriminatedUnion("action", [z.object({ action: z.literal("create") }), z.object({ action: z.literal("join"), code: z.string().trim().toUpperCase().regex(/^[A-Z2-9]{6}$/) })]);
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () => Array.from(crypto.randomBytes(6), (byte) => alphabet[byte % alphabet.length]).join("");

export async function POST(request: NextRequest) {
  if (!await sameOrigin()) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in to play Face-Off." }, { status: 401 });
  if (!allow(`face-off:${user.id}`, 12)) return NextResponse.json({ error: "Too many room requests. Try again shortly." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid Face-Off request." }, { status: 400 });

  if (parsed.data.action === "join") {
    const duel = await db.duel.findUnique({ where: { code: parsed.data.code } });
    if (!duel || duel.expiresAt <= new Date()) return NextResponse.json({ error: "That room does not exist or has expired." }, { status: 404 });
    if (duel.hostId === user.id || duel.guestId === user.id) return NextResponse.json({ code: duel.code });
    if (duel.guestId) return NextResponse.json({ error: "That room already has two players." }, { status: 409 });
    const joined = await db.duel.updateMany({ where: { id: duel.id, guestId: null, status: "WAITING" }, data: { guestId: user.id, status: "ACTIVE", startedAt: new Date() } });
    if (!joined.count) return NextResponse.json({ error: "Someone else joined that room first." }, { status: 409 });
    return NextResponse.json({ code: duel.code });
  }

  const selected = selectQuestionSet(faceOffBank, FACE_OFF_SIZE);
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = makeCode();
    try {
      await db.duel.create({ data: { code, hostId: user.id, questionIds: selected.map((question) => question.id), expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) } });
      return NextResponse.json({ code }, { status: 201 });
    } catch { /* retry a rare code collision */ }
  }
  return NextResponse.json({ error: "Could not create a room. Please try again." }, { status: 500 });
}
