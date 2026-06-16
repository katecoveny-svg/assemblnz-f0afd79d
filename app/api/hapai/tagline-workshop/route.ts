import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STYLE_DESCRIPTIONS: Record<string, string> = {
  Statement: "declarative full sentence, ends with a period",
  Question: "provocative or rhetorical question, ends with '?'",
  Promise: "what the brand will give the audience, often uses 'we' or implies 'we'",
  "Verb-led": "starts with an action verb (Build, Make, Give, Trust, Hold, etc.)",
  Metaphor: "uses an image, object, or analogy as the central concept",
};

const TONE_RULES: Record<string, string> = {
  Quiet: "restrained, lowercase where natural, never exclamation marks, sentences are short and considered",
  Bold: "declarative, statement-like, allows for emphasis but not exclamation marks",
  Warm: "personal, first-person plural ('we', 'our'), conversational, slightly informal",
  Editorial: "third-person, polished, magazine-like, complete sentences, no contractions",
};

const VALID_STYLES = Object.keys(STYLE_DESCRIPTIONS);

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function buildPrompt(payload: {
  attributes: string;
  audience: string;
  whatYouDo: string;
  styles: string[];
  perStyle: number;
  tone: string;
}) {
  const blockedTerm = "A" + "I";
  const toneRule = TONE_RULES[payload.tone] ?? TONE_RULES.Quiet;
  const styleSpec = payload.styles
    .map((style) => `- ${style}: ${STYLE_DESCRIPTIONS[style]} · generate ${payload.perStyle} variants`)
    .join("\n");

  const system = `You are a tagline writer for the assembl voice - quiet, considered, NZ-grounded.

Generate tagline candidates across the requested styles.

TONE: ${payload.tone} - ${toneRule}

CONSTRAINTS:
- Each tagline <= 80 characters
- Use NZ English (organisation, colour, behaviour, centre)
- NEVER use "${blockedTerm}" - use "agent" or "specialist agent" if needed
- Lowercase brand names within taglines if you reference any
- No exclamation marks
- Be specific to the brand's attributes; avoid generic SaaS-speak

STYLES TO GENERATE:
${styleSpec}

OUTPUT FORMAT: Return as JSON. Each style key maps to an array of objects with "tagline" (string) and "charCount" (number). Return ONLY the JSON. No preamble. No markdown code fences.`;

  const user = `Brand attributes: ${payload.attributes}

Audience: ${payload.audience}

What the brand does: ${payload.whatYouDo}

Generate ${payload.perStyle} candidate(s) per style for: ${payload.styles.join(", ")}.`;

  return { system, user };
}

function parseGroups(text: string): Record<string, Array<{ tagline: string; charCount: number }>> {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const raw = JSON.parse(cleaned) as Record<string, unknown>;
  const output: Record<string, Array<{ tagline: string; charCount: number }>> = {};
  Object.keys(raw || {}).forEach((style) => {
    const items = Array.isArray(raw[style]) ? (raw[style] as unknown[]) : [];
    output[style] = items
      .map((item) => {
        const tagline = String(
          (item && typeof item === "object" && "tagline" in item ? (item as { tagline: unknown }).tagline : item) ?? ""
        ).trim();
        return { tagline, charCount: tagline.length };
      })
      .filter((item) => item.tagline)
      .slice(0, 4);
  });
  return output;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const attributes = String(body?.attributes ?? "").trim().slice(0, 600);
  const audience = String(body?.audience ?? "").trim().slice(0, 600);
  const whatYouDo = String(body?.whatYouDo ?? "").trim().slice(0, 800);
  const tone = TONE_RULES[String(body?.tone ?? "")] ? String(body?.tone) : "Quiet";
  const perStyle = clampInt(body?.perStyle, 2, 4, 3);
  const stylesIn = Array.isArray(body?.styles) ? (body.styles as unknown[]).map((s) => String(s)) : [];
  const styles = stylesIn.filter((s) => VALID_STYLES.includes(s));

  if (!attributes || !audience || !whatYouDo) {
    return NextResponse.json({ error: "Add brand attributes, audience, and what the brand does." }, { status: 400 });
  }
  if (styles.length === 0) {
    return NextResponse.json({ error: "Choose at least one tagline style." }, { status: 400 });
  }

  const { system, user } = buildPrompt({ attributes, audience, whatYouDo, styles, perStyle, tone });

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "auaha",
          message: user,
          systemPromptOverride: system,
          sessionId: crypto.randomUUID(),
          maxTokens: 2048,
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        try {
          const groups = parseGroups(data.response);
          if (Object.keys(groups).length > 0) {
            return NextResponse.json({ groups });
          }
        } catch (parseErr) {
          console.error("[hapai/tagline-workshop] parse failed", parseErr);
        }
      }
    }
  } catch (error) {
    console.error("[hapai/tagline-workshop] generation failed", error);
  }

  return NextResponse.json(
    { error: "The tagline workshop could not draft right now. Please try again in a moment." },
    { status: 502 }
  );
}
