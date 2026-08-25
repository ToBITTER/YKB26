import competitions from "@/data/competitions.json";
import Link from "next/link";

const leagueById: Record<string, string> = {
  pl: "Premier League",
  laliga: "La Liga",
  seriea: "Serie A",
  bundesliga: "Bundesliga",
  ligue1: "Ligue 1",
};

export default function Competitions() {
  return <main className="shell page">
    <header className="page-head"><span>COMPETITION MODE</span><h1>OWN THE<br />BIG STAGE.</h1><p>Pick a competition and enter the challenge arena.</p></header>
    <section className="competition-list">{competitions.map((competition, index) => {
      const league = leagueById[competition.id];
      const href = competition.id === "afcon" ? "/play/nigeria" : league ? `/play/whos-that-baller?competition=${encodeURIComponent(league)}` : "/play/whos-that-baller";
      return <Link href={href} key={competition.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{competition.name}</strong><b>PLAY →</b></Link>;
    })}</section>
  </main>;
}
