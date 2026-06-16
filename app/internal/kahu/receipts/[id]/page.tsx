/**
 * /internal/kahu/receipts/[id] — full evidence pack for one voice call.
 *
 * Sits behind the existing /internal/* gate (middleware + the same email
 * allowlist used by the rest of /internal). Reads the mana_receipt by id and
 * its kete_session by call_sid with the service-role client, then renders
 * ManaReceiptDetail. 404s via notFound() when the receipt is missing.
 */
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import type { KeteSession, VoiceReceiptPayload } from '@/lib/voice/types';
import { ManaReceiptDetail } from '@/components/kahu/ManaReceiptDetail';

export const metadata: Metadata = {
  title: 'Evidence pack · Kahu · assembl internal',
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
  sha256: string;
  prev_hash: string;
  chain_hash: string;
  pdf_uri: string | null;
  created_at: string;
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
        Set <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in the project env to load
        this evidence pack.
      </p>
    </main>
  );
}

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect(`/login?redirect=/internal/kahu/receipts/${id}`);
  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) return <NotAuthorised email={user.email ?? ''} />;

  let receipt: ReceiptRow | null = null;
  let session: KeteSession | null = null;
  try {
    const admin = getServiceClient();
    const { data: row, error } = await admin
      .from('mana_receipt')
      .select('id, call_sid, receipt_number, payload_json, sha256, prev_hash, chain_hash, pdf_uri, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    receipt = (row as ReceiptRow | null) ?? null;

    if (receipt) {
      const { data: sessionRow } = await admin
        .from('kete_session')
        .select('*')
        .eq('call_sid', receipt.call_sid)
        .maybeSingle();
      session = (sessionRow as KeteSession | null) ?? null;
    }
  } catch {
    return <ConfigNotice />;
  }

  if (!receipt) notFound();

  return (
    <ManaReceiptDetail
      receipt={{
        call_sid: receipt.call_sid,
        payload: receipt.payload_json,
        sha256: receipt.sha256,
        prev_hash: receipt.prev_hash,
        chain_hash: receipt.chain_hash,
        receipt_number: receipt.receipt_number,
        created_at: receipt.created_at,
        pdf_uri: receipt.pdf_uri,
      }}
      session={session}
    />
  );
}
