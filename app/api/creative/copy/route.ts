import { NextResponse } from "next/server";
import { geminiTextStream, isNotConfigured, type ChatTurn } from "@/lib/creative/generate";
import { consume, rateKey } from "@/lib/creative/ratelimit";
import { getAgent } from "@/lib/creative/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, agent = "muse" } = (await req.json().catch(() => ({}))) as {
    messages?: ChatTurn[];
    agent?: string;
  };
  const turns = (messages ?? []).filter((m) => m?.content?.trim());
  if (!turns.length) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  const rl = await consume(rateKey(req), "copy");
  if (!rl.ok) {
    return NextResponse.json(
      { rateLimited: true, error: `Rate limit reached (${rl.limit}/hour). Try again shortly.` },
      { status: 429 },
    );
  }

  const def = getAgent(agent) ?? getAgent("muse")!;
  try {
    const stream = geminiTextStream(def.systemPrompt, turns);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Creative-Model": "gemini-2.5-flash",
        "X-Creative-Remaining": String(rl.remaining),
      },
    });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ notConfigured: true, envVar: e.envVar, detail: e.detail });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
