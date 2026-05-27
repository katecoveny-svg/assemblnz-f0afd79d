import { NextRequest } from 'next/server';

// Tiny EN ↔ IT translation endpoint for the voyage-italy translator.
//
// Calls Gemini REST directly (no SDK) so we don't add a dependency for a
// 30-line endpoint. The iho-router edge function is the canonical Gemini
// path for compliance-gated chat — translation is a single-string
// utility and doesn't need the Kahu → Iho → Tā → Mahara → Mana pipeline.
//
// Privacy: requests contain only the phrase the user typed/spoke. We do
// NOT log the phrase. Rate limit is best-effort in-memory.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORTED_LANGS = new Set(['en-NZ', 'it-IT']);
const MAX_INPUT_CHARS = 500;
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

type TranslateBody = {
  text?: string;
  fromLang?: string;
  toLang?: string;
};

const rateLimitBuckets = new Map<string, number[]>();

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

function languageName(lang: string): string {
  return lang === 'en-NZ' ? 'English (New Zealand)' : 'Italian (Italy)';
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as TranslateBody;
  const text = body.text?.trim() ?? '';
  const fromLang = body.fromLang ?? '';
  const toLang = body.toLang ?? '';

  if (!text) return json({ error: 'Missing text' }, 400);
  if (text.length > MAX_INPUT_CHARS) {
    return json({ error: `Text too long (max ${MAX_INPUT_CHARS} chars)` }, 400);
  }
  if (!SUPPORTED_LANGS.has(fromLang) || !SUPPORTED_LANGS.has(toLang)) {
    return json({ error: 'Unsupported language pair (only en-NZ ↔ it-IT)' }, 400);
  }
  if (fromLang === toLang) {
    return json({ translated: text, sourceText: text, fromLang, toLang });
  }

  const ip = clientIp(req);
  if (!withinRateLimit(ip)) {
    return json(
      {
        error: 'Rate limit exceeded. Try again in a minute, or use the phrasebook.',
      },
      429,
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fail soft — UI falls back to phrasebook + manual input.
    return json(
      {
        error: 'Translator offline. Use the phrasebook below.',
        offline: true,
      },
      503,
    );
  }

  const systemPrompt =
    'You are a literal translator. Output ONLY the translation of the user message in the target language, with no quotation marks, no explanations, no transliterations, no alternative renderings, no notes about register. Preserve the original tone: casual stays casual, formal stays formal, polite stays polite. If the input is a single word, return a single word. Never refuse — if the input is ambiguous, choose the most common everyday translation.';
  const userPrompt = `Translate from ${languageName(fromLang)} to ${languageName(
    toLang,
  )}:\n\n${text}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey,
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
            candidateCount: 1,
          },
        }),
        // 8s — well under Vercel hobby limit, enough for Gemini cold-start.
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      return json(
        {
          error: 'Translator hiccup. Try again in a moment, or use the phrasebook.',
        },
        502,
      );
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const translated = (data.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? '')
      .join('')
      .trim()
      // Strip stray surrounding quotes the model sometimes adds despite
      // the system prompt.
      .replace(/^["“'‘](.*)["”'’]$/s, '$1')
      .trim();

    if (!translated) {
      return json({ error: 'Empty translation. Try rewording.' }, 502);
    }

    return json({ translated, sourceText: text, fromLang, toLang });
  } catch {
    return json(
      {
        error: 'Translator timed out. Try again, or use the phrasebook.',
      },
      504,
    );
  }
}
