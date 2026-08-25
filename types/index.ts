export type Mode = "whos-that-baller" | "career-path" | "head-to-head" | "connections" | "nigeria";
export interface Player { id:string; name:string; nationality:string; position:string; clubs:string[]; facts:string[] }
export interface QuizQuestion { id:string; mode:Mode; prompt:string; answer:string; choices:string[]; clues?:string[]; explanation:string; category:string; source?:string; sourceUrl?:string; sourceRecordId?:string; verifiedAt?:string }
export interface HeadToHead { id:string; prompt:string; left:{name:string;value:number;label:string}; right:{name:string;value:number;label:string}; answer:string; category:string }
export interface Career { id:string; clubs:string[]; answer:string; choices:string[]; nationality:string; position:string }
export interface Progress { username:string; country:string; xp:number; gamesPlayed:number; correct:number; answers:number; bestStreak:number; gameStreak:number; dailyStreak:number; lastDaily:string|null; badges:string[]; categoryScores:Record<string,{correct:number;total:number}> }
export interface GameResult { score:number; xp:number; correct:number; total:number; bestStreak:number; elapsed:number; mode:string }
