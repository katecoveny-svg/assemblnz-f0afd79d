import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DraftRow, type DraftPaymentIntent, type DraftRowData, type TransitionLogEntry } from './DraftRow';
import type { DraftState } from '@/lib/toro/state-machine-types';

export const metadata: Metadata = {
  title: 'Tōro inbox',
  description:
    'Pending Tōro replies awaiting whānau approval. No reply ships without an explicit human click.',
  robots: { index: false, follow: false },
};

// Reads the auth session per-request — never prerender.
export const dynamic = 'force-dynamic';

// States we surface in the inbox view. Terminal `sent` and `rejected` drafts
// disappear from the active tray; `expired` rows are kept visible for one
// scroll so the user notices the time-out. `send_failed` is kept visible so
// the retry button is reachable.
const VISIBLE_STATES: DraftState[] = [
  'pending_approval',
  'reviewing',
  'approved',
  'edited_then_approved',
  'send_failed',
  'expired',
];

export default async function ToroInboxPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app/toro/inbox');
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect('/login?redirect=/app/toro/inbox');
  }

  const { data: drafts, error } = await supabase
    .from('toro_drafts')
    .select(
      'id, contact_name, contact_identifier, incoming_body, draft_body, confidence, created_at, chatwoot_conversation_id, status, send_error',
    )
    .in('status', VISIBLE_STATES)
    .order('created_at', { ascending: false })
    .limit(50);

  const draftIds = (drafts ?? []).map((d: { id: string }) => d.id);
  const transitionsByDraft = new Map<string, TransitionLogEntry[]>();
  const paymentIntentByDraft = new Map<string, DraftPaymentIntent>();

  if (draftIds.length > 0) {
    const { data: piRows } = await supabase
      .from('toro_payment_intents')
      .select('draft_id, stripe_payment_intent_id, amount_cents, currency, description, status, created_at')
      .in('draft_id', draftIds)
      .order('created_at', { ascending: false });

    // Most-recent PI wins per draft.
    for (const row of (piRows ?? []) as Array<{
      draft_id: string;
      stripe_payment_intent_id: string;
      amount_cents: number;
      currency: string;
      description: string | null;
      status: string;
    }>) {
      if (paymentIntentByDraft.has(row.draft_id)) continue;
      paymentIntentByDraft.set(row.draft_id, {
        stripe_payment_intent_id: row.stripe_payment_intent_id,
        amount_cents: row.amount_cents,
        currency: row.currency,
        description: row.description,
        status: row.status,
      });
    }

    const { data: rows } = await supabase
      .from('toro_draft_transitions')
      .select('draft_id, from_state, to_state, transitioned_by, transitioned_at, reason')
      .in('draft_id', draftIds)
      .order('transitioned_at', { ascending: false });

    for (const row of rows ?? []) {
      const key = row.draft_id as string;
      const list = transitionsByDraft.get(key) ?? [];
      list.push({
        from_state: (row.from_state as DraftState | null) ?? null,
        to_state: row.to_state as DraftState,
        transitioned_by: (row.transitioned_by as string | null) ?? null,
        transitioned_at: row.transitioned_at as string,
        reason: (row.reason as string | null) ?? null,
      });
      transitionsByDraft.set(key, list);
    }
  }

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[860px]">
        <p className="font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> tōro
        </p>
        <h1
          className="mt-2 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
        >
          inbox
        </h1>
        <p className="mt-3 max-w-xl font-mono text-[11px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
          pending whānau approval · no reply ships without an explicit human click
        </p>

        {error ? (
          <div className="mt-10 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-700">
              could not load drafts
            </p>
            <p className="mt-2 font-mono text-[12px] tracking-[0.04em] text-[color:var(--text-secondary)]">
              {error.message}
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-[0.04em] text-[color:var(--text-secondary)]">
              this usually means a recent toro_drafts or toro_draft_transitions
              migration hasn&apos;t been applied yet — run the migrations in
              supabase/migrations and refresh.
            </p>
          </div>
        ) : null}

        {!error && (drafts?.length ?? 0) === 0 ? (
          <div className="mt-10 rounded-[2px] border border-dashed border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-10 text-center">
            <p className="font-display text-[22px] font-light text-[color:var(--text-primary)]">
              kāore he karere — no pending drafts
            </p>
            <p className="mt-2 font-mono text-[11px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
              when a message comes in, tōro will draft a reply for you to review here
            </p>
          </div>
        ) : null}

        {!error && (drafts?.length ?? 0) > 0 ? (
          <ul className="mt-10 space-y-5">
            {(drafts as DraftRowData[]).map((d) => (
              <li key={d.id}>
                <DraftRow
                  draft={{ ...d, paymentIntent: paymentIntentByDraft.get(d.id) ?? null }}
                  transitions={transitionsByDraft.get(d.id) ?? []}
                />
              </li>
            ))}
          </ul>
        ) : null}

        <footer className="mt-16 border-t border-[color:var(--assembl-cloud)] pt-4 text-right font-mono text-[10.5px] lowercase tracking-[0.12em] text-[color:var(--text-secondary)]">
          tōro · hudson whānau pilot · single-tenant scaffold (multi-tenant follow-up)
        </footer>
      </div>
    </main>
  );
}
