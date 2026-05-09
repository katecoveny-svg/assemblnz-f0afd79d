import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DraftRow, type DraftRowData } from './DraftRow';

export const metadata: Metadata = {
  title: 'Tōro inbox',
  description:
    'Pending Tōro replies awaiting whānau approval. No reply ships without an explicit human click.',
  robots: { index: false, follow: false },
};

// Reads the auth session per-request — never prerender.
export const dynamic = 'force-dynamic';

export default async function ToroInboxPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
      'id, contact_name, contact_identifier, incoming_body, draft_body, confidence, created_at, chatwoot_conversation_id',
    )
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false })
    .limit(50);

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
              this usually means the toro_drafts migration hasn&apos;t been applied yet —
              run the migration in supabase/migrations and refresh.
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
                <DraftRow draft={d} />
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
