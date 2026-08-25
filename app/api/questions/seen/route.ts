import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser, sameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ ids: z.array(z.string().min(1).max(120)).min(1).max(20) });

export async function GET() {
  const user = await currentUser();
  return NextResponse.json({ ids: user?.stats?.seenQuestionIds ?? [] });
}

export async function POST(request: NextRequest) {
  if (!await sameOrigin()) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ ids: [] }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid question history" }, { status: 400 });
  const ids = [...new Set([...(user.stats?.seenQuestionIds ?? []), ...parsed.data.ids])];
  await db.userStats.upsert({ where: { userId: user.id }, create: { userId: user.id, seenQuestionIds: ids }, update: { seenQuestionIds: ids } });
  return NextResponse.json({ ids });
}
