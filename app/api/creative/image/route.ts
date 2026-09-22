import { NextResponse } from "next/server";
import { generateImages, isNotConfigured } from "@/lib/creative/generate";
import { buildReceipt, imageCostNzd } from "@/lib/creative/costs";
import { consume, rateKey } from "@/lib/creative/ratelimit";
import { getAgent } from "@/lib/creative/agents";
import { ASSEMBL_CREATIVE_PROFILE, ASSEMBL_CREATIVE_ASSETS, assemblImageBrief } from "@/lib/creative/assembl-brand";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { brief, aspectRatio, count, agent = "prism", referenceDataUrl, brandProfile, brandAssetId } = (await req.json().catch(() => ({}))) as {
    brief?: string;
    aspectRatio?: string;
    count?: number;
    agent?: string;
    referenceDataUrl?: string;
    brandProfile?: string;
    brandAssetId?: string;
  };
  if (typeof brief !== 'string' || brief.trim().length < 3 || brief.length > 6000) {
    return NextResponse.json({ error: "A brief is required." }, { status: 400 });
  }
  if (brandProfile && brandProfile !== ASSEMBL_CREATIVE_PROFILE) {
    return NextResponse.json({ error: 'That brand profile is not available.' }, { status: 400 });
  }
  if (referenceDataUrl !== undefined && (typeof referenceDataUrl !== 'string' || referenceDataUrl.length > 8_000_000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(referenceDataUrl))) {
    return NextResponse.json({ error: 'Choose a JPEG, PNG or WebP reference smaller than 6MB.' }, { status: 400 });
  }
  const generationBrief = brandProfile === ASSEMBL_CREATIVE_PROFILE
    ? assemblImageBrief(brief, ['1:1', '4:5', '9:16', '16:9'].includes(aspectRatio ?? '') ? aspectRatio : '4:5', ASSEMBL_CREATIVE_ASSETS.find(asset => asset.id === brandAssetId)?.promptCue)
    : brief;
  const rl = await consume(rateKey(req), "image");
  if (!rl.ok) {
    return NextResponse.json(
      { rateLimited: true, error: `Rate limit reached (${rl.limit}/hour). Try again shortly.` },
      { status: 429 },
    );
  }

  const generationSignal = AbortSignal.any([req.signal, AbortSignal.timeout(50000)]);
  try {
    const result = await generateImages(generationBrief, { aspectRatio, count, referenceDataUrl, signal: generationSignal });
    generationSignal.throwIfAborted();
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
    if (generationSignal.aborted) {
      return NextResponse.json({ error: "Generation took too long. Your current image is still available; try again in a moment." }, { status: 504 });
    }
    if (isNotConfigured(e)) {
      return NextResponse.json({ notConfigured: true, envVar: e.envVar, detail: e.detail });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
