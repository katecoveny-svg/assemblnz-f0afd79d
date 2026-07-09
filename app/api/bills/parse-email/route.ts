import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';
import { edgeLlm, stripFences } from '@/lib/bills/llm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/bills/parse-email — email-first bill ingestion.
 *
 * Takes a forwarded/pasted bill email (raw text or a dropped .eml/.txt file
 * body) and extracts the bill record. Provider chain: Anthropic (local key) →
 * platform edge LLM (Supabase secrets) → deterministic NZ-provider regex
 * floor, so email parsing ALWAYS answers. Persists to the same
 * assembl_bills_ingested log the upload path uses. READ-only — nothing is
 * paid or actioned.
 */

const MODEL = 'claude-sonnet-4-6';

const BodySchema = z.object({
  email: z.string().trim().min(20).max(200_000),
  fileName: z.string().max(200).optional(),
  sessionId: z.string().max(64).optional(),
});

const EXTRACTION_PROMPT = `You are extracting structured data from a New Zealand utility or subscription BILL EMAIL (raw body or .eml source; ignore headers, footers, unsubscribe links and marketing).
Return ONLY a JSON object (no prose, no markdown) with exactly these keys:
{
  "provider": string,            // the company that issued the bill, e.g. "Mercury Energy"
  "category": string,            // one of: Electricity, Broadband, Insurance, Mobile, Council, Gas, Subscriptions, Water, Other
  "account_number": string|null,
  "bill_date": string|null,      // ISO yyyy-mm-dd
  "due_date": string|null,       // ISO yyyy-mm-dd
  "total_amount": number|null,   // total payable, NZD, number only
  "gst_amount": number|null,
  "line_items": [ { "description": string, "amount": number } ],
  "confidence": "high"|"medium"|"low"
}
Rules: NZD. If a field isn't present, use null (or [] for line_items). Never invent values. Dates as yyyy-mm-dd.`;

type Parsed = {
  provider: string | null;
  category: string | null;
  account_number: string | null;
  bill_date: string | null;
  due_date: string | null;
  total_amount: number | null;
  gst_amount: number | null;
  line_items: { description: string; amount: number }[];
  confidence: string | null;
};

const dateOrNull = (s: unknown): string | null =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
const numOrNull = (n: unknown): number | null =>
  typeof n === 'number' && Number.isFinite(n) ? n : null;

// ── deterministic floor — never fails, clearly low-confidence ───────────────

const KNOWN_PROVIDERS: Array<[RegExp, string, string]> = [
  [/mercury/i, 'Mercury Energy', 'Electricity'],
  [/contact\s*energy/i, 'Contact Energy', 'Electricity'],
  [/genesis/i, 'Genesis Energy', 'Electricity'],
  [/meridian/i, 'Meridian Energy', 'Electricity'],
  [/electric\s*kiwi/i, 'Electric Kiwi', 'Electricity'],
  [/frank\s*energy/i, 'Frank Energy', 'Electricity'],
  [/spark/i, 'Spark', 'Broadband'],
  [/one\s*nz|vodafone/i, 'One NZ', 'Mobile'],
  [/2\s*degrees|2degrees/i, '2degrees', 'Mobile'],
  [/skinny/i, 'Skinny', 'Mobile'],
  [/\bami\b/i, 'AMI Insurance', 'Insurance'],
  [/tower/i, 'Tower Insurance', 'Insurance'],
  [/\bstate\b/i, 'State Insurance', 'Insurance'],
  [/aa\s*insurance/i, 'AA Insurance', 'Insurance'],
  [/auckland\s*council/i, 'Auckland Council', 'Council'],
  [/watercare/i, 'Watercare', 'Water'],
  [/netflix/i, 'Netflix', 'Subscriptions'],
  [/spotify/i, 'Spotify', 'Subscriptions'],
  [/sky\s*(sport|tv)?/i, 'Sky', 'Subscriptions'],
];

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function findDate(text: string, cueRe: RegExp): string | null {
  const window = cueRe.exec(text);
  const scope = window ? text.slice(window.index, window.index + 120) : text;
  const iso = scope.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const dm = scope.match(/(\d{1,2})[\s/-](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s/-]?(\d{4})?/i);
  if (dm) {
    const year = dm[3] ?? String(new Date().getFullYear());
    return `${year}-${MONTHS[dm[2].slice(0, 3).toLowerCase()]}-${dm[1].padStart(2, '0')}`;
  }
  const slash = scope.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`;
  }
  return null;
}

function regexExtract(email: string): Parsed {
  let provider: string | null = null;
  let category: string | null = null;
  for (const [re, name, cat] of KNOWN_PROVIDERS) {
    if (re.test(email)) {
      provider = name;
      category = cat;
      break;
    }
  }
  // amount: prefer figures near "total / amount due / to pay"
  const amountCue = email.match(/(?:total|amount\s+due|to\s+pay|amount\s+payable|balance)[^$]{0,40}\$\s?([\d,]+(?:\.\d{2})?)/i);
  const anyAmount = email.match(/\$\s?([\d,]+\.\d{2})/);
  const totalRaw = amountCue?.[1] ?? anyAmount?.[1];
  const total_amount = totalRaw ? Number(totalRaw.replace(/,/g, '')) : null;
  const gstRaw = email.match(/gst[^$]{0,30}\$\s?([\d,]+(?:\.\d{2})?)/i)?.[1];
  const account = email.match(/account(?:\s*(?:number|no\.?|#))?[:\s]+([\w-]{4,20})/i)?.[1] ?? null;

  return {
    provider,
    category,
    account_number: account,
    bill_date: findDate(email, /bill\s*date|invoice\s*date|statement\s*date/i),
    due_date: findDate(email, /due/i),
    total_amount,
    gst_amount: gstRaw ? Number(gstRaw.replace(/,/g, '')) : null,
    line_items: [],
    confidence: 'low',
  };
}

// ── model extraction ─────────────────────────────────────────────────────────

async function anthropicExtract(email: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [
          { role: 'user', content: `${EXTRACTION_PROMPT}\n\n--- EMAIL ---\n${email.slice(0, 24_000)}` },
        ],
      }),
    });
    if (!res.ok) {
      console.error('[bills-parse-email] anthropic error', res.status);
      return null;
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    return (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n').trim() || null;
  } catch {
    return null;
  }
}

function parseModelJson(text: string): Parsed | null {
  try {
    const raw = JSON.parse(stripFences(text)) as Record<string, unknown>;
    return {
      provider: (raw.provider as string) ?? null,
      category: (raw.category as string) ?? null,
      account_number: (raw.account_number as string) ?? null,
      bill_date: dateOrNull(raw.bill_date),
      due_date: dateOrNull(raw.due_date),
      total_amount: numOrNull(raw.total_amount),
      gst_amount: numOrNull(raw.gst_amount),
      line_items: Array.isArray(raw.line_items)
        ? (raw.line_items as { description: string; amount: number }[]).filter(
            (li) => li && typeof li.description === 'string',
          )
        : [],
      confidence: (raw.confidence as string) ?? null,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Paste the email text (at least a few lines).' },
      { status: 400 },
    );
  }
  const email = parsed.data.email;

  let extracted: Parsed | null = null;
  let usedModel = 'regex-floor';

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const text = await anthropicExtract(email, apiKey);
    if (text) {
      extracted = parseModelJson(text);
      if (extracted) usedModel = MODEL;
    }
  }
  if (!extracted) {
    const edge = await edgeLlm({
      system: EXTRACTION_PROMPT,
      message: `--- EMAIL ---\n${email.slice(0, 24_000)}`,
      maxTokens: 1500,
    });
    if (edge) {
      extracted = parseModelJson(edge.text);
      if (extracted) usedModel = edge.model;
    }
  }
  if (!extracted) {
    extracted = regexExtract(email);
  }

  // Persist the record — same log as the upload path (best-effort).
  try {
    const service = getServiceClient();
    await service.from('assembl_bills_ingested').insert({
      session_id: parsed.data.sessionId ?? null,
      source: 'email',
      provider: extracted.provider,
      category: extracted.category,
      account_number: extracted.account_number,
      bill_date: extracted.bill_date,
      due_date: extracted.due_date,
      total_amount: extracted.total_amount,
      gst_amount: extracted.gst_amount,
      line_items: extracted.line_items,
      model: usedModel,
      confidence: extracted.confidence,
      raw_extraction: extracted as unknown as Record<string, unknown>,
      file_name: parsed.data.fileName ?? null,
    });
  } catch (err) {
    console.error('[bills-parse-email] persist failed', err instanceof Error ? err.message : String(err));
  }

  return NextResponse.json({ ok: true, parsed: extracted, model: usedModel });
}
