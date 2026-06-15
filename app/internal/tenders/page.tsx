/**
 * /internal/tenders — Kate-facing dashboard of live GETS tender entries.
 *
 * Auth: email allowlist (assembl@assembl.co.nz, kate@assembl.co.nz). Anyone
 * else gets a NotAuthorised pane. Unauth'd users are redirected by the
 * middleware (which gates /internal/*).
 *
 * Data: live_feed_entries where source_slug='gets', sorted by capability
 * score desc then published_at desc. Banded into high / medium / low.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listLiveFeedEntries, listRecentPolls } from '@/lib/live-feed/storage';
import {
  bandClasses,
  bandForScore,
  formatKeteList,
  groupSignals,
  topRelevantKete,
} from '@/lib/live-feed/kete-relevance';
import {
  HIGH_MATCH_THRESHOLD,
  MEDIUM_MATCH_THRESHOLD,
  type LiveFeedEntry,
} from '@/lib/live-feed/types';

export const metadata: Metadata = {
  title: 'Tender feed · assembl internal',
  description: 'GETS tender ingest — daily live feed of NZ government tender notices, scored against assembl capability.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_EMAILS = new Set<string>([
  'assembl@assembl.co.nz',
  'kate@assembl.co.nz',
]);

const STATUS_LABEL: Record<LiveFeedEntry['status'], string> = {
  new: 'new',
  reviewing: 'reviewing',
  go: 'go',
  no_go: 'no-go',
  drafted: 'drafted',
  submitted: 'submitted',
  archived: 'archived',
};

export default async function TendersPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect('/login?redirect=/internal/tenders');
  }

  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) {
    return <NotAuthorised email={user.email ?? ''} />;
  }

  const [entries, recentPolls] = await Promise.all([
    listLiveFeedEntries({ sourceSlug: 'gets', limit: 200 }),
    listRecentPolls('gets', 5),
  ]);

  const high = entries.filter((e) => e.capability_score >= HIGH_MATCH_THRESHOLD);
  const medium = entries.filter(
    (e) =>
      e.capability_score >= MEDIUM_MATCH_THRESHOLD &&
      e.capability_score < HIGH_MATCH_THRESHOLD,
  );
  const low = entries.filter((e) => e.capability_score < MEDIUM_MATCH_THRESHOLD);
  const lastOk = recentPolls.find((p) => p.status === 'ok');

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16 font-inter text-taupe-900">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-taupe-600 mb-2">
          Internal · Tender feed · gets.govt.nz
        </p>
        <h1 className="font-cormorant text-4xl lg:text-5xl text-pounamu-900 leading-tight">
          Every NZ government tender, scored before you read it.
        </h1>
        <p className="mt-4 text-taupe-700 max-w-2xl">
          The GETS live feed polls daily at 09:00 Pacific/Auckland. Each
          tender is scored against assembl&apos;s capability profile and
          banded into high / medium / low match. High-match tenders trigger
          a notification within the hour.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-taupe-600">
            <span className="font-medium text-pounamu-900">{high.length}</span> high
          </span>
          <span className="text-taupe-600">
            <span className="font-medium text-pounamu-900">{medium.length}</span> medium
          </span>
          <span className="text-taupe-600">
            <span className="font-medium text-pounamu-900">{low.length}</span> low
          </span>
          <span className="text-taupe-600">
            last successful poll{' '}
            <span className="font-mono text-xs text-taupe-700">
              {lastOk?.finished_at ? formatRelative(lastOk.finished_at) : 'no successful poll yet'}
            </span>
          </span>
          <span className="text-taupe-600">
            signed in as <span className="font-mono text-xs">{email}</span>
          </span>
        </div>
      </header>

      {high.length > 0 && (
        <Section title="High match · respond to these" entries={high} />
      )}
      {medium.length > 0 && (
        <Section title="Medium match · worth a scan" entries={medium} />
      )}
      {low.length > 0 && (
        <Section title="Low match · reference only" entries={low} collapsedByDefault />
      )}

      {entries.length === 0 && (
        <div className="border border-dashed border-taupe-300 rounded-lg p-8 text-center text-taupe-600">
          <p>No tenders ingested yet.</p>
          <p className="mt-2 text-xs">
            The first poll seeds the current GETS RSS feed (open tenders).
            Manual run via <code className="font-mono text-xs">POST /functions/v1/live-feed-gets-poll</code> with{' '}
            <code className="font-mono text-xs">{`{"force":true}`}</code>.
          </p>
        </div>
      )}

      <footer className="mt-16 pt-8 border-t border-taupe-200 text-xs text-taupe-500">
        <p>
          Internal tool. Tender data sourced from{' '}
          <a
            href="https://www.gets.govt.nz/ExternalRSSFeed.htm"
            className="underline hover:text-pounamu-900"
            target="_blank"
            rel="noreferrer noopener"
          >
            gets.govt.nz RSS feed
          </a>
          . Capability scoring is signal-driven and explainable on every detail page.
        </p>
      </footer>
    </main>
  );
}

function Section({
  title,
  entries,
  collapsedByDefault = false,
}: {
  title: string;
  entries: LiveFeedEntry[];
  collapsedByDefault?: boolean;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-sm uppercase tracking-widest text-taupe-600 mb-4">{title}</h2>
      <div className="grid gap-4">
        {collapsedByDefault ? (
          <details className="group">
            <summary className="cursor-pointer text-sm text-taupe-700 mb-3">
              show {entries.length}
            </summary>
            <div className="grid gap-4">
              {entries.map((e) => (
                <TenderCard key={e.id} entry={e} />
              ))}
            </div>
          </details>
        ) : (
          entries.map((e) => <TenderCard key={e.id} entry={e} />)
        )}
      </div>
    </section>
  );
}

function TenderCard({ entry }: { entry: LiveFeedEntry }) {
  const band = bandForScore(entry.capability_score);
  const badge = bandClasses(band).badge;
  const meta = entry.tender_meta;
  const topKete = topRelevantKete(entry.kete_relevance, 3);
  const { positive } = groupSignals(entry.capability_assessment);

  return (
    <Link
      href={`/internal/tenders/${entry.id}`}
      className="block border border-taupe-200 rounded-lg p-5 bg-mist-50 hover:bg-mist-100 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-cormorant text-xl text-pounamu-900 leading-snug">
          {meta?.ref_number ? `${meta.ref_number} · ` : ''}{entry.title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded border ${badge}`}>
            score {entry.capability_score}
          </span>
          <span className="text-xs px-2 py-1 rounded border bg-mist-100 text-taupe-700 border-taupe-300">
            {STATUS_LABEL[entry.status]}
          </span>
        </div>
      </div>

      {entry.summary && (
        <p className="text-sm text-taupe-700 mb-3 line-clamp-2">{entry.summary}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-taupe-600">
        {meta?.agency && <span>{meta.agency}</span>}
        {meta?.tender_type && (
          <span className="font-mono">{meta.tender_type}</span>
        )}
        {meta?.close_at && (
          <span>closes {formatRelative(meta.close_at)}</span>
        )}
        {topKete.length > 0 && (
          <span className="text-taupe-700">{formatKeteList(entry.kete_relevance)}</span>
        )}
      </div>

      {positive.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {positive.slice(0, 4).map((s) => (
            <span
              key={s.label}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-pounamu-100 text-pounamu-900 border border-pounamu-300"
            >
              {s.label} +{s.points}
            </span>
          ))}
          {positive.length > 4 && (
            <span className="text-[11px] font-mono px-2 py-0.5 text-taupe-500">
              +{positive.length - 4} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function formatRelative(iso: string): string {
  const dt = new Date(iso);
  if (!Number.isFinite(dt.getTime())) return iso;
  const diffMs = dt.getTime() - Date.now();
  const absDays = Math.abs(diffMs) / 86_400_000;
  const direction = diffMs >= 0 ? 'in' : 'ago';
  if (absDays < 1) {
    const h = Math.round(Math.abs(diffMs) / 3_600_000);
    return direction === 'in' ? `in ${h}h` : `${h}h ago`;
  }
  const d = Math.round(absDays);
  return direction === 'in' ? `in ${d}d` : `${d}d ago`;
}

function NotAuthorised({ email }: { email: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-lg border border-taupe-300 bg-mist-50 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-taupe-600">
          not authorised
        </p>
        <h1 className="mt-3 font-cormorant text-3xl text-pounamu-900">
          Internal tender feed is restricted.
        </h1>
        <p className="mt-4 text-sm text-taupe-700">
          {email || 'This account'} is signed in, but it is not on the allowlist for /internal/tenders.
        </p>
      </div>
    </main>
  );
}
