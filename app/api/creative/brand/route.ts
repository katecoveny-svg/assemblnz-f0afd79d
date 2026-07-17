import { NextResponse } from "next/server";
import { readSiteBrand } from "@/lib/creative/site-brand";
import { isNotConfigured } from "@/lib/creative/generate";
import { consume, rateKey } from "@/lib/creative/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Read a visitor's website into Business DNA for the Ad Studio.
 * Rate-limited like the other creative endpoints; the fetch itself is
 * SSRF-guarded and byte-capped in lib/creative/site-brand.ts.
 */
export async function POST(req: Request) {
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url || typeof url !== "string" || url.trim().length < 4) {
    return NextResponse.json({ error: "Paste a web address first." }, { status: 400 });
  }

  const rl = await consume(rateKey(req), "brand");
  if (!rl.ok) {
    return NextResponse.json(
      { rateLimited: true, error: `Rate limit reached (${rl.limit}/hour). Try again shortly.` },
      { status: 429 },
    );
  }

  try {
    const dna = await readSiteBrand(url.trim());
    return NextResponse.json({ dna, remaining: rl.remaining });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ notConfigured: true, envVar: e.envVar, detail: e.detail });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
