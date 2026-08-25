import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getConsentRowsMock } from '@/lib/toro/mock-data';

export const metadata: Metadata = {
  title: 'Tōro · consent',
  description:
    'Per-entity consent grants. Every Tōro skill action requires an explicit grant — Home Assistant pattern.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type RouteParams = { slug: string };

export default async function ToroConsentPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!envConfigured) {
    redirect(`/login?redirect=/app/toro/${slug}/consent`);
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?redirect=/app/toro/${slug}/consent`);
  }

  // MOCK: replace with real query against public.toro_consent_grants
  // when the consent UI moves from preview to live. The migration
  // 20260511093000_toro_memory_and_consent.sql defines the table; the
  // filter at lib/toro/filters/consent-before-draft.ts already reads it.
  // This page just needs an RLS-scoped select.
  const rows = getConsentRowsMock(slug);

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1040px]">
        <p className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          <Link href={`/app/toro/${slug}`} className="hover:text-[color:var(--assembl-pounamu)]">assembl</Link>
          <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span>
          <Link href={`/app/toro/${slug}`} className="hover:text-[color:var(--assembl-pounamu)]">tōro</Link>
          <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span>
          <span>{slug}</span>
          <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span>
          <span>consent</span>
        </p>

        <h1
          className="mt-3 font-display leading-[1.02] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
        >
          consent
        </h1>
        <p className="mt-3 max-w-2xl font-mono text-[12px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
          per-entity grants · Home Assistant pattern · revoke any time
        </p>

        <div className="mt-10 overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]">
                <th className="px-4 py-3 text-left font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">skill</th>
                <th className="px-4 py-3 text-left font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">entity</th>
                <th className="px-4 py-3 text-left font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">status</th>
                <th className="hidden px-4 py-3 text-left font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] md:table-cell">granted by</th>
                <th className="hidden px-4 py-3 text-left font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] md:table-cell">granted at</th>
                <th className="hidden px-4 py-3 text-left font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] md:table-cell">expires</th>
                <th className="px-4 py-3 text-right font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-dashed border-[color:var(--assembl-cloud)] last:border-b-0"
                >
                  <td className="px-4 py-3 font-mono text-[12.5px] text-[color:var(--text-primary)]">
                    {r.skill}
                  </td>
                  <td className="px-4 py-3 font-display text-[14px] text-[color:var(--text-primary)]">
                    <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--text-secondary)]">
                      {r.entityType} →
                    </span>{' '}
                    {r.entityId}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.status === 'granted'
                          ? 'rounded-[1px] bg-[color:var(--assembl-pounamu-paper)] px-2 py-0.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]'
                          : 'rounded-[1px] bg-[#FBE6E6] px-2 py-0.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[#A0322B]'
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-[12px] text-[color:var(--text-primary)] md:table-cell">
                    {r.grantedBy}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-[12px] text-[color:var(--text-secondary)] md:table-cell">
                    {r.grantedAt}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-[12px] text-[color:var(--text-secondary)] md:table-cell">
                    {r.expiresAt ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled
                      title="Wire to /api/toro/consent revoke/grant in follow-up"
                      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-2.5 py-1 font-mono text-[12px] lowercase tracking-[0.08em] text-[color:var(--text-primary)] hover:border-[color:var(--assembl-pounamu)]"
                    >
                      {r.status === 'granted' ? 'revoke' : 'grant'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 font-mono text-[12px] lowercase tracking-[0.08em] text-[color:var(--text-secondary)]">
          backend: <code>public.toro_consent_grants</code> · migration{' '}
          <code>20260511093000_toro_memory_and_consent.sql</code> · enforced by{' '}
          <code>lib/toro/filters/consent-before-draft.ts</code>
        </p>

        <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-[color:var(--assembl-cloud)] pt-5 font-mono text-[12px] lowercase tracking-[0.12em]">
          <Link href={`/app/toro/${slug}`} className="text-[color:var(--assembl-pounamu)] hover:underline">← dashboard</Link>
          <Link href={`/app/toro/${slug}/inbox`} className="text-[color:var(--assembl-pounamu)] hover:underline">inbox</Link>
          <Link href={`/app/toro/${slug}/family`} className="text-[color:var(--assembl-pounamu)] hover:underline">family</Link>
        </nav>
      </div>
    </main>
  );
}
