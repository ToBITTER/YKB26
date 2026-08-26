import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bank from "@/data/qetsiyah-questions.generated.json";
import { currentUser } from "@/lib/auth";
import { selectQetsiyahSet, type QetsiyahQuestion } from "@/lib/qetsiyah-selection";

const QETSIYAH_EMAIL = (process.env.QETSIYAH_EMAIL ?? "favouroyelade1@gmail.com").toLowerCase();
const schema = z.object({ category: z.enum(["Mixed", "Pop Culture", "History", "General Knowledge"]), seenIds: z.array(z.string().max(80)).max(10000).default([]) });

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user || user.email.toLowerCase() !== QETSIYAH_EMAIL) return NextResponse.json({ error: "Not available for this account." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid quiz request." }, { status: 400 });
  const seen = [...new Set([...(user.stats?.seenQuestionIds ?? []), ...parsed.data.seenIds])];
  return NextResponse.json({ questions: selectQetsiyahSet(bank as QetsiyahQuestion[], seen, 20, parsed.data.category) });
}
