/**
 * /internal/tenders/[id] — per-tender detail surface.
 *
 * Renders the extracted tender meta, the full signal breakdown, the
 * drafted go/no-go reasoning, the response draft (if any), and a status
 * update form. The Mana Receipt block links to /verify for the public
 * verifier flow.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLiveFeedEntry } from '@/lib/live-feed/storage';
import {
  bandClasses,
  bandForScore,
  describeAssessment,
  groupSignals,
  labelForBand,
  topRelevantKete,
} from '@/lib/live-feed/kete-relevance';
import type {
  GetsTenderMeta,
  LiveFeedEntry,
  LiveFeedEntryStatus,
} from '@/lib/live-feed/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Tender detail · assembl internal',
  robots: { index: false, follow: false },
};

const ALLOWED_EMAILS = new Set<string>([
  'assembl@assembl.co.nz',
  'kate@assembl.co.nz',
]);

const STATUSES: Array<{ value: LiveFeedEntryStatus; label: string }> = [
  { value: 'new', label: 'new' },
  { value: 'reviewing', label: 'reviewing' },
  { value: 'go', label: 'go' },
  { value: 'no_go', label: 'no-go' },
  { value: 'drafted', label: 'drafted' },
  { value: 'submitted', label: 'submitted' },
  { value: 'archived', label: 'archived' },
];

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect(`/login?redirect=/internal/tenders/${id}`);

  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 text-taupe-900">
        <p className="text-sm">Not authorised. signed in as {email}.</p>
      </main>
    );
  }

  const entry = await getLiveFeedEntry(id);
  if (!entry) notFound();

  const band = bandForScore(entry.capability_score);
  const badge = bandClasses(band);
  const { positive } = groupSignals(entry.capability_assessment);
  const kete = topRelevantKete(entry.kete_relevance, 9);
  const meta = entry.tender_meta as GetsTenderMeta | null;
  const receipt = entry.capability_assessment?.mana_receipt;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:py-16 font-inter text-taupe-900">
      <p className="mb-4">
        <Link
          href="/internal/tenders"
          className="text-xs font-mono uppercase tracking-widest text-taupe-600 hover:text-pounamu-900"
        >
          ← all tenders
        </Link>
      </p>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-taupe-600 mb-2">
          {meta?.feed_kind?.toUpperCase() ?? 'GETS'}
          {meta?.tender_type ? ` · ${meta.tender_type}` : ''}
          {meta?.ref_number ? ` · ${meta.ref_number}` : ''}
        </p>
        <h1 className="font-cormorant text-3xl lg:text-4xl text-pounamu-900 leading-tight">
          {entry.title}
        </h1>
        {entry.summary && (
          <p className="mt-4 text-taupe-700 whitespace-pre-wrap">{entry.summary}</p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2 border border-taupe-200 rounded-lg p-5 bg-mist-50">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs px-2 py-1 rounded border ${badge.badge}`}>
              {labelForBand(band)}
            </span>
            <span className="text-xs font-mono text-taupe-600">
              {entry.capability_score}/100
            </span>
          </div>
          <p className="text-sm text-taupe-700 mb-4">
            {describeAssessment(entry.capability_assessment)}
          </p>
          <div
            className="h-2 rounded bg-taupe-200 overflow-hidden"
            aria-label={`capability score ${entry.capability_score} of 100`}
          >
            <div
              className={`h-full ${badge.bar}`}
              style={{ width: `${entry.capability_score}%` }}
            />
          </div>

          {positive.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-widest text-taupe-600 mb-2">
                signals (positive)
              </p>
              <ul className="space-y-1.5">
                {positive.map((s) => (
                  <li key={s.label + s.points} className="text-sm flex items-start justify-between gap-3">
                    <span>
                      {s.label}
                      {s.evidence && (
                        <span className="text-taupe-500 ml-2 font-mono text-xs">
                          &quot;{s.evidence}&quot;
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-xs text-pounamu-900 whitespace-nowrap">+{s.points}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {kete.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-widest text-taupe-600 mb-2">
                kete relevance
              </p>
              <div className="flex flex-wrap gap-1.5">
                {kete.map(({ kete: k, score }) => (
                  <span
                    key={k.slug}
                    className="text-[11px] font-mono px-2 py-0.5 rounded border"
                    style={{ borderColor: k.accent, color: k.accent }}
                  >
                    {k.name} {score}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="border border-taupe-200 rounded-lg p-5 bg-white text-sm">
          <p className="text-xs uppercase tracking-widest text-taupe-600 mb-3">
            tender meta
          </p>
          <dl className="space-y-2">
            {meta?.agency && (
              <div>
                <dt className="text-xs text-taupe-500">agency</dt>
                <dd>{meta.agency}</dd>
              </div>
            )}
            {meta?.close_at && (
              <div>
                <dt className="text-xs text-taupe-500">closes</dt>
                <dd>{formatDateNz(meta.close_at)}</dd>
              </div>
            )}
            {typeof meta?.budget_nzd_estimate === 'number' && meta.budget_nzd_estimate > 0 && (
              <div>
                <dt className="text-xs text-taupe-500">budget (estimate)</dt>
                <dd>NZ${meta.budget_nzd_estimate.toLocaleString()}</dd>
              </div>
            )}
            {meta?.detail_url && (
              <div>
                <dt className="text-xs text-taupe-500">source</dt>
                <dd>
                  <a
                    href={meta.detail_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline text-pounamu-900 hover:text-pounamu-700 break-all"
                  >
                    open on gets.govt.nz
                  </a>
                </dd>
              </div>
            )}
            {entry.published_at && (
              <div>
                <dt className="text-xs text-taupe-500">published</dt>
                <dd>{formatDateNz(entry.published_at)}</dd>
              </div>
            )}
          </dl>
        </aside>
      </div>

      {meta?.go_no_go && (
        <section className="mb-10 border border-taupe-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs uppercase tracking-widest text-taupe-600">go / no-go</p>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                meta.go_no_go.decision === 'go'
                  ? 'bg-pounamu-100 text-pounamu-900 border-pounamu-300'
                  : meta.go_no_go.decision === 'no_go'
                  ? 'bg-mist-100 text-taupe-700 border-taupe-300'
                  : 'bg-karaka-100 text-karaka-900 border-karaka-300'
              }`}
            >
              {meta.go_no_go.decision === 'no_go' ? 'no-go' : meta.go_no_go.decision}
            </span>
          </div>
          <pre className="text-sm text-taupe-800 whitespace-pre-wrap font-inter">
            {meta.go_no_go.reasoning}
          </pre>
        </section>
      )}

      {meta?.response_draft && (
        <section className="mb-10 border border-pounamu-300 rounded-lg p-5 bg-pounamu-50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-xs uppercase tracking-widest text-pounamu-900">
              response draft · template
            </p>
            <span className="text-xs font-mono text-pounamu-700">
              {meta.response_draft.model}
            </span>
          </div>
          <pre className="text-sm text-taupe-900 whitespace-pre-wrap font-inter">
            {meta.response_draft.body}
          </pre>
          <p className="mt-3 text-xs text-taupe-600">
            Template-driven draft — edit before sending. The closing block points to the public Mana Receipt verifier.
          </p>
        </section>
      )}

      {receipt && (
        <section className="mb-10 border border-taupe-200 rounded-lg p-5">
          <p className="text-xs uppercase tracking-widest text-taupe-600 mb-3">
            Mana Receipt · capability assessment
          </p>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Row label="receipt id" value={receipt.id} mono />
            <Row label="schema" value={receipt.schema_version} mono />
            <Row label="domain" value={receipt.domain} />
            <Row label="agent" value={`${receipt.agent} v${receipt.agent_version}`} />
            <Row label="input hash" value={receipt.input_hash} mono />
            <Row label="output hash" value={receipt.output_hash} mono />
            <Row label="key id" value={receipt.key_id} mono />
            <Row label="hitl status" value={receipt.hitl.status ?? 'n/a'} />
          </dl>
          <p className="mt-4 text-xs text-taupe-600">
            Internal-flavoured receipt — not yet signed against the public key chain.{' '}
            <Link href="/verify" className="underline">
              About Mana Receipts.
            </Link>
          </p>
        </section>
      )}

      <StatusForm entry={entry} />
    </main>
  );
}

function StatusForm({ entry }: { entry: LiveFeedEntry }) {
  return (
    <section className="border border-taupe-200 rounded-lg p-5">
      <p className="text-xs uppercase tracking-widest text-taupe-600 mb-3">
        status
      </p>
      <form action="/api/internal/tenders/status" method="POST" className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="entry_id" value={entry.id} />
        <select
          name="status"
          defaultValue={entry.status}
          className="text-sm border border-taupe-300 rounded px-2 py-1 bg-white"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="text-xs px-3 py-1.5 rounded bg-pounamu-900 text-mist-50 hover:bg-pounamu-800 transition-colors"
        >
          update
        </button>
        <span className="text-xs text-taupe-500">
          currently <span className="font-mono">{entry.status}</span>
        </span>
      </form>
    </section>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-taupe-500">{label}</dt>
      <dd className={mono ? 'font-mono text-xs break-all' : ''}>{value}</dd>
    </div>
  );
}

function formatDateNz(iso: string): string {
  const dt = new Date(iso);
  if (!Number.isFinite(dt.getTime())) return iso;
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(dt);
}
