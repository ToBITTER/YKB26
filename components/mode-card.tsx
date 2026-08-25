import Link from "next/link";import {ArrowUpRight} from "lucide-react";
export function ModeCard({title,subtitle,number,href,tone="green",tag}:{title:string;subtitle:string;number:string;href:string;tone?:string;tag?:string}){return <Link href={href} className={`mode-card ${tone}`}><div className="mode-top"><span>{number}</span>{tag&&<b>{tag}</b>}<ArrowUpRight/></div><div><h3>{title}</h3><p>{subtitle}</p></div></Link>}

