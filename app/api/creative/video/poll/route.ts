import { NextResponse } from "next/server";
import { pollVideo, isNotConfigured } from "@/lib/creative/generate";

export const runtime = "nodejs";
export const maxDuration = 60;

// Client polls this until { done: true, video }. Veo clips take ~1–3 minutes.
export async function POST(req: Request) {
  const { operation } = (await req.json().catch(() => ({}))) as { operation?: string };
  if (!operation) {
    return NextResponse.json({ error: "operation is required" }, { status: 400 });
  }
  try {
    const r = await pollVideo(operation);
    return NextResponse.json(r);
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ notConfigured: true, envVar: e.envVar, detail: e.detail });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
