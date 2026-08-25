import {NextResponse} from "next/server";import {destroySession,sameOrigin} from "@/lib/auth";
export async function POST(){if(!await sameOrigin())return NextResponse.json({error:"Invalid request origin"},{status:403});await destroySession();return NextResponse.json({ok:true})}

