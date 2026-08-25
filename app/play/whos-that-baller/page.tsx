import { QuizGame } from "@/components/game/quiz-game";

export const metadata = { title: "Who’s That Baller?" };

export default async function Page({ searchParams }: { searchParams: Promise<{ club?: string; competition?: string }> }) {
  const { club, competition } = await searchParams;
  return <QuizGame category={club} competition={competition} />;
}
