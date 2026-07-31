// Cloudflare Pages Function — POST /api/room
//
// Kate, 2 Aug 2026: "can you build both" — the room-read, Summerset edition.
//
// Same vision pipeline as the Ryman furniture read and the free Room Check
// tool: the family photographs the lounge as it is, opus-5 reads the furniture,
// sizes each piece roughly, and points out what a photo can and cannot settle.
//
// One deliberate difference from the Ryman page: THAT page publishes a villa
// living room of 6.0 × 5.4 m, so its read compares against it. This page does
// not publish apartment dimensions — so this read never invents one. It hands
// the family a total and sends it to the plan of the apartment they are
// considering, with a person. Honest > impressive.
//
// The photo is read once in this request and never stored. No key → honest 503.

const MODEL = "claude-opus-5";
const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

export async function onRequestGet(context) {
  const k = context.env.ANTHROPIC_API_KEY ?? "";
  return new Response(JSON.stringify({
    model: MODEL,
    anthropic_key_present: Boolean(k),
    compares_against: "the plan of the apartment being considered — no dimensions are guessed here",
    max_images: MAX_IMAGES,
  }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

const TOOL = {
  name: "furniture_read",
  description: "A rough estimate of the furniture in a photo of a room, for a family working out what comes to a new apartment.",
  input_schema: {
    type: "object",
    required: ["items", "total_footprint_m2", "what_i_saw", "confidence", "reasoning", "cannot_tell"],
    properties: {
      items: {
        type: "array",
        description: "Each substantial piece of furniture you can see, with a rough floor footprint in square metres.",
        items: {
          type: "object",
          required: ["name", "footprint_m2"],
          properties: {
            name: { type: "string", description: "Plain name — 'three-seater sofa', 'sideboard', 'armchair'." },
            footprint_m2: { type: "number", description: "Rough floor area it occupies, m². A three-seater sofa is ~1.8, an armchair ~0.6, a sideboard ~0.8." },
            box: {
              type: "object",
              description: "Rough bounding box of the piece as PERCENTAGES of the whole image: x/y top-left, w/h size, integers 0-100. Omit if you cannot place it.",
              required: ["x", "y", "w", "h"],
              properties: { x: { type: "integer" }, y: { type: "integer" }, w: { type: "integer" }, h: { type: "integer" } },
            },
          },
        },
      },
      flags: {
        type: "array",
        description: "Movement observations a family would want pointed out, from the photo only: a clear doorway, a lifted rug corner, a tight lane between pieces. Plain observations — never medical or care advice. Include a box where you can.",
        items: {
          type: "object",
          required: ["note", "kind"],
          properties: {
            note: { type: "string" },
            kind: { type: "string", enum: ["clear", "care"] },
            box: {
              type: "object", required: ["x", "y", "w", "h"],
              properties: { x: { type: "integer" }, y: { type: "integer" }, w: { type: "integer" }, h: { type: "integer" } },
            },
          },
        },
      },
      total_footprint_m2: { type: "number", description: "Sum of the item footprints, m²." },
      what_i_saw: { type: "string", description: "One or two warm, plain sentences describing the room as a person would. This is someone's home — read it kindly." },
      confidence: { type: "string", enum: ["low", "medium", "high"], description: "Under-claim. One phone photo of one corner is low." },
      reasoning: { type: "string", description: "How you sized things — name the reference objects (a sofa seat ~0.5 m deep, a doorway ~0.8 m wide)." },
      cannot_tell: { type: "array", description: "What a photo genuinely cannot settle. Be generous with this list.", items: { type: "string" } },
    },
  },
};

const SYSTEM = `You help a family work out what furniture comes with them to a
retirement-village apartment they are considering. They have uploaded a photo of
the current lounge.

Be warm and be honest. This is one of the most emotional decisions a family
makes, and the room in the photo is someone's home. Read it kindly.

Estimate the floor footprint of each substantial piece using objects of known
size as your scale — a sofa seat is about 0.5 m deep, a dining chair about
0.45 m, a doorway about 0.8 m wide. Name what you used. Under-claim your
confidence, and put everything a photo cannot settle into cannot_tell.

You do NOT know the apartment's dimensions, and you never invent them. The
total you produce goes against the plan of the actual apartment, with a person.

For each piece include a rough box as percentages of the whole image where you
can place it. Add flags for movement observations only — a clear doorway, a
lifted rug corner, a tight lane. Observations from the photo, never medical or
care advice.`;

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

  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "This page cannot read photos right now. Everything else works, and assembl@assembl.co.nz reaches a person." }, 503);
  }

  const content = [
    ...images.map((im) => ({ type: "image", source: { type: "base64", media_type: im.media_type, data: im.data } })),
    { type: "text", text: `${images.length} photo${images.length === 1 ? "" : "s"} of the family's current lounge. Read the furniture and call furniture_read once.` },
  ];

  let est;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "furniture_read" },
        messages: [{ role: "user", content }],
      }),
    });
    if (!res.ok) return json({ error: "The reader did not answer just now. Try one clear photo of the whole room." }, 502);
    const j = await res.json();
    // opus-5 emits a thinking block first, so never take content[0]
    const use = (j.content || []).find((b) => b && b.type === "tool_use");
    if (!use) return json({ error: "The reader came back empty. Try another photo." }, 502);
    est = use.input;
  } catch {
    return json({ error: "The reader is not reachable from this page right now." }, 502);
  }

  const total = Math.round((Math.max(0, Number(est.total_footprint_m2) || 0)) * 10) / 10;
  return json({
    estimate: est,
    guide: {
      total_m2: total,
      line: `Their things come to roughly ${total} m² of floor. Take that number to the plan of the apartment you are considering — a person walks it with you, room by room.`,
      measure: "This is a read from a photo, not a measurement. Before anything moves, measure the two biggest pieces and the width of every doorway they travel through.",
      held: "Nothing here is sent, saved or booked. It is a draft for the family, and for a person to check with you.",
    },
  });
}
