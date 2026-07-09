import { NextResponse } from "next/server";
import { generateImages, isNotConfigured } from "@/lib/creative/generate";
import { buildReceipt, imageCostNzd } from "@/lib/creative/costs";
import { consume, rateKey } from "@/lib/creative/ratelimit";
import { getAgent } from "@/lib/creative/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { brief, aspectRatio, count, agent = "prism", referenceDataUrl } = (await req.json().catch(() => ({}))) as {
    brief?: string;
    aspectRatio?: string;
    count?: number;
    agent?: string;
    referenceDataUrl?: string;
  };
  if (!brief || brief.trim().length < 3) {
    return NextResponse.json({ error: "A brief is required." }, { status: 400 });
  }

  const rl = await consume(rateKey(req), "image");
  if (!rl.ok) {
    return NextResponse.json(
      { rateLimited: true, error: `Rate limit reached (${rl.limit}/hour). Try again shortly.` },
      { status: 429 },
    );
  }

  try {
    const result = await generateImages(brief, { aspectRatio, count, referenceDataUrl });
    const receipt = buildReceipt({
      agent: getAgent(agent)?.name ?? "Prism",
      kind: "image",
      provider: result.provider,
      model: result.model,
      costNzd: imageCostNzd(result.images.length, result.provider),
      brief,
      spec: `${result.images.length}× ${result.aspectRatio}${referenceDataUrl ? " · ref upload" : ""}`,
      now: new Date().toISOString(),
    });
    return NextResponse.json({ images: result.images, receipt, remaining: rl.remaining });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ notConfigured: true, envVar: e.envVar, detail: e.detail });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
