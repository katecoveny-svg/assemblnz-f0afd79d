import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { gate, gateBlockedResponse } from "@/lib/gating/server";
import {
  BRIEF_FIELD_SETS,
  BRIEF_TYPES,
  type Brief,
  type BriefType,
} from "@/lib/hapai/brief-fields";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = { type: BriefType; fields: Record<string, string> };

// System + user prompts ported verbatim from
// public/hapai/brief-generator/brief-generator.html (buildPrompt).
function buildPrompt(payload: Payload) {
  const blockedTerm = "A" + "I";
  const system = `You are a senior brief writer for assembl. You turn rough context into a clear one-page ${payload.type} brief.
Write in a restrained, practical assembl voice. Use plain English. Expand each section into 2-3 concise sentences.
Never use the word "${blockedTerm}"; use "agent" or "specialist agent" when needed. Lowercase brand names.
Return valid JSON only with this shape:
{"title":"...","eyebrow":"${payload.type} brief","sections":[{"heading":"...","body":"..."}],"signature":"prepared in browser · human review recommended"}`;
  const user = `Brief type: ${payload.type}
Fields:
${JSON.stringify(payload.fields, null, 2)}

Create a single-page brief with 6-8 useful sections. Keep it tight enough for one A4 page.`;
  return { system, user };
}

function normaliseBrief(raw: unknown, type: BriefType): Brief {
  const record = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const sections = Array.isArray(record.sections) ? record.sections : [];
  return {
    title: String(record.title || `${type} brief`).trim().slice(0, 200),
    eyebrow: String(record.eyebrow || `${type} brief`).trim().slice(0, 120),
    sections: sections
      .slice(0, 8)
      .map((section) => {
        const item = (section && typeof section === "object" ? section : {}) as Record<string, unknown>;
        return {
          heading: String(item.heading || "section").trim().slice(0, 120),
          body: String(item.body || "").trim().slice(0, 2000),
        };
      })
      .filter((section) => section.body),
    signature: String(record.signature || "prepared in browser · human review recommended")
      .trim()
      .slice(0, 160),
  };
}

/** Tolerant parse: plain JSON, fenced JSON, or the first object in the text. */
function parseBrief(text: string, type: BriefType): Brief | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  try {
    const brief = normaliseBrief(JSON.parse(cleaned), type);
    if (brief.sections.length) return brief;
  } catch {
    /* fall through to object extraction */
  }
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const brief = normaliseBrief(JSON.parse(match[0]), type);
      if (brief.sections.length) return brief;
    } catch {
      /* fall through to null */
    }
  }
  return null;
}

/** Deterministic fallback: assemble the brief straight from the filled fields. */
function fallbackBrief(payload: Payload): Brief {
  const fieldSet = BRIEF_FIELD_SETS[payload.type];
  const sections = fieldSet
    .filter(([id]) => payload.fields[id])
    .map(([id, label]) => ({ heading: label, body: payload.fields[id] }))
    .slice(0, 8);
  return {
    title: payload.fields.projectName || `${payload.type} brief`,
    eyebrow: `${payload.type} brief`,
    sections,
    signature: "prepared in browser · human review recommended",
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const type: BriefType = BRIEF_TYPES.includes(body?.type) ? body.type : "creative";
  const fieldSet = BRIEF_FIELD_SETS[type];

  const fields: Record<string, string> = {};
  for (const [id] of fieldSet) {
    fields[id] = String(body?.fields?.[id] ?? "").trim().slice(0, 2000);
  }
  const filled = Object.values(fields).filter(Boolean);
  if (filled.length < 4) {
    return NextResponse.json(
      { error: "Fill at least four brief fields before generating." },
      { status: 400 },
    );
  }

  const payload: Payload = { type, fields };

  // Access gate — assembl pays for the model call (anon: 1 free; email lifts it).
  const verdict = await gate(req, "hapai", "brief-generator");
  if (!verdict.allowed) return gateBlockedResponse(verdict);

  const prompt = buildPrompt(payload);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "auaha",
          message: prompt.user,
          systemPromptOverride: prompt.system,
          sessionId: crypto.randomUUID(),
          maxTokens: 1400,
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        const brief = parseBrief(data.response, type);
        if (brief) {
          return NextResponse.json({ brief });
        }
      }
    }
  } catch (err) {
    console.error("[hapai/brief-generator] generation failed", err);
  }

  return NextResponse.json({ brief: fallbackBrief(payload) });
}
