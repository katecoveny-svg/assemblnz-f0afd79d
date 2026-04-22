// ═══════════════════════════════════════════════════════════════
// Tōro — Learning Game Generator
// Produces a short, fun, NZC-aligned learning mini-game tailored
// to a child's year level + subject (optionally with a homework
// photo for context). Returns structured JSON via tool calling.
// ═══════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type GamePart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } };

interface ReqBody {
  childName?: string;
  yearLevel?: string;
  subject?: string;
  nzcLevel?: string;
  topicHint?: string;
  imageDataUrl?: string; // optional homework photo
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const SYSTEM_PROMPT = `You are Tōro's Learning Games designer for Aotearoa New Zealand whānau.

Build a SHORT, FUN, age-appropriate learning mini-game that helps a child practise the topic from their homework. Always:
- Honour the New Zealand Curriculum (NZC) level provided.
- Use simple, kind, encouraging tone — never patronising.
- Mix te reo Māori sparingly and correctly (e.g. "ka pai", "tino pai") — never invent words.
- Keep questions short, single-concept, solvable in <30 seconds each.
- For multiple-choice questions, include exactly 4 options and ONE correct answer.
- Provide a 1-sentence "celebration" line for the end.
- Prefer NZ context (kūmara, hāngī, kiwi, Aoraki, kāinga) where natural — never forced.
- NEVER include personal data, surnames, addresses, school names, or anything identifying.
- If a worksheet image is supplied, base the game on the same skill but use NEW examples — do NOT copy the worksheet questions verbatim.

Return your game ONLY by calling the build_game tool.`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "build_game",
    description: "Return a structured Tōro learning mini-game.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short fun game title (max 60 chars)." },
        intro: { type: "string", description: "1-sentence kid-facing intro (max 140 chars)." },
        skill_focus: { type: "string", description: "Plain-English description of the skill being practised." },
        nzc_level: { type: "string", description: "NZC level being targeted, e.g. '3'." },
        questions: {
          type: "array",
          minItems: 4,
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["multiple_choice", "fill_blank", "true_false"] },
              prompt: { type: "string" },
              options: {
                type: "array",
                items: { type: "string" },
                description: "4 options for multiple_choice; 2 (True/False) for true_false; omit for fill_blank.",
              },
              answer: { type: "string", description: "Correct answer (must exactly match one option for MC/TF)." },
              explanation: { type: "string", description: "1-sentence why-it's-correct explanation." },
              hint: { type: "string", description: "Gentle one-line nudge — used as the first hint." },
              hints: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string" },
                description:
                  "Three progressive hints that get more specific: Hint 1 = gentle nudge / what to think about; Hint 2 = a strategy or partial working; Hint 3 = strong scaffold that almost gives the answer without stating it. Each ≤ 110 chars, kid-friendly.",
              },
            },
            required: ["kind", "prompt", "answer", "explanation", "hint", "hints"],
            additionalProperties: false,
          },
        },
        celebration: { type: "string", description: "1-sentence end-of-game celebration line." },
      },
      required: ["title", "intro", "skill_focus", "nzc_level", "questions", "celebration"],
      additionalProperties: false,
    },
  },
};

function approxBytesFromDataUrl(dataUrl: string): number {
  const i = dataUrl.indexOf(",");
  if (i < 0) return dataUrl.length;
  const b64 = dataUrl.slice(i + 1);
  // 4 base64 chars -> 3 bytes
  return Math.floor((b64.length * 3) / 4);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: ReqBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const childName = (body.childName ?? "the tamaiti").toString().slice(0, 60);
  const yearLevel = (body.yearLevel ?? "").toString().slice(0, 12);
  const subject = (body.subject ?? "general").toString().slice(0, 40);
  const nzcLevel = (body.nzcLevel ?? "").toString().slice(0, 12);
  const topicHint = (body.topicHint ?? "").toString().slice(0, 400);
  const imageDataUrl = body.imageDataUrl;

  if (imageDataUrl) {
    if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
      return new Response(JSON.stringify({ error: "imageDataUrl must be a data:image/* URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (approxBytesFromDataUrl(imageDataUrl) > MAX_IMAGE_BYTES) {
      return new Response(JSON.stringify({ error: "Image is over 5 MB" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── Pre-pass: if we have a worksheet photo and no strong topic hint,
  //    extract a short skill/topic label so the game stays consistent
  //    even when the parent didn't type anything.
  let extractedLabel: string | null = null;
  const hintIsThin = !topicHint || topicHint.trim().length < 8;
  if (imageDataUrl && hintIsThin) {
    try {
      const labelResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You label NZ school homework worksheets. Reply with a SHORT skill/topic label only " +
                "(max 8 words, plain English, no punctuation, no quotes). " +
                "Examples: 'two-digit addition with regrouping', 'fractions of a whole', " +
                "'simple past tense verbs', 'plant life cycle'. " +
                "If unsure, reply 'general practice'.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Subject hint: ${subject}. What skill is this worksheet practising?` },
                { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
              ],
            },
          ],
          max_tokens: 40,
        }),
      });
      if (labelResp.ok) {
        const j = await labelResp.json();
        const raw = (j?.choices?.[0]?.message?.content ?? "").toString().trim();
        // Clean: strip quotes, trailing periods, collapse whitespace, cap length.
        const cleaned = raw.replace(/^["'`]+|["'`.]+$/g, "").replace(/\s+/g, " ").slice(0, 80);
        if (cleaned && cleaned.toLowerCase() !== "general practice") {
          extractedLabel = cleaned;
        }
      } else {
        console.warn("Label extraction non-OK", labelResp.status);
      }
    } catch (e) {
      // Non-fatal — fall through to topic-less generation.
      console.warn("Label extraction failed", (e as Error).message);
    }
  }

  const effectiveTopic = topicHint || extractedLabel || "";

  const userParts: GamePart[] = [];
  const ctx = [
    `Child: ${childName}`,
    yearLevel ? `Year level: ${yearLevel}` : null,
    `Subject: ${subject}`,
    nzcLevel ? `NZC level: ${nzcLevel}` : null,
    effectiveTopic ? `Topic / what we're practising: ${effectiveTopic}` : null,
    extractedLabel && !topicHint
      ? `(This topic was auto-detected from the attached worksheet photo — keep the game tightly aligned to it.)`
      : null,
    imageDataUrl ? "A photo of the homework worksheet is attached for context." : null,
    "Please design a fun 5-question mini-game that practises this skill.",
  ]
    .filter(Boolean)
    .join("\n");
  userParts.push({ type: "text", text: ctx });
  if (imageDataUrl) userParts.push({ type: "image_url", image_url: { url: imageDataUrl, detail: "high" } });

  try {
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userParts },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "build_game" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Tōro is busy — try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Top up at Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "Could not generate the game right now." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = call?.function?.arguments;
    if (!argsStr) {
      console.error("No tool call in response", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "Game generation failed (no structured output)." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let game: unknown;
    try {
      game = JSON.parse(argsStr);
    } catch (e) {
      console.error("Failed to parse game JSON", e, argsStr.slice(0, 500));
      return new Response(JSON.stringify({ error: "Game generation failed (bad JSON)." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        game,
        detected_topic: extractedLabel,
        topic_source: topicHint
          ? "user"
          : extractedLabel
            ? "image"
            : "none",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("toro-learning-game error", e);
    return new Response(JSON.stringify({ error: (e as Error).message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
