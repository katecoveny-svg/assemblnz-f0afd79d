import { NextResponse } from "next/server";
import { generateAdCampaign, generateAdCampaignForDna, UnknownBusiness } from "@/lib/creative/ad-campaign";
import { sanitizeDna } from "@/lib/creative/site-brand";
import { isNotConfigured } from "@/lib/creative/generate";
import { buildReceipt, imageCostNzd } from "@/lib/creative/costs";
import { consume, rateKey } from "@/lib/creative/ratelimit";
import { SAMPLE_VERTICALS } from "@/lib/living-site/verticals";
import { ASSEMBL_AD } from "@/lib/creative/ad-campaign";

export const runtime = "nodejs";
export const maxDuration = 60;

const KNOWN_SLUGS = new Set([ASSEMBL_AD.slug, ...SAMPLE_VERTICALS.map((v) => v.slug)]);

/**
 * Build one campaign. Two entries:
 *  - { slug, goal }  — assembl or a fictional sample business (genome-read)
 *  - { dna, goal }   — the visitor's own business, from the Business DNA the
 *    /api/creative/brand reader produced (and the visitor may have edited).
 *    The DNA is re-sanitised here — lengths capped, colours validated —
 *    because the client copy is editable.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    goal?: string;
    dna?: unknown;
  };
  const goal = typeof body.goal === "string" ? body.goal.slice(0, 300) : "";

  const dna = body.dna ? sanitizeDna(body.dna) : null;
  if (!dna && (!body.slug || !KNOWN_SLUGS.has(body.slug))) {
    return NextResponse.json(
      { error: "Pick a sample business, or read your own website first." },
      { status: 400 },
    );
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
    const campaign = dna
      ? await generateAdCampaignForDna(dna, goal)
      : await generateAdCampaign(body.slug!, goal);
    const receipt = buildReceipt({
      agent: "Muse + Prism",
      kind: "image",
      provider: campaign.imageProvider,
      model: `ad campaign · ${campaign.copyProvider} copy · ${campaign.imageProvider} image`,
      costNzd: imageCostNzd(1, campaign.imageProvider),
      brief: `${campaign.business.name}: ${goal}`.trim(),
      spec: dna
        ? `campaign · brand read from ${dna.url || "the visitor's site"}`
        : `campaign · genome ${campaign.live ? "live" : "sample"}`,
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
