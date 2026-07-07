import { NextResponse } from "next/server";
import { startVideo, isNotConfigured } from "@/lib/creative/generate";
import { buildReceipt, videoCostNzd } from "@/lib/creative/costs";
import { consume, rateKey } from "@/lib/creative/ratelimit";
import { getAgent } from "@/lib/creative/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { brief, aspectRatio } = (await req.json().catch(() => ({}))) as {
    brief?: string;
    aspectRatio?: string;
  };
  if (!brief || brief.trim().length < 3) {
    return NextResponse.json({ error: "A scene description is required." }, { status: 400 });
  }

  const rl = await consume(rateKey(req), "video");
  if (!rl.ok) {
    return NextResponse.json(
      { rateLimited: true, error: `Rate limit reached (${rl.limit}/hour). Try again shortly.` },
      { status: 429 },
    );
  }

  const flux = getAgent("flux")!;
  try {
    const started = await startVideo(brief, { aspectRatio });
    const receipt = buildReceipt({
      agent: flux.name,
      kind: "video",
      provider: started.provider,
      model: started.model,
      costNzd: videoCostNzd(started.provider === "veo" ? "veo" : "fal"),
      brief,
      spec: `${aspectRatio ?? "16:9"} · ~8s`,
      now: new Date().toISOString(),
    });
    if (started.done) {
      return NextResponse.json({ done: true, video: started.video, receipt, remaining: rl.remaining });
    }
    return NextResponse.json({ done: false, operation: started.operation, receipt, remaining: rl.remaining });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ notConfigured: true, envVar: e.envVar, detail: e.detail });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
