import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';
import { edgeLlm, edgeLlmConfigured, stripFences } from '@/lib/bills/llm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/bills/parse — REAL Claude Vision bill extraction.
 *
 * A dropped PDF/photo of an NZ bill comes in as a base64 data URL; we send it
 * to the Anthropic API (document block for PDFs, image block otherwise) with a
 * structured extraction prompt, parse the JSON it returns, and persist the
 * record to public.assembl_bills_ingested. Real bill in → real parsed record
 * out. Nothing is actioned — this is READ/extract only.
 *
 * Calls the Anthropic REST API directly (not the ai-sdk) so it (a) supports
 * PDF document blocks and (b) ignores any ANTHROPIC_BASE_URL gateway override
 * in the environment — the same code path works locally and on Vercel.
 */
const MODEL = 'claude-sonnet-4-6';
const MAX_BYTES = 8 * 1024 * 1024; // 8MB decoded cap

const BodySchema = z.object({
  // data URL: "data:image/png;base64,...." or "data:application/pdf;base64,...."
  dataUrl: z.string().min(32).max(12_000_000),
  fileName: z.string().max(200).optional(),
  sessionId: z.string().max(64).optional(),
  source: z.enum(['upload', 'photo', 'email']).optional(),
});

const EXTRACTION_PROMPT = `You are extracting structured data from a New Zealand utility or subscription bill.
Return ONLY a JSON object (no prose, no markdown) with exactly these keys:
{
  "provider": string,            // the company that issued the bill, e.g. "Mercury Energy"
  "category": string,            // one of: Electricity, Broadband, Insurance, Mobile, Council, Gas, Subscriptions, Water, Other
  "account_number": string|null,
  "bill_date": string|null,      // ISO yyyy-mm-dd
  "due_date": string|null,       // ISO yyyy-mm-dd
  "total_amount": number|null,   // total payable, NZD, number only
  "gst_amount": number|null,     // GST component if shown, NZD
  "line_items": [ { "description": string, "amount": number } ],
  "confidence": "high"|"medium"|"low"  // your confidence in the extraction
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

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!m) return null;
  return { mediaType: m[1], base64: m[2] };
}

const dateOrNull = (s: unknown): string | null =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
const numOrNull = (n: unknown): number | null =>
  typeof n === 'number' && Number.isFinite(n) ? n : null;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey && !edgeLlmConfigured()) {
    return NextResponse.json({ error: 'Bill parsing is offline (no model provider configured).' }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const decoded = parseDataUrl(parsed.data.dataUrl);
  if (!decoded) {
    return NextResponse.json({ error: 'Unsupported file — please drop a PDF or an image.' }, { status: 400 });
  }
  if (Buffer.byteLength(decoded.base64, 'base64') > MAX_BYTES) {
    return NextResponse.json({ error: 'That file is too large — try one under 8MB.' }, { status: 413 });
  }

  const isPdf = decoded.mediaType === 'application/pdf';
  const isImage = /^image\/(png|jpe?g|webp|gif)$/.test(decoded.mediaType);
  if (!isPdf && !isImage) {
    return NextResponse.json({ error: 'Unsupported file type — PDF or image only.' }, { status: 415 });
  }

  const contentBlock = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: decoded.base64 } }
    : { type: 'image', source: { type: 'base64', media_type: decoded.mediaType, data: decoded.base64 } };

  // ── Real vision call: Anthropic direct → platform edge LLM ───────────────
  let modelText = '';
  let usedModel = MODEL;
  if (apiKey) {
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
            {
              role: 'user',
              content: [contentBlock, { type: 'text', text: EXTRACTION_PROMPT }],
            },
          ],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { content?: { type: string; text?: string }[] };
        modelText = (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n').trim();
      } else {
        console.error('[bills-parse] anthropic error', res.status, (await res.text()).slice(0, 300));
      }
    } catch (err) {
      console.error('[bills-parse] anthropic fetch failed', err instanceof Error ? err.message : String(err));
    }
  }
  if (!modelText) {
    // Platform edge LLM — vision-capable, holds its own provider keys in
    // Supabase secrets (same pattern as the Auaha image pipeline).
    const edge = await edgeLlm({
      system: EXTRACTION_PROMPT,
      message: 'Extract this bill.',
      imageDataUrl: parsed.data.dataUrl,
      maxTokens: 1500,
    });
    if (edge) {
      modelText = edge.text;
      usedModel = edge.model;
    }
  }
  if (!modelText) {
    return NextResponse.json({ error: 'Bill parsing is unavailable right now — please try again.' }, { status: 502 });
  }

  // The model is asked for pure JSON; strip any stray fences defensively.
  const jsonStr = stripFences(modelText);
  let extracted: Parsed;
  try {
    const raw = JSON.parse(jsonStr) as Record<string, unknown>;
    extracted = {
      provider: (raw.provider as string) ?? null,
      category: (raw.category as string) ?? null,
      account_number: (raw.account_number as string) ?? null,
      bill_date: dateOrNull(raw.bill_date),
      due_date: dateOrNull(raw.due_date),
      total_amount: numOrNull(raw.total_amount),
      gst_amount: numOrNull(raw.gst_amount),
      line_items: Array.isArray(raw.line_items)
        ? (raw.line_items as { description: string; amount: number }[]).filter((li) => li && typeof li.description === 'string')
        : [],
      confidence: (raw.confidence as string) ?? null,
    };
  } catch {
    return NextResponse.json({ error: 'The bill was read but not in a format we could parse — try a clearer image.' }, { status: 422 });
  }

  // ── Persist the real parsed record ────────────────────────────────────────
  try {
    const service = getServiceClient();
    await service.from('assembl_bills_ingested').insert({
      session_id: parsed.data.sessionId ?? null,
      source: parsed.data.source ?? (isPdf ? 'upload' : 'photo'),
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
    // Extraction still succeeded — persistence is best-effort.
    console.error('[bills-parse] persist failed', err instanceof Error ? err.message : String(err));
  }

  return NextResponse.json({ ok: true, parsed: extracted });
}
