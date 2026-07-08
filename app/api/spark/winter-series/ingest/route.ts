/**
 * POST /api/spark/winter-series/ingest — file a SPARK winter episode into the
 * /admin/approvals queue as pending drafts. This is the automation path the Echo
 * Tuesday routine calls; the admin button in /admin/approvals is the manual path.
 *
 * Gated by SPARK_WINTER_INGEST_SECRET (Bearer token or x-ingest-secret header).
 * If the secret is not configured, the route is DISABLED (403) — safe default,
 * never open.
 *
 * Body: { date?: "YYYY-MM-DD", all?: boolean }
 *  - all:true   → ingest every winter date
 *  - date:"…"   → ingest that episode
 *  - neither    → ingest today's date if it's a winter Tuesday, else 400
 *
 * Dispatches nothing. Every row lands 'pending'; approval happens in /admin.
 *
 * GET is the Vercel-cron entrypoint (vercel.json fires it Mondays 17:00 UTC =
 * Tuesdays ~5am NZST). Vercel sends `Authorization: Bearer ${CRON_SECRET}`;
 * we accept CRON_SECRET or SPARK_WINTER_INGEST_SECRET. On a non-winter date the
 * cron GET no-ops with 200 (so the job never reads as failing outside the window).
 */
import { NextResponse } from 'next/server';
import { ingestWinterEpisode, WINTER_DATES, type IngestResult } from '@/lib/spark/winter-series';

export const runtime = 'nodejs';
export const maxDuration = 30;

function todayISO(): string {
  // NZ date (UTC+12/+13); good enough to match a committed episode filename.
  const nz = new Date(Date.now() + 12 * 60 * 60 * 1000);
  return nz.toISOString().slice(0, 10);
}

/** null = authorized; otherwise the error response to return. */
function checkAuth(req: Request): NextResponse | null {
  const secrets = [process.env.SPARK_WINTER_INGEST_SECRET, process.env.CRON_SECRET].filter(
    (s): s is string => Boolean(s),
  );
  if (secrets.length === 0) {
    return NextResponse.json({ ok: false, error: 'ingest disabled — no secret configured' }, { status: 403 });
  }
  const auth = req.headers.get('authorization') ?? '';
  const token = (auth.replace(/^Bearer\s+/i, '').trim() || req.headers.get('x-ingest-secret') || '').trim();
  if (!token || !secrets.includes(token)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

/** Vercel-cron entrypoint: ingest today's episode if today is a winter Tuesday. */
export async function GET(req: Request) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const today = todayISO();
  if (!(WINTER_DATES as readonly string[]).includes(today)) {
    // Outside the series window the cron is a quiet no-op, not a failure.
    return NextResponse.json({ ok: true, inserted: 0, skipped: true, note: `today (${today}) is not a winter-series date` });
  }
  const result = await ingestWinterEpisode(today, 'cron:spark-winter');
  return NextResponse.json({ ok: result.ok, inserted: result.inserted, results: [result] });
}

export async function POST(req: Request) {
  const denied = checkAuth(req);
  if (denied) return denied;

  let body: { date?: unknown; all?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    // empty body is fine — falls through to today
  }

  let dates: string[];
  if (body.all === true) {
    dates = [...WINTER_DATES];
  } else if (typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    dates = [body.date];
  } else {
    const today = todayISO();
    if (!(WINTER_DATES as readonly string[]).includes(today)) {
      return NextResponse.json(
        { ok: false, error: `today (${today}) is not a winter-series date; pass { date } or { all: true }` },
        { status: 400 },
      );
    }
    dates = [today];
  }

  const results: IngestResult[] = [];
  for (const d of dates) {
    results.push(await ingestWinterEpisode(d, 'echo:spark-winter'));
  }
  const inserted = results.reduce((n, r) => n + r.inserted, 0);
  return NextResponse.json({ ok: results.every((r) => r.ok), inserted, results });
}
