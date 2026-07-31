// Cloudflare Pages Function — POST /api/lot
//
// Kate, 2 Aug 2026: "can you build both" — the lot-read.
//
// A dealer photographs a car on the lot (or hands over a scan render — this
// page is built on scans). opus-5 reads the shape: body style, era or family
// the silhouette suggests, finish, the details worth noticing — and drafts two
// or three listing lines in the house voice. Premium minimal. The product
// speaks; the copy stays out of its way.
//
// What this read REFUSES to do, by design:
//   - no price or value estimate (a photo cannot price a car; a person prices)
//   - no VIN, year or spec claims (identification is "reads as", never "is")
//   - nothing publishes — every line is a draft until a person signs it.
//
// The photo is read once in this request and never stored. No key → honest 503.

const MODEL = "claude-opus-5";
const MAX_IMAGES = 3;
const MAX_BYTES = 5 * 1024 * 1024;

export async function onRequestGet(context) {
  const k = context.env.ANTHROPIC_API_KEY ?? "";
  return new Response(JSON.stringify({
    model: MODEL,
    anthropic_key_present: Boolean(k),
    refuses: ["price estimates", "VIN or year claims", "publishing — a person signs"],
    max_images: MAX_IMAGES,
  }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

const TOOL = {
  name: "lot_read",
  description: "An honest read of a vehicle photo (or scan render) for a dealership listing draft. Identification is always a hedge — 'reads as' — never a certainty. Never estimate a price or a year.",
  input_schema: {
    type: "object",
    required: ["silhouette", "read_source", "campaign", "confidence", "cannot_tell"],
    properties: {
      silhouette: {
        type: "object",
        required: ["body", "reads_as", "finish"],
        properties: {
          body: { type: "string", description: "Plain body style — 'two-door coupé', 'estate', 'SUV', 'roadster'." },
          reads_as: { type: "string", description: "What the shape suggests, hedged — 'reads as a classic 356-era coupé', 'reads as a modern performance estate'. Never a flat claim." },
          finish: { type: "string", description: "What you can actually see — 'dark metallic, studio light', 'gold point-cloud render on black'." },
          notable: { type: "array", items: { type: "string" }, description: "2-4 details worth a buyer's eye — 'long bonnet', 'fastback tail'. Only what is visible." },
          box: {
            type: "object",
            description: "Bounding box of the vehicle as PERCENTAGES of the image: x/y top-left, w/h size, integers 0-100.",
            required: ["x", "y", "w", "h"],
            properties: { x: { type: "integer" }, y: { type: "integer" }, w: { type: "integer" }, h: { type: "integer" } },
          },
          detail_boxes: {
            type: "array",
            description: "Up to 3 labelled detail boxes (wheels, glasshouse, tail) as percentages.",
            items: {
              type: "object", required: ["label", "x", "y", "w", "h"],
              properties: { label: { type: "string" }, x: { type: "integer" }, y: { type: "integer" }, w: { type: "integer" }, h: { type: "integer" } },
            },
          },
        },
      },
      read_source: { type: "string", enum: ["photo", "scan render", "illustration", "unclear"], description: "Say honestly what kind of image this is." },
      campaign: {
        type: "array",
        minItems: 2, maxItems: 3,
        description: "Listing draft lines. Premium minimal: short, no exclamation marks, no invented specs, no price, no superlative pile-ups. The product speaks.",
        items: {
          type: "object", required: ["headline", "line"],
          properties: {
            headline: { type: "string", description: "Five words or fewer." },
            line: { type: "string", description: "One sentence under the headline. Only what the image supports." },
          },
        },
      },
      confidence: { type: "string", enum: ["low", "medium", "high"], description: "Under-claim. A single angle is medium at best; a render or illustration is low for identification." },
      cannot_tell: { type: "array", items: { type: "string" }, description: "What this image cannot settle — condition, interior, odometer, provenance. Be generous." },
    },
  },
};

const SYSTEM = `You read one vehicle image for a prestige dealership group's
listing desk. Voice: premium minimal — short lines, no exclamation marks, no
adjective pile-ups. The product speaks; the copy stays out of its way.

Hard rules. Never estimate a price or value. Never state a year, VIN or spec you
cannot see. Identification is always hedged as "reads as". If the image is a
scan render or an illustration, say so in read_source and keep identification
confidence low. If it is not a vehicle at all, say so plainly via cannot_tell
and give no campaign lines beyond one honest note.

Everything you produce is a draft. A person prices, a person signs, and nothing
publishes from this read. Call lot_read exactly once.`;

const json = (o, status = 200) => new Response(JSON.stringify(o), {
  status, headers: { "content-type": "application/json", "cache-control": "no-store" },
});

export async function onRequestPost(context) {
  const { request, env } = context;
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

  if (!env.ANTHROPIC_API_KEY) return json({ error: "no vision backend configured" }, 503);

  const content = [
    ...images.map((im) => ({ type: "image", source: { type: "base64", media_type: im.media_type, data: im.data } })),
    { type: "text", text: "One vehicle from the lot. Read it and call lot_read once." },
  ];

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1400,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "lot_read" },
        messages: [{ role: "user", content }],
      }),
    });
    const j = await r.json();
    // opus-5 leads with a thinking block — find the tool_use, never content[0]
    const use = (j.content || []).find((b) => b && b.type === "tool_use");
    if (!use || !use.input) return json({ error: "no read", detail: (j.error && j.error.type) || r.status }, 502);
    return json({ read: use.input });
  } catch {
    return json({ error: "vision call failed" }, 502);
  }
}
