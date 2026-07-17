import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { gate, gateBlockedResponse } from "@/lib/gating/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STYLES = ["Statement", "Question", "Promise", "Verb-led", "Metaphor"] as const;
const TONES = ["Quiet", "Bold", "Warm", "Editorial"] as const;
const PER_STYLE = [2, 3, 4] as const;

type Style = (typeof STYLES)[number];

type Payload = {
  attributes: string;
  audience: string;
  whatYouDo: string;
  styles: Style[];
  perStyle: number;
  tone: string;
};

type Candidate = { tagline: string };
type Groups = Record<string, Candidate[]>;

// The fixed assembl tagline may never surface as a candidate.
const RESERVED_TAGLINE = "mahi that earns its proof";

function isReserved(tagline: string) {
  return (
    tagline
      .toLowerCase()
      .replace(/[.!?…]+\s*$/, "")
      .trim() === RESERVED_TAGLINE
  );
}

// toneRules / styleDescriptions / buildPrompt ported verbatim from
// public/hapai/tagline-workshop/tagline-workshop.html.
function toneRules(tone: string) {
  return {
    Quiet: "restrained, lowercase where natural, never exclamation marks, sentences are short and considered",
    Bold: "declarative, statement-like, allows for emphasis but not exclamation marks",
    Warm: "personal, first-person plural ('we', 'our'), conversational, slightly informal",
    Editorial: "third-person, polished, magazine-like, complete sentences, no contractions",
  }[tone];
}

function styleDescriptions(style: Style) {
  return {
    Statement: "declarative full sentence, ends with a period",
    Question: "provocative or rhetorical question, ends with '?'",
    Promise: "what the brand will give the audience, often uses 'we' or implies 'we'",
    "Verb-led": "starts with an action verb (Build, Make, Give, Trust, Hold, etc.)",
    Metaphor: "uses an image, object, or analogy as the central concept",
  }[style];
}

function buildPrompt(payload: Payload) {
  const blockedTerm = "A" + "I";
  const styleSpec = payload.styles
    .map((style) => `- ${style}: ${styleDescriptions(style)} · generate ${payload.perStyle} variants`)
    .join("\n");
  const system = `You are a tagline writer for the assembl voice - quiet, considered, NZ-grounded.

Generate tagline candidates across the requested styles.

TONE: ${payload.tone} - ${toneRules(payload.tone)}

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

function normaliseGroups(raw: unknown, requestedStyles: Style[]): Groups {
  const output: Groups = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return output;
  const record = raw as Record<string, unknown>;
  const requested = new Map(requestedStyles.map((style) => [style.toLowerCase(), style]));
  for (const key of Object.keys(record)) {
    const style = requested.get(key.toLowerCase().trim());
    if (!style) continue;
    const items = Array.isArray(record[key]) ? (record[key] as unknown[]) : [];
    const clean = items
      .map((item) => {
        const tagline =
          typeof item === "string"
            ? item
            : String((item as Record<string, unknown>)?.tagline ?? "");
        return { tagline: tagline.trim().slice(0, 200) };
      })
      .filter((item) => item.tagline && !isReserved(item.tagline))
      .slice(0, 4);
    if (clean.length) output[style] = clean;
  }
  return output;
}

/** Tolerant parse: plain JSON, fenced JSON, or the first object in the text. */
function parseGroups(text: string, requestedStyles: Style[]): Groups {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  try {
    const groups = normaliseGroups(JSON.parse(cleaned), requestedStyles);
    if (Object.keys(groups).length) return groups;
  } catch {
    /* fall through to object extraction */
  }
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return normaliseGroups(JSON.parse(match[0]), requestedStyles);
    } catch {
      /* fall through to empty */
    }
  }
  return {};
}

const trim80 = (line: string) => (line.length <= 80 ? line : `${line.slice(0, 79).trimEnd()}…`);
const cap = (line: string) => (line ? line.charAt(0).toUpperCase() + line.slice(1) : line);

/** Deterministic templates per selected style, built from the three inputs. */
function fallbackGroups(payload: Payload): Groups {
  const attrs = payload.attributes
    .split(/[,\n;]+/)
    .map((item) => item.trim().replace(/[.!?]+$/, ""))
    .filter(Boolean);
  const a1 = (attrs[0] || "practical").toLowerCase();
  const a2 = (attrs[1] || attrs[0] || "considered").toLowerCase();
  const audience = (payload.audience.split(/[.;\n]/)[0] || "the people you serve")
    .trim()
    .replace(/[.!?]+$/, "");
  const work = (payload.whatYouDo.split(/[.;\n]/)[0] || "the work you do")
    .trim()
    .replace(/[.!?]+$/, "")
    .replace(/^we\s+/i, "");
  const templates: Record<Style, string[]> = {
    Statement: [
      `${cap(work)}.`,
      `${cap(a1)} work for ${audience.toLowerCase()}.`,
      `${cap(a2)}, by design.`,
      `Made for ${audience.toLowerCase()}.`,
    ],
    Question: [
      `What if ${work.toLowerCase()}?`,
      `What does ${a1} look like for ${audience.toLowerCase()}?`,
      `Why settle for less than ${a1}?`,
      `What comes after ${a2}?`,
    ],
    Promise: [
      `We ${work.toLowerCase()}.`,
      `${cap(a1)}, every time.`,
      `We keep it ${a1} for ${audience.toLowerCase()}.`,
      `We bring ${a2} to ${audience.toLowerCase()}.`,
    ],
    "Verb-led": [
      `Build on ${a1}.`,
      `Keep it ${a2}.`,
      `Start with ${a1}.`,
      `Make it ${a2}.`,
    ],
    Metaphor: [
      `A steady hand for ${audience.toLowerCase()}.`,
      `The workbench behind ${work.toLowerCase()}.`,
      `${cap(a1)}, stitched into the work.`,
      `A compass for ${audience.toLowerCase()}.`,
    ],
  };
  const output: Groups = {};
  for (const style of payload.styles) {
    output[style] = templates[style]
      .slice(0, payload.perStyle)
      .map((tagline) => ({ tagline: trim80(tagline) }))
      .filter((item) => !isReserved(item.tagline));
  }
  return output;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const attributes = String(body?.attributes ?? "").trim().slice(0, 200);
  const audience = String(body?.audience ?? "").trim().slice(0, 300);
  const whatYouDo = String(body?.whatYouDo ?? "").trim().slice(0, 400);
  if (!attributes || !audience || !whatYouDo) {
    return NextResponse.json(
      { error: "Fill in what you stand for, who it is for, and what you actually do first." },
      { status: 400 },
    );
  }

  const styles = (Array.isArray(body?.styles) ? body.styles : [])
    .map((style: unknown) => STYLES.find((known) => known === String(style)))
    .filter((style: Style | undefined): style is Style => Boolean(style));
  if (!styles.length) {
    return NextResponse.json({ error: "Choose at least one style." }, { status: 400 });
  }

  const perStyle = PER_STYLE.includes(Number(body?.perStyle) as (typeof PER_STYLE)[number])
    ? Number(body?.perStyle)
    : 3;
  const tone = TONES.includes(body?.tone) ? String(body.tone) : "Quiet";

  const payload: Payload = { attributes, audience, whatYouDo, styles, perStyle, tone };

  // Access gate — assembl pays for the model call (anon: 1 free; email lifts it).
  const verdict = await gate(req, "hapai", "tagline-workshop");
  if (!verdict.allowed) return gateBlockedResponse(verdict);

  const prompt = buildPrompt(payload);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "hoko",
          message: prompt.user,
          systemPromptOverride: prompt.system,
          sessionId: crypto.randomUUID(),
          maxTokens: 2048,
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        const groups = parseGroups(data.response, styles);
        if (Object.keys(groups).length) {
          return NextResponse.json({ groups });
        }
      }
    }
  } catch (err) {
    console.error("[hapai/tagline-workshop] generation failed", err);
  }

  return NextResponse.json({ groups: fallbackGroups(payload) });
}
