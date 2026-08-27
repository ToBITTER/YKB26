import { ModeCard } from "@/components/mode-card";

const modes = [
  { title: "Face-Off", subtitle: "Call out a friend in a live 20-question 1v1.", number: "01", href: "/play/face-off", tone: "lime", tag: "LIVE" },
  { title: "Who’s That Baller?", subtitle: "Progressive clues. Maximum 500 XP.", number: "02", href: "/play/whos-that-baller", tone: "blue" },
  { title: "Career Path", subtitle: "Trace the journey from club to club.", number: "03", href: "/play/career-path", tone: "orange" },
  { title: "Head-to-Head", subtitle: "Back your football knowledge.", number: "04", href: "/play/head-to-head", tone: "purple" },
  { title: "Football Connections", subtitle: "Four groups. Four mistakes.", number: "05", href: "/play/connections", tone: "dark" },
  { title: "The XI", subtitle: "Build a balanced XI for £100m.", number: "06", href: "/play/the-xi", tone: "green" },
  { title: "Nigeria Mode", subtitle: "Twenty Super Eagles questions.", number: "07", href: "/play/nigeria", tone: "gold" },
];

export default function Play() {
  return <main className="shell page"><header className="page-head"><span>THE DRESSING ROOM</span><h1>PICK YOUR<br />CHALLENGE.</h1><p>Every game earns XP. Better answers build bigger streaks.</p></header><section className="modes-grid">{modes.map((mode) => <ModeCard key={mode.number} {...mode} />)}</section></main>;
}
