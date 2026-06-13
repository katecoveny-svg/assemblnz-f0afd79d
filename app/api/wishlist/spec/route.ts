/**
 * POST /api/wishlist/spec — tailor a specialist spec to ANY business + wish.
 *
 * Body: { business: string, wish: string }
 * Calls claude-sonnet-4-6 with the locked system prompt, parses strict JSON,
 * and falls back to the deterministic keyword engine if the model is
 * unavailable or returns malformed JSON — so the tool never breaks.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildFallbackSpec, parseWishlistSpec } from '@/lib/tools/wishlist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  business: z.string().min(1).max(200),
  wish: z.string().min(1).max(600),
});

// Locked system prompt — do not edit without sign-off.
const SYSTEM_PROMPT = `You are the drafting engine behind Assembl's Wishlist tool. A New Zealand business tells you one job they wish they could hand off. You return a tailored spec for the specialist Assembl would build them.

Rules, no exceptions:
- New Zealand English. Macrons on all te reo Māori. Never use the word "AI" — say "specialist" or "agent-assisted".
- Every output is a DRAFT that a named human reviewer signs off, then is sealed in an evidence pack. Say so.
- Nothing the specialist does is ever lodged automatically to any government system (Customs/TSW, IRD, Companies Office, WorkSafe, MPI, Privacy Commissioner). It drafts; a licensed person lodges.
- This is not legal, financial or medical advice.
- Name the most relevant NZ legislation for the job, plus a tikanga check and the Privacy Act 2020. Do not invent statutes — if unsure, use "relevant NZ sector law".
- Keep the hours-saved estimate conservative and realistic for a small NZ business.
- Do NOT generate karakia, whaikōrero, mihimihi, pepeha or waiata.

Return ONLY this JSON, no preamble, no markdown:
{
  "kete": "one of: Pīkau | Manaaki | Waihanga | Arataki | Hoko | Ako | Auaha | Mātauranga | Tōro | Core",
  "specialistName": "a short, plain name e.g. 'a Pīkau customs drafter'",
  "drafts": ["three specific things it would draft for THIS business"],
  "checks": ["three checks it runs on every output, incl. the Privacy Act 2020"],
  "hoursPerWeek": 4,
  "forLine": "one sentence: for <business>, taking '<wish>' off their plate"
}`;

function extractText(json: unknown): string {
  const content = (json as { content?: Array<{ type?: string; text?: string }> })?.content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((block) => block?.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n');
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Tell us your business and your wish.' },
      { status: 400 },
    );
  }
  const { business, wish } = parsed.data;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured — never break the tool.
    return NextResponse.json({ spec: buildFallbackSpec(business, wish), source: 'fallback' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        temperature: 0.4,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Business: ${business}\nWish: ${wish}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('wishlist spec model error', response.status);
      return NextResponse.json({ spec: buildFallbackSpec(business, wish), source: 'fallback' });
    }

    const data = (await response.json()) as unknown;
    const spec = parseWishlistSpec(extractText(data), business, wish);
    if (!spec) {
      return NextResponse.json({ spec: buildFallbackSpec(business, wish), source: 'fallback' });
    }
    return NextResponse.json({ spec, source: 'model' });
  } catch (error) {
    console.error('wishlist spec call failed', error);
    return NextResponse.json({ spec: buildFallbackSpec(business, wish), source: 'fallback' });
  }
}
