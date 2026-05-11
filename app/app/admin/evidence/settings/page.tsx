import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loadEvidenceSettings } from '@/lib/evidence/settings';
import { SettingsForm } from './SettingsForm';

export const metadata: Metadata = {
  title: 'Evidence Ledger settings',
  description:
    'Per-tenant retention policy, public verifier, and cite-when-uncertain behaviour for the Evidence Ledger.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EvidenceSettingsPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app/admin/evidence/settings');
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect('/login?redirect=/app/admin/evidence/settings');
  }

  const loaded = await loadEvidenceSettings();
  const isScaffold = loaded.source === 'defaults';

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[860px]">
        <p className="font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> evidence ledger
        </p>
        <h1
          className="mt-2 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
        >
          settings
        </h1>
        <p className="mt-3 max-w-2xl font-mono text-[11px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
          retention · public verifier · cite-when-uncertain
        </p>

        {isScaffold ? (
          <div className="mt-7 rounded-[2px] border border-dashed border-[color:var(--assembl-gold-thread)] bg-white px-5 py-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-gold-thread)]">
              scaffold mode
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--text-primary)]">
              {loaded.error
                ? `Couldn't load tenant settings — ${loaded.error}.`
                : 'tenants.evidence_settings is showing defaults. Save once to persist your preferences.'}{' '}
              The form below is fully wired and writes to the column once the
              tenants migration (PR #79) and this PR&apos;s migration apply.
            </p>
          </div>
        ) : null}

        <SettingsForm initial={loaded.settings} />

        <footer className="mt-16 border-t border-[color:var(--assembl-cloud)] pt-4 text-right font-mono text-[10.5px] lowercase tracking-[0.12em] text-[color:var(--text-secondary)]">
          evidence ledger settings · phase 1 · per-tenant scope
        </footer>
      </div>
    </main>
  );
}
