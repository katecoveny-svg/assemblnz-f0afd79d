import { NextResponse } from "next/server";
import { generateAdCampaign, UnknownBusiness } from "@/lib/creative/ad-campaign";
import { isNotConfigured } from "@/lib/creative/generate";
import { buildReceipt, imageCostNzd } from "@/lib/creative/costs";
import { consume, rateKey } from "@/lib/creative/ratelimit";
import { SAMPLE_VERTICALS } from "@/lib/living-site/verticals";

export const runtime = "nodejs";
export const maxDuration = 60;

const KNOWN_SLUGS = new Set(SAMPLE_VERTICALS.map((v) => v.slug));

export async function POST(req: Request) {
  const { slug, goal } = (await req.json().catch(() => ({}))) as { slug?: string; goal?: string };
  if (!slug || !KNOWN_SLUGS.has(slug)) {
    return NextResponse.json({ error: "Pick a sample business to build a campaign for." }, { status: 400 });
  }

  // One campaign generates a base image → count it against the image budget.
  const rl = await consume(rateKey(req), "image");
  if (!rl.ok) {
    return NextResponse.json(
      { rateLimited: true, error: `Rate limit reached (${rl.limit}/hour). Try again shortly.` },
      { status: 429 },
    );
  }

  try {
    const campaign = await generateAdCampaign(slug, goal ?? "");
    const receipt = buildReceipt({
      agent: "Muse + Prism",
      kind: "image",
      provider: campaign.imageProvider,
      model: `ad campaign · ${campaign.copyProvider} copy · ${campaign.imageProvider} image`,
      costNzd: imageCostNzd(1, campaign.imageProvider),
      brief: `${campaign.business.name}: ${goal ?? ""}`.trim(),
      spec: `campaign · genome ${campaign.live ? "live" : "sample"}`,
      now: new Date().toISOString(),
    });
    return NextResponse.json({ campaign, receipt, remaining: rl.remaining });
  } catch (e) {
    if (e instanceof UnknownBusiness) {
      return NextResponse.json({ error: "Unknown business." }, { status: 400 });
    }
    if (isNotConfigured(e)) {
      return NextResponse.json({ notConfigured: true, envVar: e.envVar, detail: e.detail });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
