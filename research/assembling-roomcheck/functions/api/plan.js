// Cloudflare Pages Function — POST /api/plan
//
// Photos of a room in, a measured model out, checked against the New Zealand
// Building Code clause G4 Ventilation.
//
// Kate, 30 July 2026: "a free shsarable standalone tool that takes unstructuresd
// photoss in from a builder or architect and then literally transforms it into a
// 3d model MEP mapped agaist the nz building code".
//
// WHAT THIS IS AND IS NOT
// It is an ESTIMATE from photographs. It is not a survey and it is not a
// compliance determination. The arithmetic downstream of the estimate is exact
// and the clauses are quoted verbatim, but the dimensions come from a model
// looking at pictures, so every figure carries its own confidence and the page
// says so in the first screen. A building consent authority grants consents;
// nothing here substitutes for that.
//
// THE CLAUSES IT CHECKS, all from G4/AS1 5th edition, 28 July 2025
//   2.2.1.2  natural ventilation of occupied spaces: net openable area of
//            windows or other openings to the outside of no less than 5% of the
//            floor area
//   2.2.2.2  kitchens, bathrooms, toilets, laundries and habitable spaces with
//            an external wall: the same 5%, or high level trickle ventilators,
//            AND a distance between the external wall and the opposing wall of
//            less than 6 metres
//   2.2.1.5  mechanical extract fans, including ducting: not less than 25 L/s
//            for showers and baths, and 50 L/s for cooktops
//
// The MEP part is computed from those rates rather than invented: a duct sized
// to carry the required flow, and its run drawn to the nearest external wall.

const MODEL = 'claude-opus-5';
const MAX_IMAGES = 6;
const MAX_BYTES = 5 * 1024 * 1024; // per image, before base64

/** Health check. Reports what is configured, never the key. */
export async function onRequestGet(context) {
  const k = context.env.ANTHROPIC_API_KEY ?? '';
  return Response.json({
    model: MODEL,
    anthropic_key_present: Boolean(k),
    key_length: k.length,
    max_images: MAX_IMAGES,
    checks: ['G4/AS1 2.2.1.2', 'G4/AS1 2.2.2.2', 'G4/AS1 2.2.1.5'],
    edition: 'G4/AS1 5th edition, 28 July 2025',
  });
}

const SCHEMA = {
  name: 'room_estimate',
  description: 'A dimensional estimate of one room, read from photographs.',
  input_schema: {
    type: 'object',
    required: ['room', 'length_m', 'width_m', 'height_m', 'openings', 'fixtures', 'confidence', 'reasoning', 'cannot_tell'],
    properties: {
      room: {
        type: 'string',
        enum: ['living', 'bedroom', 'kitchen', 'bathroom', 'laundry', 'toilet', 'hallway', 'garage', 'other'],
        description: 'What kind of room this is. Kitchens, bathrooms, laundries and toilets are treated differently by G4.',
      },
      length_m: { type: 'number', description: 'Longest internal horizontal dimension, in metres.' },
      width_m: { type: 'number', description: 'Internal dimension perpendicular to length, in metres.' },
      height_m: { type: 'number', description: 'Floor to ceiling, in metres. NZ domestic is usually 2.4 to 2.7.' },
      external_wall_to_opposing_m: {
        type: 'number',
        description: 'Distance from the wall containing the windows to the wall opposite it, in metres. G4/AS1 2.2.2.2 requires this to be under 6 m for the natural-ventilation route.',
      },
      openings: {
        type: 'array',
        description: 'Every window, external door or other opening to the OUTSIDE that can be opened. Internal doors do not count. Measure on the face dimensions of the openable element, per the G4 definition of net openable area.',
        items: {
          type: 'object',
          required: ['kind', 'width_m', 'height_m', 'openable_fraction', 'note'],
          properties: {
            kind: { type: 'string', enum: ['window', 'external_door', 'louvre', 'skylight', 'other'] },
            width_m: { type: 'number' },
            height_m: { type: 'number' },
            openable_fraction: {
              type: 'number',
              description: 'How much of that face area actually opens, 0 to 1. A fixed pane is 0. A pair of casements is close to 1. A single awning sash in a larger frame might be 0.3.',
            },
            note: { type: 'string', description: 'What you could see that led to this, in one short sentence.' },
          },
        },
      },
      fixtures: {
        type: 'array',
        description: 'Moisture-generating fixtures visible in the photos. G4/AS1 2.2.1.5 sets an extract rate for each.',
        items: { type: 'string', enum: ['cooktop', 'shower', 'bath', 'laundry_tub', 'washing_machine', 'dishwasher', 'none'] },
      },
      existing_extract: {
        type: 'string',
        enum: ['none_visible', 'ceiling_fan_visible', 'rangehood_visible', 'wall_vent_visible', 'cannot_tell'],
        description: 'Any existing mechanical extract you can see.',
      },
      confidence: {
        type: 'object',
        required: ['dimensions', 'openings', 'overall'],
        properties: {
          dimensions: { type: 'string', enum: ['low', 'medium', 'high'] },
          openings: { type: 'string', enum: ['low', 'medium', 'high'] },
          overall: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
      reasoning: {
        type: 'string',
        description: 'How you arrived at the dimensions. Name the reference objects you used: a standard NZ internal door leaf is about 1.98 m high and 0.76 to 0.86 m wide, a light switch sits about 1.0 to 1.2 m off the floor, a benchtop is about 0.9 m, a skirting board is 60 to 100 mm, a standard brick course is about 86 mm. Two or three sentences.',
      },
      cannot_tell: {
        type: 'array',
        description: 'Anything a photograph genuinely cannot establish and that a person has to measure or look up. Be specific and be willing to make this list long.',
        items: { type: 'string' },
      },
    },
  },
};

const SYSTEM = `You estimate room dimensions from photographs for a New Zealand
building ventilation check. You are careful, you show your working, and you say
what you cannot tell.

HOW TO ESTIMATE
Use objects of known size in the frame as your scale reference, and name which
ones you used. Reliable references in New Zealand houses:
  - internal door leaf: about 1.98 m high, 0.76 to 0.86 m wide
  - light switch centre: 1.0 to 1.2 m above floor
  - kitchen benchtop: about 0.9 m above floor
  - skirting board: 60 to 100 mm
  - standard brick course: about 86 mm including mortar
  - a stud wall on 600 mm centres, if framing is exposed
  - ceiling height in a NZ house built after 1970: usually 2.4 m, older villas
    2.7 to 3.6 m

NET OPENABLE AREA
Measure openings on the FACE dimensions of the openable element, which is how
G4/AS1 defines net openable area. Then set openable_fraction to the share that
actually opens. A fixed picture window is 0. Ranch sliders open roughly half
their width. Awning sashes in a larger frame are often 0.25 to 0.4. If you cannot
see the opening mechanism, say so in cannot_tell and use a conservative fraction.

BE HONEST
Under-claiming beats over-claiming. If the photo is dark, partial, wide-angle
distorted, or shows only one corner, set confidence low and say why. Wide-angle
phone lenses exaggerate depth: allow for it and mention it. If you cannot see a
window at all, return no openings rather than guessing at one.

Put anything a photograph cannot establish into cannot_tell. Real examples:
whether an existing fan actually achieves its rated flow, the duct length and
number of bends behind the ceiling, whether a window is restricted by a safety
stay, insulation R-values, and whether the wall you are looking at is external.

You are producing an estimate for a person to check. You are not certifying
anything.`;

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

  const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];
  if (!images.length) return json({ error: 'no images' }, 400);

  for (const im of images) {
    if (!im || typeof im.data !== 'string' || !/^image\/(jpeg|png|webp)$/.test(im.media_type || '')) {
      return json({ error: 'images need media_type image/jpeg, image/png or image/webp and base64 data' }, 400);
    }
    // base64 is about 4/3 of the raw bytes
    if (im.data.length * 0.75 > MAX_BYTES) return json({ error: 'one image is over 5 MB' }, 413);
  }

  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'no model configured on this deployment' }, 503);
  }

  const content = [
    ...images.map((im) => ({
      type: 'image',
      source: { type: 'base64', media_type: im.media_type, data: im.data },
    })),
    {
      type: 'text',
      text: (body.note ? `What the builder told us about this room: ${String(body.note).slice(0, 400)}\n\n` : '') +
        `Estimate this room and call room_estimate once. ${images.length} photograph${images.length === 1 ? '' : 's'} of the same room.`,
    },
  ];

  let est;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM,
        tools: [SCHEMA],
        tool_choice: { type: 'tool', name: 'room_estimate' },
        messages: [{ role: 'user', content }],
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return json({ error: 'model call failed', status: res.status, detail: detail.slice(0, 300) }, 502);
    }
    const j = await res.json();
    // opus-5 emits a thinking block first, so never take content[0]
    const use = (j.content || []).find((b) => b && b.type === 'tool_use');
    if (!use) return json({ error: 'model returned no estimate' }, 502);
    est = use.input;
  } catch (e) {
    return json({ error: 'model call threw', detail: String(e && e.message).slice(0, 200) }, 502);
  }

  return json({ estimate: est, check: check(est), model: MODEL });
}

/* ── the check ─────────────────────────────────────────────────────────────
   Every figure here is arithmetic on the estimate against a quoted clause. No
   judgement, no rounding toward a pass, and a refusal to certify at the end. */
function check(e) {
  const r2 = (n) => Math.round(n * 100) / 100;
  const floor = r2((e.length_m || 0) * (e.width_m || 0));

  const openings = (e.openings || []).map((o) => ({
    ...o,
    face_m2: r2((o.width_m || 0) * (o.height_m || 0)),
    net_m2: r2((o.width_m || 0) * (o.height_m || 0) * (o.openable_fraction ?? 0)),
  }));
  const net = r2(openings.reduce((a, o) => a + o.net_m2, 0));
  const required = r2(floor * 0.05);
  const pct = floor > 0 ? r2((net / floor) * 100) : 0;

  const items = [];

  items.push({
    clause: 'G4/AS1 2.2.1.2',
    quote: 'Natural ventilation of occupied spaces must be achieved by providing a net openable area of windows or other openings to the outside of no less than 5% of the floor area.',
    verdict: net >= required ? 'meets' : 'short',
    detail: net >= required
      ? `${net} m² of net openable area against ${required} m² required. The room is ${floor} m², so the openings come to ${pct}%.`
      : `${net} m² of net openable area against ${required} m² required, a shortfall of ${r2(required - net)} m². The room is ${floor} m² and the openings come to ${pct}%, where 5% is the floor. The alternative route in 2.2.2.2 is high level trickle ventilators through the external wall.`,
    numbers: { floor_m2: floor, net_openable_m2: net, required_m2: required, percent: pct },
  });

  const wet = ['kitchen', 'bathroom', 'laundry', 'toilet'].includes(e.room);
  if (wet || (e.openings || []).length) {
    const span = e.external_wall_to_opposing_m;
    items.push({
      clause: 'G4/AS1 2.2.2.2(c)',
      quote: 'having a distance between the external wall and opposing wall of the space of less than 6 metres.',
      verdict: span == null ? 'unknown' : (span < 6 ? 'meets' : 'short'),
      detail: span == null
        ? 'The photographs did not establish which wall is external, so this one has to be measured on site.'
        : (span < 6
          ? `${r2(span)} m from the window wall to the wall opposite, inside the 6 m limit.`
          : `${r2(span)} m from the window wall to the wall opposite. Over 6 m, so the natural-ventilation route in 2.2.2.2 does not apply and the space needs mechanical ventilation.`),
      numbers: { span_m: span == null ? null : r2(span) },
    });
  }

  /* the MEP: extract rates, and a duct sized to carry them */
  const fx = new Set(e.fixtures || []);
  const runs = [];
  if (fx.has('cooktop')) runs.push({ serves: 'cooktop', rate_ls: 50 });
  if (fx.has('shower')) runs.push({ serves: 'shower', rate_ls: 25 });
  if (fx.has('bath')) runs.push({ serves: 'bath', rate_ls: 25 });

  if (runs.length) {
    for (const run of runs) {
      /* Size the duct so air moves at about 3 m/s, which is the usual domestic
         target for a quiet run. A = Q / v, then diameter from the area. This is
         engineering practice rather than a Code figure, and it is labelled as
         such on the page. */
      const area = (run.rate_ls / 1000) / 3;
      run.duct_mm = Math.ceil(Math.sqrt((4 * area) / Math.PI) * 1000 / 5) * 5;
    }
    items.push({
      clause: 'G4/AS1 2.2.1.5',
      quote: 'Spaces in household units and accommodation units that contain cooktops, showers and baths must have mechanical extract fans installed to remove moisture generated by these fixtures. Mechanical extract fans (including associated ducting) must have a flowrate not less than: a) 25 L/s for showers and baths; and b) 50 L/s for cooktops.',
      verdict: e.existing_extract === 'none_visible' ? 'short'
        : (e.existing_extract === 'cannot_tell' ? 'unknown' : 'check'),
      detail: (e.existing_extract === 'none_visible'
        ? 'No mechanical extract is visible in these photographs, and this space contains a fixture that requires one. '
        : e.existing_extract === 'cannot_tell'
          ? 'Whether an extract fan is present could not be established from these photographs. '
          : 'An extract appears to be present. Its rated flow and its duct run still have to be confirmed, because a fan achieves its rating only through the ducting it is actually installed on. ') +
        `Required here: ${runs.map((r) => `${r.rate_ls} L/s for the ${r.serves}`).join(', ')}.`,
      runs,
    });

    items.push({
      clause: 'Not a Code figure',
      quote: 'Duct sizing below is ordinary engineering practice, not a Building Code requirement.',
      verdict: 'note',
      detail: `Sized for roughly 3 m/s, which keeps a domestic run quiet: ${runs.map((r) => `${r.duct_mm} mm for ${r.rate_ls} L/s`).join(', ')}. Bends, length and terminal type all cut real flow, so an installer sizes the final run.`,
      runs,
    });
  }

  const short = items.filter((i) => i.verdict === 'short').length;
  const unknown = items.filter((i) => i.verdict === 'unknown').length;

  return {
    edition: 'G4/AS1 5th edition, 28 July 2025, Ministry of Business, Innovation and Employment',
    floor_m2: floor,
    openings,
    net_openable_m2: net,
    required_m2: required,
    percent: pct,
    items,
    summary: short === 0 && unknown === 0
      ? 'Every check this tool can run from photographs is met on the estimate above.'
      : `${short} check${short === 1 ? '' : 's'} short and ${unknown} that a photograph cannot answer.`,
    refusal: 'This is an estimate from photographs and it is not a compliance determination. Building consent authorities grant consents and issue code compliance certificates. Restricted building work requires a Licensed Building Practitioner. Nothing here substitutes for either.',
  };
}

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
