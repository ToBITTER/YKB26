import clubs from "@/data/clubs.generated.json";
import questions from "@/data/questions.generated.json";
import Link from "next/link";

const availableClubs = clubs.filter((club) => {
  const pool = questions.filter((question) => question.category.toLowerCase() === club.name.toLowerCase());
  return pool.length >= 20 && new Set(pool.map((question) => question.answer.toLowerCase())).size >= 20;
});

export default function Clubs() {
  return <main className="shell page">
    <header className="page-head"><span>CLUB MODE</span><h1>REP YOUR<br />COLOURS.</h1><p>Every listed club has a full 20-question challenge drawn from verified player records.</p></header>
    <section className="club-grid">{availableClubs.map((club) => <Link href={`/play/whos-that-baller?club=${encodeURIComponent(club.name)}`} key={club.id}><b>{club.short}</b><div><strong>{club.name}</strong><span>{club.league} · 20 QUESTIONS →</span></div></Link>)}</section>
  </main>;
}
