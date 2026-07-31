// Cloudflare Pages Function — POST /api/fridge
//
// Kate, 31 July 2026: "upload a picture of their fridge and the smart shopper
// literally visually assembles the list … uses the wait state to ask customer
// questions for value and the customer is rewarded."
//
// Same camera-vision pipeline as Room Check and the Ryman furniture read, tuned
// to a fridge: the shopper photographs the inside of their fridge, opus-5 reads
// what is there and what is running low, and comes back with a draft list plus
// ONE question worth asking — the value exchange the whole concept runs on.
//
// Register rules, same as the rest of the fleet: it estimates, it says how sure
// it is, it names what a photo cannot settle, and everything it drafts is held
// for a person. The photo is read once in this request and never stored.
// No key → honest 503; the page falls back to its scripted demonstration.

const MODEL = "claude-opus-5";
const MAX_IMAGES = 3;
const MAX_BYTES = 5 * 1024 * 1024;

export async function onRequestGet(context) {
  const k = context.env.ANTHROPIC_API_KEY ?? "";
  return new Response(JSON.stringify({
    model: MODEL,
    anthropic_key_present: Boolean(k),
    max_images: MAX_IMAGES,
  }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

const TOOL = {
  name: "fridge_read",
  description: "A rough, honest read of a domestic fridge (or pantry) photo for drafting a grocery list. Estimates only — never invent items you cannot see.",
  input_schema: {
    type: "object",
    required: ["seen", "low_or_out", "one_question", "confidence", "cannot_tell"],
    properties: {
      seen: {
        type: "array",
        description: "Items clearly visible and in reasonable supply. Plain grocery names ('milk', 'eggs', 'cheddar cheese').",
        items: { type: "string" },
      },
      low_or_out: {
        type: "array",
        description: "Items visibly running low, nearly empty, or conspicuously absent for a normal NZ household fridge (milk, butter, eggs, greens). Only include an absence when the photo genuinely supports it.",
        items: {
          type: "object",
          required: ["name", "why"],
          properties: {
            name: { type: "string", description: "Plain grocery name, e.g. 'milk', 'butter'." },
            why: { type: "string", description: "Very short reason from the photo — 'bottle a quarter full', 'no butter visible on the door'." },
          },
        },
      },
      one_question: {
        type: "object",
        required: ["q", "options"],
        description: "The single most useful question to ask this shopper, grounded in the photo. Short, warm, answerable in one tap.",
        properties: {
          q: { type: "string", description: "e.g. 'Milk looked low — big weekly shop or a top-up?'" },
          options: { type: "array", minItems: 2, maxItems: 2, items: { type: "string" }, description: "Exactly two short answers." },
        },
      },
      confidence: { type: "string", enum: ["low", "medium", "high"] },
      cannot_tell: {
        type: "array",
        description: "What this photo cannot settle — drawers you cannot see into, use-by dates, freezer contents.",
        items: { type: "string" },
      },
    },
  },
};

const SYSTEM = `You read a photo of the inside of a household fridge (or pantry) for a New Zealand grocery concept. Be warm, brief and honest. Never invent an item you cannot see; absences must be genuinely supportable from the photo. If the photo is not a fridge or pantry, say so via low confidence, an empty low_or_out list, and cannot_tell explaining what you saw instead. Do not read brands into blurry packaging. Call fridge_read exactly once.`;

const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { "content-type": "application/json", "cache-control": "no-store" },
});

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) return json({ error: "no vision backend configured" }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }
  const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];
  if (!images.length) return json({ error: "no images" }, 400);
  for (const im of images) {
    if (!im || typeof im.data !== "string" || !/^image\/(jpeg|png|webp)$/.test(im.media_type || "")) {
      return json({ error: "images need media_type image/jpeg, image/png or image/webp and base64 data" }, 400);
    }
    if (im.data.length * 0.75 > MAX_BYTES) return json({ error: "one image is over 5 MB" }, 413);
  }

  const content = [
    ...images.map((im) => ({ type: "image", source: { type: "base64", media_type: im.media_type, data: im.data } })),
    { type: "text", text: `${images.length} photo${images.length === 1 ? "" : "s"} of a shopper's fridge. Read it and call fridge_read once.` },
  ];

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1400,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "fridge_read" },
        messages: [{ role: "user", content }],
      }),
    });
    const j = await r.json();
    // opus-5 leads with a thinking block — find the tool_use, never content[0]
    const use = (j.content || []).find((b) => b && b.type === "tool_use");
    if (!use || !use.input) return json({ error: "no read", detail: (j.error && j.error.type) || r.status }, 502);
    return json({ read: use.input });
  } catch (e) {
    return json({ error: "vision call failed" }, 502);
  }
}
