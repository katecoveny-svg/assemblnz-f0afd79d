import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { summariseSession, type SessionBill } from '@/lib/bills/session-summary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/bills/session?sessionId=… — the bills this browser has actually had
 * parsed.
 *
 * /api/bills/parse does the real work: a dropped PDF or photo goes to Claude
 * Vision, comes back as a structured record and is written to
 * public.assembl_bills_ingested against the caller's session id. Until now
 * nothing read it back, so every console page showed the sample household even
 * after you had uploaded your own power bill. This is the read side.
 *
 * Session-scoped and demo-scoped: the id is a random string this browser keeps
 * in localStorage, not an account. It is enough to show someone their own
 * upload in the same sitting, and deliberately not enough to be a login — so
 * nothing here is treated as private data or kept beyond the demo window.
 */

type Row = {
  provider: string | null;
  category: string | null;
  bill_date: string | null;
  due_date: string | null;
  total_amount: number | null;
  file_name: string | null;
  confidence: string | null;
  created_at: string;
};

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get('sessionId')?.trim();
  if (!sessionId || sessionId.length < 6 || sessionId.length > 64) {
    return NextResponse.json({ bills: [], count: 0 });
  }

  let rows: Row[] = [];
  try {
    const service = getServiceClient();
    const { data, error } = await service
      .from('assembl_bills_ingested')
      .select('provider, category, bill_date, due_date, total_amount, file_name, confidence, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) throw error;
    rows = (data ?? []) as Row[];
  } catch {
    // A console that cannot reach the store shows the sample household rather
    // than an error — the page still works, it just says what it is showing.
    return NextResponse.json({ bills: [], count: 0, unavailable: true }, { status: 200 });
  }

  const bills: SessionBill[] = rows.map((r) => ({
    provider: r.provider ?? 'Unnamed provider',
    category: r.category ?? 'Other',
    amount: typeof r.total_amount === 'number' ? r.total_amount : null,
    billDate: r.bill_date,
    dueDate: r.due_date,
    fileName: r.file_name,
    confidence: r.confidence,
  }));

  return NextResponse.json(summariseSession(bills));
}
