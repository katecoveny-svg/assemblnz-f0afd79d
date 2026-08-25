/**
 * /internal/live-feeds — Kate-facing audit of every regulatory source in
 * kb_sources: the feeds assembl checks drafts against.
 *
 * Auth: email allowlist (assembl@assembl.co.nz, kate@assembl.co.nz). Unauth'd
 * users are redirected to /login; anyone else gets a NotAuthorised pane.
 *
 * Read via the service-role client (behind the allowlist) so inactive and
 * failing sources are visible. No customer-facing UI.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { normalizeKetePacks } from '@/lib/live-feed/kete-relevance';

export const metadata: Metadata = {
  title: 'Live feeds · assembl internal',
  description: 'Audit of every regulatory source assembl checks drafts against.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_EMAILS = new Set<string>(['assembl@assembl.co.nz', 'kate@assembl.co.nz']);

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

type SourceRow = {
  id: string;
  name: string | null;
  url: string | null;
  category: string | null;
  active: boolean | null;
  status: string | null;
  agent_packs: string[] | null;
  last_successful_fetch: string | null;
  last_checked_at: string | null;
  consecutive_failures: number | null;
};

function isInternal(url: string | null) {
  return !!url && url.startsWith('internal://');
}

// A polled source is stale when it's failing, has never succeeded, or hasn't
// succeeded in over a week. Internal curated packs aren't polled, so they're
// excluded from the "needs attention" view.
function isStale(s: SourceRow): boolean {
  if (isInternal(s.url) || !s.active) return false;
  if (s.status === 'error') return true;
  if (!s.last_successful_fetch) return true;
  return Date.now() - new Date(s.last_successful_fetch).getTime() > STALE_AFTER_MS;
}

function failureReason(s: SourceRow): string {
  if (s.status === 'error') {
    const n = s.consecutive_failures ?? 0;
    return `Status: error${n > 0 ? ` · ${n} consecutive failure${n === 1 ? '' : 's'}` : ''}`;
  }
  if (!s.last_successful_fetch) return 'No successful fetch on record';
  return 'No successful fetch in over 7 days';
}

function fmt(ts: string | null): string {
  if (!ts) return '—';
  return new Intl.DateTimeFormat('en-NZ', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Pacific/Auckland',
  }).format(new Date(ts));
}

function NotAuthorised({ email }: { email: string }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
        Internal · live feeds
      </p>
      <h1 className="mt-4 font-display text-display-md font-light">Not authorised.</h1>
      <p className="mt-4 text-body-md text-[color:var(--text-body)]">
        {email ? <>{email} isn’t on the allowlist for this page.</> : 'This page is restricted.'}
      </p>
    </main>
  );
}

export default async function LiveFeedsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/login?redirect=/internal/live-feeds');
  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) return <NotAuthorised email={user.email ?? ''} />;

  let sources: SourceRow[] = [];
  try {
    const admin = getServiceClient();
    const { data: rows } = await admin
      .from('kb_sources')
      .select('id, name, url, category, active, status, agent_packs, last_successful_fetch, last_checked_at, consecutive_failures')
      .order('last_successful_fetch', { ascending: true, nullsFirst: true });
    sources = (rows ?? []) as SourceRow[];
  } catch {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          Internal · live feeds
        </p>
        <h1 className="mt-4 font-display text-display-md font-light">Service client not configured.</h1>
        <p className="mt-4 text-body-md text-[color:var(--text-body)]">
          Set <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in the project env to load
          this audit.
        </p>
      </main>
    );
  }
  const activeCount = sources.filter((s) => s.active).length;
  const stale = sources.filter(isStale);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 text-[color:var(--text-primary)] lg:py-16">
      <header className="mb-10">
        <p className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          Internal · live feeds
        </p>
        <h1 className="mt-3 font-display text-display-lg font-light">The source layer, audited.</h1>
        <p className="mt-4 max-w-2xl text-body-md text-[color:var(--text-body)]">
          Every regulatory and news source assembl checks drafts against — {sources.length} in total,
          {' '}{activeCount} active. {stale.length} need attention.
        </p>
      </header>

      {stale.length > 0 && (
        <section className="mb-10 rounded-[14px] border border-[rgba(172,88,56,0.30)] bg-[rgba(172,88,56,0.05)] p-5">
          <p className="font-mono text-eyebrow uppercase tracking-[0.22em] text-[color:var(--assembl-clay)]">
            Needs attention · {stale.length}
          </p>
          <ul className="mt-4 space-y-3">
            {stale.map((s) => (
              <li key={s.id} className="flex flex-col gap-1 border-b border-[rgba(35,33,31,0.08)] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <span className="font-medium">{s.name ?? '(unnamed)'}</span>{' '}
                  <span className="font-mono text-xs text-[color:var(--text-secondary)]">{s.url}</span>
                </div>
                <span className="font-mono text-xs text-[color:var(--assembl-clay)]">{failureReason(s)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="overflow-x-auto rounded-[14px] border border-[rgba(35,33,31,0.10)]">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(35,33,31,0.12)] bg-[color:var(--assembl-paper)] font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
              <th className="px-4 py-3 font-normal">Source</th>
              <th className="px-4 py-3 font-normal">Base URL</th>
              <th className="px-4 py-3 font-normal">Last successful poll</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Kete relevance</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => {
              const kete = normalizeKetePacks(s.agent_packs ?? []);
              const stale = isStale(s);
              return (
                <tr key={s.id} className="border-b border-[rgba(35,33,31,0.07)] align-top last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[color:var(--text-primary)]">{s.name ?? '(unnamed)'}</div>
                    <div className="font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                      {s.category ?? '—'}{!s.active && ' · inactive'}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[color:var(--text-secondary)] break-all">{s.url ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[color:var(--text-body)]">{fmt(s.last_successful_fetch)}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[12px] uppercase tracking-[0.12em]"
                      style={{
                        background: stale ? 'rgba(172,88,56,0.10)' : 'rgba(43,107,87,0.10)',
                        color: stale ? 'var(--assembl-clay)' : 'var(--assembl-pounamu)',
                      }}
                    >
                      {s.status ?? 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {kete.length === 0 ? (
                        <span className="text-[color:var(--text-secondary)]">—</span>
                      ) : (
                        kete.map((k) => (
                          <span key={k} className="rounded-full border border-[rgba(35,33,31,0.14)] px-2 py-0.5 font-mono text-[12px] lowercase tracking-[0.08em] text-[color:var(--text-body)]">
                            {k}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
