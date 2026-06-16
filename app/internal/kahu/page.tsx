/**
 * /internal/kahu — Kahu dashboard home: voice-call evidence packs.
 *
 * Lists the most recent receipts (one per call) with their live call status.
 * Sits behind the existing /internal/* gate (middleware + the same email
 * allowlist used by /internal/live-feeds and /internal/tenders).
 *
 * Data is read with the service-role client (RLS-bypassing) so every receipt
 * is visible regardless of the caller. Wrapped in try/catch so an unconfigured
 * Supabase env shows a notice instead of crashing the build.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import type { CallStatus, VoiceReceiptPayload } from '@/lib/voice/types';
import {
  ManaReceiptCard,
  type ManaReceiptCardSummary,
} from '@/components/kahu/ManaReceiptCard';

export const metadata: Metadata = {
  title: 'Evidence packs · Kahu · assembl internal',
  description: 'Voice-call evidence packs — consent, booking, tool calls and a tamper-evident receipt for every call.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_EMAILS = new Set<string>(['assembl@assembl.co.nz', 'kate@assembl.co.nz']);

interface ReceiptRow {
  id: string;
  call_sid: string;
  receipt_number: number;
  payload_json: VoiceReceiptPayload;
  pdf_uri: string | null;
  created_at: string;
}

interface SessionStatusRow {
  call_sid: string;
  status: CallStatus;
}

function NotAuthorised({ email }: { email: string }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
        Internal · Kahu
      </p>
      <h1 className="mt-4 font-display text-display-md font-light">Not authorised.</h1>
      <p className="mt-4 text-body-md text-[color:var(--text-body)]">
        {email ? <>{email} isn’t on the allowlist for this page.</> : 'This page is restricted.'}
      </p>
    </main>
  );
}

function ConfigNotice() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
        Internal · Kahu
      </p>
      <h1 className="mt-4 font-display text-display-md font-light">Service client not configured.</h1>
      <p className="mt-4 text-body-md text-[color:var(--text-body)]">
        Set <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> and{' '}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> in the project env to load
        evidence packs.
      </p>
    </main>
  );
}

export default async function KahuPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/login?redirect=/internal/kahu');
  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) return <NotAuthorised email={user.email ?? ''} />;

  let receipts: ReceiptRow[] = [];
  let statusByCall = new Map<string, CallStatus>();
  try {
    const admin = getServiceClient();
    const { data: rows, error } = await admin
      .from('mana_receipt')
      .select('id, call_sid, receipt_number, payload_json, pdf_uri, created_at')
      .order('receipt_number', { ascending: false })
      .limit(20);
    if (error) throw error;
    receipts = (rows ?? []) as ReceiptRow[];

    // Enrich with the live call status from kete_session.
    const callSids = receipts.map((r) => r.call_sid);
    if (callSids.length > 0) {
      const { data: sessions } = await admin
        .from('kete_session')
        .select('call_sid, status')
        .in('call_sid', callSids);
      statusByCall = new Map(
        ((sessions ?? []) as SessionStatusRow[]).map((s) => [s.call_sid, s.status]),
      );
    }
  } catch {
    return <ConfigNotice />;
  }

  const summaries: ManaReceiptCardSummary[] = receipts.map((r) => ({
    id: r.id,
    receipt_number: r.receipt_number,
    call_sid: r.call_sid,
    created_at: r.created_at,
    status: statusByCall.get(r.call_sid) ?? r.payload_json.status,
    booking: r.payload_json.booking,
    consent_granted: r.payload_json.consent ? r.payload_json.consent.granted : null,
    transferred: r.payload_json.transferred,
    sms_sent: r.payload_json.sms_sent,
    pdf_uri: r.pdf_uri,
  }));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-[color:var(--text-primary)] lg:py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Internal · Kahu
          </p>
          <h1 className="mt-3 font-display text-display-lg font-light leading-tight">
            Evidence packs
          </h1>
          <p className="mt-4 max-w-2xl text-body-md text-[color:var(--text-body)]">
            One receipt per voice call — a downloadable bundle of PDFs covering consent,
            the booking, every tool the agent called, and a tamper-evident hash chain.
            Showing the {summaries.length} most recent.
          </p>
        </div>
        <a
          href="/internal/kahu/voice-calls"
          className="inline-flex items-center rounded-pill border border-[rgba(35,33,31,0.16)] px-4 py-2 text-sm font-medium text-[color:var(--text-primary)] transition-colors hover:border-[rgba(43,107,87,0.40)]"
        >
          View call log →
        </a>
      </header>

      {summaries.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[rgba(35,33,31,0.20)] p-12 text-center">
          <p className="font-display text-display-md font-light text-[color:var(--text-primary)]">
            No calls yet.
          </p>
          <p className="mt-3 text-body-md text-[color:var(--text-body)]">
            When the voice agent takes its first call, the evidence pack lands here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {summaries.map((s) => (
            <ManaReceiptCard key={s.id} receipt={s} />
          ))}
        </div>
      )}
    </main>
  );
}
