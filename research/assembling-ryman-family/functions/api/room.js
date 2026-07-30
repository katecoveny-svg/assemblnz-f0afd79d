// Cloudflare Pages Function — POST /api/room
//
// Kate, 30 July 2026: "the ryman demo - can you add photo upload so the family
// can upload their images?"
//
// The page already poses the question — the 3D villa is captioned "Will her
// dining table fit?" with a living room measured at 6.0 × 5.4 m. This closes
// that loop: the family uploads a photo of Mum's current living room, an agent
// reads the furniture in it and answers, honestly, whether it fits the villa.
//
// The register of this whole page is the register here: it estimates, it says
// how sure it is, it tells you what a photo cannot settle, and it never gives a
// family a flat "no". A photograph is a rough read of a room, so the answer is a
// starting point for a tape measure, held for a person — not a verdict.
//
// Same vision pipeline as the free Room Check tool, tuned from Building-Code
// compliance to a much softer question. Uses ANTHROPIC_API_KEY (present on this
// project); no key means an honest 503 rather than a wrong guess.

const MODEL = "claude-opus-5";
const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

// The villa living room the page already shows, in metres.
const ROOM = { length: 6.0, width: 5.4 };
const ROOM_AREA = ROOM.length * ROOM.width; // 32.4 m²
// Furniture never uses the whole floor — you need to walk, and a walker needs
// more. Treat a bit over half the room as the comfortable furniture budget.
const COMFY = ROOM_AREA * 0.55; // ~17.8 m²
const SNUG = ROOM_AREA * 0.72;  // ~23.3 m²

export async function onRequestGet(context) {
  const k = context.env.ANTHROPIC_API_KEY ?? "";
  return new Response(JSON.stringify({
    model: MODEL,
    anthropic_key_present: Boolean(k),
    room_m: ROOM,
    room_area_m2: Math.round(ROOM_AREA * 10) / 10,
    max_images: MAX_IMAGES,
  }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

const TOOL = {
  name: "furniture_read",
  description: "A rough estimate of the furniture in a photo of a room, for a family working out whether it will fit a new home.",
  input_schema: {
    type: "object",
    required: ["items", "total_footprint_m2", "what_i_saw", "confidence", "reasoning", "cannot_tell"],
    properties: {
      items: {
        type: "array",
        description: "Each substantial piece of furniture you can see, with a rough floor footprint in square metres (length × depth of the piece as it sits on the floor).",
        items: {
          type: "object",
          required: ["name", "footprint_m2"],
          properties: {
            name: { type: "string", description: "Plain name — 'three-seater sofa', 'sideboard', 'armchair', 'dining table for four'." },
            footprint_m2: { type: "number", description: "Rough floor area it occupies, m². A three-seater sofa is ~1.8, an armchair ~0.6, a dining table for four ~1.6, a sideboard ~0.8." },
          },
        },
      },
      total_footprint_m2: { type: "number", description: "Sum of the item footprints, m²." },
      what_i_saw: { type: "string", description: "One or two warm, plain sentences describing the room as a person would — not a list. This is Mum's living room, so read it kindly." },
      confidence: { type: "string", enum: ["low", "medium", "high"], description: "How sure you are of the footprint total. A wide-angle phone photo of one corner is low; a clear shot of the whole room is medium at best. Under-claim." },
      reasoning: { type: "string", description: "How you sized things — name the reference objects (a sofa seat is ~0.5 m deep, a doorway ~0.8 m wide, a standard dining chair ~0.45 m). One or two sentences." },
      cannot_tell: { type: "array", description: "What a photo genuinely cannot settle — pieces out of frame, whether a table has leaves, the real width of a doorway the furniture has to pass through. Be willing to make this list honest and long.", items: { type: "string" } },
    },
  },
};

const SYSTEM = `You help a family work out whether their mother's furniture will
fit a retirement-village living room that measures 6.0 by 5.4 metres (about 32
square metres). They have uploaded a photo of her current living room.

Be warm and be honest. This is one of the most emotional decisions a family
makes, and the room in the photo is someone's home. Read it kindly.

Estimate the floor footprint of each substantial piece using objects of known
size as your scale — a sofa seat is about 0.5 m deep, a dining chair about
0.45 m, a doorway about 0.8 m wide, a skirting board 60–100 mm. Name what you
used.

Under-claim your confidence. A phone photo flattens a room and hides whatever is
behind the camera, so a single shot of one corner is low confidence at best. Put
everything a photo cannot settle into cannot_tell, and be generous with that
list — pieces out of frame, whether a table extends, and above all the width of
the doorways the furniture has to travel through to get into the villa.

You are producing a starting point for a tape measure, not a ruling. Never tell a
family their mother's things definitely will not fit. If the furniture is a lot
for the room, say it is worth measuring and that a villa has more than one room.`;

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
    { type: "text", text: `${images.length} photo${images.length === 1 ? "" : "s"} of the family's current living room. Read the furniture and call furniture_read once.` },
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

  return json({ estimate: est, fit: fit(est), room: ROOM });
}

/** The verdict. Never a flat no; always a next step. */
function fit(e) {
  const total = Math.max(0, Number(e.total_footprint_m2) || 0);
  const r1 = (n) => Math.round(n * 10) / 10;
  let verdict, line;
  if (total <= COMFY) {
    verdict = "fits";
    line = `Her things come to roughly ${r1(total)} m² of floor, and the villa living room is ${r1(ROOM_AREA)} m². That is room to spare — the sofa, the chair and the sideboard, with space to move around them.`;
  } else if (total <= SNUG) {
    verdict = "snug";
    line = `Her things come to roughly ${r1(total)} m² against the room's ${r1(ROOM_AREA)} m². It fits, but it will feel full — worth deciding now which one piece stays in the family rather than working it out on moving day.`;
  } else {
    verdict = "tight";
    line = `Her things come to roughly ${r1(total)} m², and this one room is ${r1(ROOM_AREA)} m². That is a lot for the living room — but a villa is more than one room, and a couple of pieces finding a home in the bedroom or with family usually settles it. Worth measuring before you decide anything.`;
  }
  return {
    verdict,
    line,
    total_m2: r1(total),
    room_m2: r1(ROOM_AREA),
    // the honest footer, on every result
    measure: "This is a read from a photo, not a measurement. Before anything is moved, measure the two seats and the sideboard, and — the thing that catches people out — the width of the doorways they have to pass through.",
    held: "Nothing here is sent, saved or booked. It is a draft for the family, and for an advisor to check with you.",
  };
}

function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
