import { NextRequest } from 'next/server';

// Day-plan endpoint for the voyage-italy ambient day planner.
//
// Given the trip stop you're at, the hotel you're staying in, today's local
// date+time, and a short free-text prompt about what you want to do —
// returns a structured day plan (blocks of time-to-place-to-transit) with
// honesty caveats about what we can't verify live.
//
// PRIVACY
//   We do not log the prompt. The plan is rendered into the page and saved
//   to localStorage only — nothing persists server-side.
//
// SHAPE
//   POST { stopLabel, hotelName, hotelAddress?, travellers, dateIso, localTime,
//          prompt, lastBlock? } →
//   200 { headline, blocks[], caveats[] }
//
//   See DayPlan type below for full block shape.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_REQUESTS = 8;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_PROMPT_CHARS = 600;

const rateLimitBuckets = new Map<string, number[]>();

type DayPlanRequest = {
  stopLabel?: string;
  hotelName?: string;
  hotelAddress?: string;
  travellers?: string[];
  dateIso?: string;
  localTime?: string;
  prompt?: string;
  lastBlock?: { place?: string; address?: string };
};

type BookStatus =
  | 'walk_in'
  | 'book_now'
  | 'call_ahead'
  | 'tickets_online'
  | 'none';

type DayPlanBlock = {
  when: string;
  title: string;
  place: string;
  address: string;
  transit: string;
  why: string;
  book: BookStatus;
  bookNote?: string;
};

type DayPlan = {
  headline: string;
  blocks: DayPlanBlock[];
  caveats: string[];
};

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}

function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = rateLimitBuckets.get(ip) ?? [];
  const fresh = window.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT_REQUESTS) {
    rateLimitBuckets.set(ip, fresh);
    return false;
  }
  fresh.push(now);
  rateLimitBuckets.set(ip, fresh);
  return true;
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

const SYSTEM_PROMPT = `You are a switched-on local fixer planning a day in Italy for two New Zealand travellers. Output ONE day plan as JSON matching the provided schema.

VOICE
- Sound like a clued-up local mate, not a guidebook. Specific, opinionated, mobile-readable.
- NZ English. Lowercase "assembl" if you ever name the platform (you usually shouldn't).
- Never say "AI". Never say "as an AI". You're a planner.
- No emoji. No exclamation points.

CONTENT RULES
- Every block must have a REAL named place with a REAL street address. If you don't know an address with high confidence, choose a different place you do know.
- "transit" describes how to get there FROM THE PREVIOUS BLOCK (or from the hotel for the first block). Include metro line + station, walking minutes, or "5 min Uber".
- "why" is one short sentence on what makes it worth going. Locals-leaning, not touristy.
- "book" field values:
  - "book_now" for restaurants/experiences that need reservations same-day or earlier
  - "tickets_online" for attractions where day-of queue is brutal (Colosseum, Vatican, Uffizi, Duomo rooftop)
  - "call_ahead" for places worth ringing to check availability
  - "walk_in" for places that take walk-ins
  - "none" when not applicable (e.g. a market, a walk)
- "bookNote" can include the booking site name or phone number if you're confident. Otherwise omit.
- AVOID tourist trap streets: Via Fiori Chiari (Brera lunch trap), restaurants near Piazza Navona / Spanish Steps / Trevi / Duomo with menus in 5+ languages.

WHEN THE TRAVELLER ASKS FOR "BASICS" SHOPPING
- Means non-luxury: COS, Uniqlo, Arket, & Other Stories, Adidas Originals, Decathlon, Zara, H&M.
- Avoid: Via Montenapoleone, Via Condotti, Quadrilatero d'Oro.

STRUCTURE
- Build a coherent day from the current local time forward. Don't include past time blocks.
- Typical day: now-block → mid-morning → lunch → afternoon → aperitivo → dinner.
- 4–6 blocks is the sweet spot.

CAVEATS
- Always include 2–4 caveats about things you can't verify live (restaurant hours today, store stock, transit strikes, weather, day-of bookings).
- Be honest about uncertainty. Say "call to confirm" not "definitely open".`;

const RESPONSE_SCHEMA = {
  type: 'object',
  required: ['headline', 'blocks', 'caveats'],
  properties: {
    headline: { type: 'string' },
    blocks: {
      type: 'array',
      minItems: 3,
      maxItems: 7,
      items: {
        type: 'object',
        required: ['when', 'title', 'place', 'address', 'transit', 'why', 'book'],
        properties: {
          when: { type: 'string' },
          title: { type: 'string' },
          place: { type: 'string' },
          address: { type: 'string' },
          transit: { type: 'string' },
          why: { type: 'string' },
          book: {
            type: 'string',
            enum: ['walk_in', 'book_now', 'call_ahead', 'tickets_online', 'none'],
          },
          bookNote: { type: 'string' },
        },
      },
    },
    caveats: {
      type: 'array',
      minItems: 1,
      maxItems: 6,
      items: { type: 'string' },
    },
  },
};

function buildUserPrompt(body: DayPlanRequest): string {
  const parts: string[] = [];
  if (body.dateIso) parts.push(`Date: ${body.dateIso}`);
  if (body.localTime) parts.push(`Local time now: ${body.localTime}`);
  if (body.stopLabel) parts.push(`Trip stop: ${body.stopLabel}`);
  if (body.hotelName) {
    parts.push(
      `Staying at: ${body.hotelName}${body.hotelAddress ? ` (${body.hotelAddress})` : ''}`,
    );
  }
  if (body.travellers && body.travellers.length > 0) {
    parts.push(`Travellers: ${body.travellers.join(', ')}`);
  }
  if (body.lastBlock?.place) {
    parts.push(
      `Currently at: ${body.lastBlock.place}${body.lastBlock.address ? ` (${body.lastBlock.address})` : ''}`,
    );
  }
  parts.push('');
  parts.push(`What they want from today: ${body.prompt}`);
  return parts.join('\n');
}

function validatePlan(value: unknown): DayPlan | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.headline !== 'string') return null;
  if (!Array.isArray(v.blocks)) return null;
  if (!Array.isArray(v.caveats)) return null;

  const validBookValues: BookStatus[] = [
    'walk_in',
    'book_now',
    'call_ahead',
    'tickets_online',
    'none',
  ];

  const blocks: DayPlanBlock[] = [];
  for (const raw of v.blocks) {
    if (!raw || typeof raw !== 'object') return null;
    const b = raw as Record<string, unknown>;
    if (
      typeof b.when !== 'string' ||
      typeof b.title !== 'string' ||
      typeof b.place !== 'string' ||
      typeof b.address !== 'string' ||
      typeof b.transit !== 'string' ||
      typeof b.why !== 'string' ||
      typeof b.book !== 'string'
    ) {
      return null;
    }
    if (!validBookValues.includes(b.book as BookStatus)) return null;
    blocks.push({
      when: b.when,
      title: b.title,
      place: b.place,
      address: b.address,
      transit: b.transit,
      why: b.why,
      book: b.book as BookStatus,
      bookNote: typeof b.bookNote === 'string' ? b.bookNote : undefined,
    });
  }

  const caveats: string[] = v.caveats.filter(
    (c): c is string => typeof c === 'string',
  );

  return { headline: v.headline, blocks, caveats };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as DayPlanRequest;
  const prompt = body.prompt?.trim() ?? '';

  if (!prompt) return json({ error: 'Missing prompt' }, 400);
  if (prompt.length > MAX_PROMPT_CHARS) {
    return json({ error: `Prompt too long (max ${MAX_PROMPT_CHARS} chars)` }, 400);
  }

  const ip = clientIp(req);
  if (!withinRateLimit(ip)) {
    return json({ error: 'Easy — try again in a minute.' }, 429);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(
      {
        error: 'Day planner offline. Try the translator + your phone maps instead.',
        offline: true,
      },
      503,
    );
  }

  const userPrompt = buildUserPrompt(body);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey,
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
        // 20s — day plans are larger than translations. Still well inside
        // Vercel's hobby timeout.
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return json(
        {
          error: 'Planner hiccup. Try again in a moment.',
          detail: detail.slice(0, 200),
        },
        502,
      );
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const raw = (data.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? '')
      .join('')
      .trim();

    if (!raw) {
      return json({ error: 'Planner returned nothing. Try rewording.' }, 502);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return json({ error: 'Planner returned malformed JSON.' }, 502);
    }

    const validated = validatePlan(parsed);
    if (!validated) {
      return json({ error: 'Planner returned an unexpected shape.' }, 502);
    }

    return json(validated);
  } catch {
    return json({ error: 'Planner timed out. Try again.' }, 504);
  }
}
