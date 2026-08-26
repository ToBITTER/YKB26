import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { QetsiyahGame } from "@/components/game/qetsiyah-game";

const QETSIYAH_EMAIL = (process.env.QETSIYAH_EMAIL ?? "favouroyelade1@gmail.com").toLowerCase();
const categories = new Set(["Mixed", "Pop Culture", "History", "General Knowledge"]);
export const metadata = { title: "Qetsiyah’s Quiz" };

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/account");
  if (user.email.toLowerCase() !== QETSIYAH_EMAIL) redirect("/");
  const requested = (await searchParams).category ?? "Mixed";
  return <QetsiyahGame category={categories.has(requested) ? requested : "Mixed"} />;
}
