import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFamilyMockData } from '@/lib/toro/mock-data';

export const metadata: Metadata = {
  title: 'Tōro · whānau',
  description:
    'Per-child profile, today\'s routines, consent grants. Tōro never touches a child entity without an explicit grant.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type RouteParams = { slug: string };

export default async function ToroFamilyPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!envConfigured) {
    redirect(`/login?redirect=/app/toro/${slug}/family`);
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?redirect=/app/toro/${slug}/family`);
  }

  // MOCK: replace with real query against public.children scoped by tenant.
  // The schema for `children` is already shipped (20260321 migration). Real
  // wiring needs: join children → tenants, filter by current tenant_id,
  // join consent grants per (skill, child_id) tuple. Today's bus + gear
  // come from toro_routines + toro_memory_blocks(block_type='routines').
  const children = getFamilyMockData(slug);

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1040px]">
        {/* breadcrumb */}
        <p className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          <Link href={`/app/toro/${slug}`} className="hover:text-[color:var(--assembl-pounamu)]">
            assembl
          </Link>
          <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span>
          <Link href={`/app/toro/${slug}`} className="hover:text-[color:var(--assembl-pounamu)]">tōro</Link>
          <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span>
          <span>{slug}</span>
          <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span>
          <span>whānau</span>
        </p>

        <h1
          className="mt-3 font-display leading-[1.02] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
        >
          whānau
        </h1>
        <p className="mt-3 max-w-2xl font-mono text-[12px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
          per-child routines, gear, activities, consent · Tōro never touches a child entity without an explicit grant
        </p>

        {/* child cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {children.map((child) => (
            <article
              key={child.id}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6 shadow-[var(--shadow-card)]"
            >
              {/* header */}
              <header className="flex items-center gap-4 border-b border-dashed border-[color:var(--assembl-cloud)] pb-4">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full font-display text-[20px] text-white"
                  style={{ background: child.accentColor }}
                  aria-hidden
                >
                  {child.name[0]}
                </span>
                <div className="flex-1">
                  <h2
                    className="font-display text-[22px] leading-tight text-[color:var(--text-primary)]"
                    style={{ fontWeight: 400 }}
                  >
                    {child.name}
                  </h2>
                  <p className="font-mono text-[12px] lowercase tracking-[0.1em] text-[color:var(--text-secondary)]">
                    age {child.age} · year {child.year} · {child.school}
                  </p>
                </div>
                <span
                  className={
                    child.consentStatus === 'all_granted'
                      ? 'rounded-[1px] bg-[color:var(--assembl-pounamu-paper)] px-2 py-1 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]'
                      : 'rounded-[1px] bg-[#FBF2DD] px-2 py-1 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--assembl-gold-thread)]'
                  }
                >
                  {child.consentStatus === 'all_granted' ? 'consents ok' : 'review consents'}
                </span>
              </header>

              {/* today */}
              <section className="mt-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  today · bus
                </p>
                <p className="mt-1 font-display text-[15px] text-[color:var(--text-primary)]">
                  {child.todaysBus}
                </p>
              </section>

              <section className="mt-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  today · gear
                </p>
                <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5">
                  {child.todaysGear.map((item) => (
                    <li
                      key={item}
                      className="rounded-[1px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2 py-1 font-mono text-[12px] lowercase tracking-[0.06em] text-[color:var(--text-primary)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  this week
                </p>
                <ul className="mt-1 space-y-1 font-display text-[14.5px] text-[color:var(--text-primary)]">
                  {child.weekActivities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </section>

              {/* consent grants */}
              <section className="mt-5 border-t border-[color:var(--assembl-cloud)] pt-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  consent grants · per-skill
                </p>
                <ul className="mt-2 space-y-1.5">
                  {child.consents.map((c) => (
                    <li
                      key={`${c.skill}-${c.entity}`}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="font-mono text-[12px] lowercase tracking-[0.04em] text-[color:var(--text-primary)]">
                        {c.skill}
                      </span>
                      <span className="flex-1 truncate font-mono text-[12px] lowercase tracking-[0.04em] text-[color:var(--text-secondary)]">
                        → {c.entity}
                      </span>
                      <span
                        className={
                          c.status === 'granted'
                            ? 'rounded-[1px] bg-[color:var(--assembl-pounamu-paper)] px-1.5 py-0.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]'
                            : 'rounded-[1px] bg-[#FBE6E6] px-1.5 py-0.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[#A0322B]'
                        }
                      >
                        {c.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* actions */}
              <footer className="mt-5 flex items-center gap-3 border-t border-[color:var(--assembl-cloud)] pt-4">
                <button
                  type="button"
                  className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-3 py-1.5 font-mono text-[12px] lowercase tracking-[0.06em] text-[color:var(--text-primary)] hover:border-[color:var(--assembl-pounamu)]"
                  disabled
                  title="Wire to /api/toro/children PATCH in follow-up"
                >
                  edit profile
                </button>
                <Link
                  href={`/app/toro/${slug}/consent?child=${encodeURIComponent(child.name)}`}
                  className="font-mono text-[12px] lowercase tracking-[0.08em] text-[color:var(--assembl-pounamu)] hover:underline"
                >
                  manage consent →
                </Link>
              </footer>
            </article>
          ))}
        </div>

        {/* add child stub */}
        <div className="mt-8">
          <button
            type="button"
            disabled
            title="Wire to /api/toro/children POST in follow-up"
            className="rounded-[2px] border border-dashed border-[color:var(--assembl-cloud)] bg-transparent px-5 py-4 font-mono text-[12px] lowercase tracking-[0.12em] text-[color:var(--text-secondary)] hover:border-[color:var(--assembl-pounamu)]"
          >
            + add tamaiti to whānau (stub · phase 2)
          </button>
        </div>

        {/* footer nav */}
        <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-[color:var(--assembl-cloud)] pt-5 font-mono text-[12px] lowercase tracking-[0.12em]">
          <Link href={`/app/toro/${slug}`} className="text-[color:var(--assembl-pounamu)] hover:underline">← dashboard</Link>
          <Link href={`/app/toro/${slug}/inbox`} className="text-[color:var(--assembl-pounamu)] hover:underline">inbox</Link>
          <Link href={`/app/toro/${slug}/consent`} className="text-[color:var(--assembl-pounamu)] hover:underline">consent</Link>
        </nav>
      </div>
    </main>
  );
}
