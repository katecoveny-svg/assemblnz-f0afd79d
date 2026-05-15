import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDashboardMockData } from '@/lib/toro/mock-data';
import { InstallToroCta } from './InstallToroCta';

export const metadata: Metadata = {
  title: 'Tōro · today',
  description:
    'Tōro home — today\'s drafts, this week\'s routines, recent Mana Receipts.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type RouteParams = { slug: string };

export default async function ToroDashboardPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!envConfigured) {
    redirect(`/login?redirect=/app/toro/${slug}`);
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?redirect=/app/toro/${slug}`);
  }

  // MOCK: replace with real queries when toro_drafts, toro_routines,
  // toro_memory_blocks, toro_episodic_events tables are queryable per-tenant.
  // Real wiring needs: scope by tenant_id (from slug → tenants table),
  // count pending_approval drafts, list 5 most-recent toro_episodic_events
  // of type 'mana_receipt', etc.
  const mock = getDashboardMockData(slug);
  const firstName = (userData.user.email ?? 'whānau')
    .split('@')[0]
    .replace(/[._-]/g, ' ');

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1040px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> tōro <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> {slug}
          </p>
          <InstallToroCta />
        </div>

        {/* hero greeting */}
        <h1
          className="mt-3 font-display leading-[1.02] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)' }}
        >
          Kia ora, <em className="not-italic capitalize text-[color:var(--assembl-pounamu)]">{firstName}</em>.
        </h1>
        <p
          className="mt-4 max-w-2xl font-display text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', fontStyle: 'italic' }}
        >
          Tōro has <span className="text-[color:var(--assembl-pounamu-deep)]">{mock.pendingDrafts}</span> {mock.pendingDrafts === 1 ? 'thing' : 'things'} waiting for you.
        </p>

        {/* grid of cards */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Today's drafts */}
          <Link
            href={`/app/toro/${slug}/inbox`}
            className="group rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6 transition hover:border-[color:var(--assembl-pounamu)] hover:shadow-[var(--shadow-soft)]"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              today · pending approval
            </p>
            <p
              className="mt-3 font-display leading-none text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: '3.2rem' }}
            >
              {mock.pendingDrafts}
            </p>
            <p className="mt-2 font-mono text-[11.5px] lowercase tracking-[0.1em] text-[color:var(--text-secondary)]">
              drafts in the inbox <span className="ml-1 text-[color:var(--assembl-pounamu)] group-hover:underline">review →</span>
            </p>
            {mock.driftWarn ? (
              <p className="mt-4 inline-block rounded-[2px] bg-[color:var(--assembl-pounamu-paper)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]">
                {mock.driftWarn}
              </p>
            ) : null}
          </Link>

          {/* This week's whānau routines */}
          <div className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              this week · whānau routines
            </p>
            <ul className="mt-4 space-y-2.5">
              {mock.routines.map((r) => (
                <li
                  key={r.id}
                  className="flex items-baseline justify-between gap-3 border-b border-dashed border-[color:var(--assembl-cloud)] pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="font-display text-[15px] text-[color:var(--text-primary)]">
                    {r.title}
                  </span>
                  <span className="font-mono text-[10.5px] lowercase tracking-[0.08em] text-[color:var(--text-secondary)]">
                    {r.cadence}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Child profile thumbnails */}
          <Link
            href={`/app/toro/${slug}/family`}
            className="group rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6 transition hover:border-[color:var(--assembl-pounamu)] hover:shadow-[var(--shadow-soft)]"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              whānau · tamariki
            </p>
            <ul className="mt-4 space-y-2.5">
              {mock.children.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full font-display text-[15px] text-white"
                    style={{ background: c.accentColor }}
                    aria-hidden
                  >
                    {c.name[0]}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-[15px] text-[color:var(--text-primary)]">
                      {c.name}
                    </span>
                    <span className="block font-mono text-[10.5px] lowercase tracking-[0.06em] text-[color:var(--text-secondary)]">
                      {c.school} · year {c.year}
                    </span>
                  </span>
                  <span
                    className={
                      c.consentStatus === 'all_granted'
                        ? 'rounded-[1px] bg-[color:var(--assembl-pounamu-paper)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]'
                        : 'rounded-[1px] bg-[#FBF2DD] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--assembl-gold-thread)]'
                    }
                  >
                    {c.consentStatus === 'all_granted' ? 'ok' : 'review'}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[11.5px] lowercase tracking-[0.1em] text-[color:var(--assembl-pounamu)] group-hover:underline">
              open family →
            </p>
          </Link>

          {/* Recent Mana Receipts */}
          <div className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6 md:col-span-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              recent · mana receipts
            </p>
            <ul className="mt-4 divide-y divide-[color:var(--assembl-cloud)]">
              {mock.manaReceipts.map((r) => (
                <li key={r.id} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span className="flex-1 truncate font-display text-[15px] text-[color:var(--text-primary)]">
                    {r.title}
                  </span>
                  <span className="font-mono text-[10.5px] lowercase tracking-[0.06em] text-[color:var(--text-secondary)]">
                    {r.relativeTime}
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]">
                    {r.evidenceCount} citations
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tōro health */}
          <div className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              tōro · health
            </p>
            <dl className="mt-4 space-y-3 font-mono text-[12px] text-[color:var(--text-primary)]">
              <div className="flex items-baseline justify-between">
                <dt className="lowercase tracking-[0.08em] text-[color:var(--text-secondary)]">memory blocks</dt>
                <dd className="font-display text-[20px] font-light">{mock.health.memoryBlocks}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="lowercase tracking-[0.08em] text-[color:var(--text-secondary)]">episodic · last 7d</dt>
                <dd className="font-display text-[20px] font-light">{mock.health.episodicLast7d}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="lowercase tracking-[0.08em] text-[color:var(--text-secondary)]">drafts sent · 7d</dt>
                <dd className="font-display text-[20px] font-light">{mock.health.draftsSentLast7d}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="lowercase tracking-[0.08em] text-[color:var(--text-secondary)]">3-gates pass rate</dt>
                <dd className="font-display text-[20px] font-light text-[color:var(--assembl-pounamu-deep)]">{mock.health.threeGatePassRate}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* secondary nav */}
        <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-[color:var(--assembl-cloud)] pt-5 font-mono text-[11px] lowercase tracking-[0.12em]">
          <Link href={`/app/toro/${slug}/inbox`} className="text-[color:var(--assembl-pounamu)] hover:underline">inbox</Link>
          <Link href={`/app/toro/${slug}/family`} className="text-[color:var(--assembl-pounamu)] hover:underline">family</Link>
          <Link href={`/app/toro/${slug}/consent`} className="text-[color:var(--assembl-pounamu)] hover:underline">consent</Link>
          <Link href={`/app/toro/${slug}/billing`} className="text-[color:var(--assembl-pounamu)] hover:underline">billing</Link>
          <form action="/auth/sign-out" method="post" className="ml-auto">
            <button type="submit" className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">sign out</button>
          </form>
        </nav>
      </div>
    </main>
  );
}
