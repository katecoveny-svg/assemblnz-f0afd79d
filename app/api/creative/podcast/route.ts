import { NextResponse } from "next/server";
import { generatePodcast, geminiText, isNotConfigured } from "@/lib/creative/generate";
import { buildReceipt, podcastCostNzd } from "@/lib/creative/costs";
import { consume, rateKey } from "@/lib/creative/ratelimit";
import { getAgent } from "@/lib/creative/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { topic, script: rawScript } = (await req.json().catch(() => ({}))) as {
    topic?: string;
    script?: string;
  };
  if (!topic && !rawScript) {
    return NextResponse.json({ error: "A topic or script is required." }, { status: 400 });
  }

  const rl = await consume(rateKey(req), "podcast");
  if (!rl.ok) {
    return NextResponse.json(
      { rateLimited: true, error: `Rate limit reached (${rl.limit}/hour). Try again shortly.` },
      { status: 429 },
    );
  }

  const verse = getAgent("verse")!;
  try {
    // Draft a tight 30–60s script from the topic if no script was supplied.
    let script = rawScript?.trim() ?? "";
    if (!script) {
      script = await geminiText(
        verse.systemPrompt,
        `Write a 30–45 second spoken podcast segment (spoken words only — no stage directions, no markdown) on: ${topic}. Warm NZ presenter voice. Open with a hook, one idea, a close.`,
        0.85,
      );
    }
    script = script.replace(/[*#_`>]/g, "").trim().slice(0, 2500);

    const result = await generatePodcast(script);
    const receipt = buildReceipt({
      agent: verse.name,
      kind: "podcast",
      provider: result.provider,
      model: result.model,
      costNzd: podcastCostNzd(result.chars, result.provider),
      brief: topic ?? script,
      spec: `${result.chars} chars · MP3`,
      now: new Date().toISOString(),
    });
    return NextResponse.json({ audio: result.audio, script: result.script, receipt, remaining: rl.remaining });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ notConfigured: true, envVar: e.envVar, detail: e.detail });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
