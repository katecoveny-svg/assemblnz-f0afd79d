import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { gate, gateBlockedResponse } from "@/lib/gating/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLATFORMS = ["LinkedIn", "Instagram", "X", "Facebook"] as const;
const TONES = ["Founder voice", "Brand voice", "Casual", "Professional"] as const;
const LENGTHS: Record<string, number> = { short: 120, medium: 280, long: 2000 };
const HASHTAG_COUNTS = ["0", "3", "5", "10"] as const;
const VARIANT_COUNT = 5;

type Payload = {
  source: string;
  platform: string;
  tone: string;
  length: string;
  maxChars: number;
  cta: string;
  hashtagCount: string;
  count: number;
};

// System + user prompts ported verbatim from
// public/hapai/caption-composer/caption-composer.html (buildPrompt).
function buildPrompt(payload: Payload, variation: number) {
  const blockedTerm = "A" + "I";
  const system = `You are a caption composer for ${payload.platform}. You write in the ${payload.tone} voice.
Produce ${payload.count} distinct variants of the caption, each <= ${payload.maxChars} characters.

PLATFORM RULES:
- LinkedIn: professional, hook in first line, mid-length, 0-3 hashtags max
- Instagram: emotional hook, line breaks for rhythm, 5-10 hashtags at bottom
- X: punchy, <=280 chars, no hashtags unless asked, conversational
- Facebook: longer, narrative, minimal hashtags

VOICE RULES:
- Founder voice: first-person, personal, slightly raw
- Brand voice: third-person, polished, restrained
- Casual: contractions, lighter punctuation
- Professional: formal, complete sentences

BANNED WORDS: never use "${blockedTerm}" - use "agent" or "specialist agent". Lowercase brand names.`;

  const user = `Compose ${payload.count} captions for ${payload.platform} in the ${payload.tone} voice about:
${payload.source}

Optional CTA: ${payload.cta || "none"}
Optional hashtag count: ${payload.hashtagCount}
Variation pass: ${variation}

Return as JSON only: [{"caption":"...","charCount":123}]`;
  return { system, user };
}

type Variant = { caption: string };

function normaliseItems(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    if (Array.isArray(record.captions)) return record.captions;
    if (Array.isArray(record.variants)) return record.variants;
  }
  return [];
}

function toVariants(raw: unknown): Variant[] {
  return normaliseItems(raw)
    .map((item) => {
      const caption =
        typeof item === "string"
          ? item
          : String((item as Record<string, unknown>)?.caption ?? "");
      return { caption: caption.trim().slice(0, 4000) };
    })
    .filter((item) => item.caption)
    .slice(0, VARIANT_COUNT);
}

/** Tolerant parse: plain JSON, fenced JSON, or the first array in the text. */
function parseVariants(text: string): Variant[] {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  try {
    const variants = toVariants(JSON.parse(cleaned));
    if (variants.length) return variants;
  } catch {
    /* fall through to array extraction */
  }
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      return toVariants(JSON.parse(match[0]));
    } catch {
      /* fall through to empty */
    }
  }
  return [];
}

function clampCaption(text: string, maxChars: number) {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

function buildHashtags(source: string, count: number): string {
  if (count <= 0) return "";
  const words = source
    .toLowerCase()
    .replace(/[^a-zāēīōū\s]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4);
  const unique = [...new Set(words)].slice(0, count);
  return unique.map((word) => `#${word}`).join(" ");
}

/** Deterministic fallback: three plain, platform-length variants from the source. */
function fallbackVariants(payload: Payload): Variant[] {
  const source = payload.source.replace(/\s+/g, " ").trim();
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean);
  const first = sentences[0] ?? source;
  const rest = sentences.slice(1).join(" ");
  const tags = buildHashtags(source, Number(payload.hashtagCount) || 0);
  const tagBlock = tags ? `\n\n${tags}` : "";
  const ctaBlock = payload.cta ? `\n\n${payload.cta}` : "";
  const candidates = [
    `${source}${ctaBlock}${tagBlock}`,
    `${first}${rest ? `\n\n${rest}` : ""}${ctaBlock}${tagBlock}`,
    `${payload.cta ? `${payload.cta} — ` : ""}${first}${tagBlock}`,
  ];
  return candidates.map((caption) => ({ caption: clampCaption(caption, payload.maxChars) }));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const source = String(body?.source ?? "").trim().slice(0, 4000);
  if (source.length < 8) {
    return NextResponse.json({ error: "Add the thing you are posting about first." }, { status: 400 });
  }

  const platform = PLATFORMS.includes(body?.platform) ? String(body.platform) : "LinkedIn";
  const tone = TONES.includes(body?.tone) ? String(body.tone) : "Founder voice";
  const length = typeof body?.length === "string" && LENGTHS[body.length] ? String(body.length) : "medium";
  const cta = String(body?.cta ?? "").trim().slice(0, 200);
  const hashtagCount = HASHTAG_COUNTS.includes(String(body?.hashtagCount) as (typeof HASHTAG_COUNTS)[number])
    ? String(body?.hashtagCount)
    : "0";
  const variation = Math.min(Math.max(Number(body?.variation) || 1, 1), 99);

  const payload: Payload = {
    source,
    platform,
    tone,
    length,
    maxChars: LENGTHS[length],
    cta,
    hashtagCount,
    count: VARIANT_COUNT,
  };

  // Access gate — assembl pays for the model call (anon: 1 free; email lifts it).
  const verdict = await gate(req, "hapai", "caption-composer");
  if (!verdict.allowed) return gateBlockedResponse(verdict);

  const prompt = buildPrompt(payload, variation);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "auaha",
          message: prompt.user,
          systemPromptOverride: prompt.system,
          sessionId: crypto.randomUUID(),
          maxTokens: 1024,
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        const variants = parseVariants(data.response);
        if (variants.length) {
          return NextResponse.json({ variants });
        }
      }
    }
  } catch (err) {
    console.error("[hapai/caption-composer] generation failed", err);
  }

  return NextResponse.json({ variants: fallbackVariants(payload) });
}
