/**
 * /internal/kahu/voice-calls — filterable log of every voice call.
 *
 * Sits behind the existing /internal/* gate (middleware + the same email
 * allowlist). Reads kete_session with searchParams filters (date range,
 * status, customer, transferred) applied server-side and links each row to its
 * receipt where one exists. Filters are a plain GET <form>, so no client JS.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import type { CallStatus, KeteSession } from '@/lib/voice/types';

export const metadata: Metadata = {
  title: 'Voice calls · Kahu · assembl internal',
  description: 'Filterable log of every voice call handled by the agent.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_EMAILS = new Set<string>(['assembl@assembl.co.nz', 'kate@assembl.co.nz']);

const CALL_STATUSES: CallStatus[] = [
  'ringing',
  'in_progress',
  'completed',
  'transferred',
  'voicemail',
  'failed',
];

const STATUS_STYLE: Record<CallStatus, { bg: string; fg: string }> = {
  ringing: { bg: 'rgba(212,168,83,0.12)', fg: 'var(--assembl-gold-thread)' },
  in_progress: { bg: 'rgba(212,168,83,0.12)', fg: 'var(--assembl-gold-thread)' },
  completed: { bg: 'rgba(43,107,87,0.10)', fg: 'var(--assembl-pounamu)' },
  transferred: { bg: 'rgba(59,124,181,0.12)', fg: '#3B7CB5' },
  voicemail: { bg: 'rgba(91,80,73,0.10)', fg: 'var(--text-secondary)' },
  failed: { bg: 'rgba(172,88,56,0.10)', fg: 'var(--assembl-clay)' },
};

const NZ_DATE = new Intl.DateTimeFormat('en-NZ', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Pacific/Auckland',
});

function fmt(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? NZ_DATE.format(d) : iso;
}

/** Mask a raw phone number, keeping the last 3 digits. */
function maskNumber(raw: string | null): string {
  if (!raw) return '—';
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 3) return raw;
  return `••• ••• ${digits.slice(-3)}`;
}

function StatusPill({ status }: { status: CallStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.completed;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[12px] uppercase tracking-[0.12em]"
      style={{ background: s.bg, color: s.fg }}
    >
      {status.replace('_', ' ')}
    </span>
  );
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

function single(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

type SessionRow = KeteSession;

export default async function VoiceCallsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/login?redirect=/internal/kahu/voice-calls');
  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) return <NotAuthorised email={user.email ?? ''} />;

  const sp = await searchParams;
  const from = single(sp.from);
  const to = single(sp.to);
  const statusFilter = single(sp.status);
  const customer = single(sp.customer);
  const transferred = single(sp.transferred); // 'true' | ''

  let rows: SessionRow[] = [];
  let receiptByCall = new Map<string, string>();
  let configured = true;
  try {
    const admin = getServiceClient();
    let query = admin
      .from('kete_session')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(200);

    if (from) query = query.gte('started_at', from);
    if (to) query = query.lte('started_at', `${to}T23:59:59.999Z`);
    if (statusFilter && CALL_STATUSES.includes(statusFilter as CallStatus)) {
      query = query.eq('status', statusFilter);
    }
    if (customer) query = query.eq('customer_id', customer);
    if (transferred === 'true') query = query.eq('status', 'transferred');

    const { data: sessions, error } = await query;
    if (error) throw error;
    rows = (sessions ?? []) as SessionRow[];

    // Map call_sid → receipt id so we can link rows that have an evidence pack.
    const callSids = rows.map((r) => r.call_sid);
    if (callSids.length > 0) {
      const { data: receipts } = await admin
        .from('mana_receipt')
        .select('id, call_sid')
        .in('call_sid', callSids);
      receiptByCall = new Map(
        ((receipts ?? []) as { id: string; call_sid: string }[]).map((r) => [
          r.call_sid,
          r.id,
        ]),
      );
    }
  } catch {
    configured = false;
  }

  const inputClass =
    'w-full rounded-[10px] border border-[rgba(35,33,31,0.16)] bg-[color:var(--assembl-paper)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[rgba(43,107,87,0.45)] focus:outline-none';
  const labelClass =
    'font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]';

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-[color:var(--text-primary)] lg:py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Internal · Kahu · call log
          </p>
          <h1 className="mt-3 font-display text-display-lg font-light leading-tight">
            Voice calls
          </h1>
          <p className="mt-4 max-w-2xl text-body-md text-[color:var(--text-body)]">
            Every call the agent handled. Filter by date, status or customer — each
            row links to its evidence pack where one’s been generated.
          </p>
        </div>
        <Link
          href="/internal/kahu"
          className="inline-flex items-center rounded-pill border border-[rgba(35,33,31,0.16)] px-4 py-2 text-sm font-medium text-[color:var(--text-primary)] transition-colors hover:border-[rgba(43,107,87,0.40)]"
        >
          ← Evidence packs
        </Link>
      </header>

      {/* Filters — plain GET form, no client JS */}
      <form
        method="get"
        className="mb-8 grid grid-cols-1 gap-4 rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>From</span>
          <input type="date" name="from" defaultValue={from} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>To</span>
          <input type="date" name="to" defaultValue={to} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Status</span>
          <select name="status" defaultValue={statusFilter} className={inputClass}>
            <option value="">Any</option>
            {CALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Customer</span>
          <input
            type="text"
            name="customer"
            defaultValue={customer}
            placeholder="customer_id"
            className={inputClass}
          />
        </label>
        <div className="flex flex-col justify-end gap-2">
          <label className="flex items-center gap-2 text-sm text-[color:var(--text-body)]">
            <input
              type="checkbox"
              name="transferred"
              value="true"
              defaultChecked={transferred === 'true'}
              className="h-4 w-4 accent-[color:var(--assembl-pounamu)]"
            />
            Transferred only
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-pill bg-[color:var(--assembl-pounamu)] px-4 py-2 text-sm font-medium text-[color:var(--assembl-paper)] transition-colors hover:bg-[color:var(--assembl-pounamu-deep)]"
            >
              Apply
            </button>
            <Link
              href="/internal/kahu/voice-calls"
              className="inline-flex items-center rounded-pill border border-[rgba(35,33,31,0.16)] px-4 py-2 text-sm font-medium text-[color:var(--text-primary)] transition-colors hover:border-[rgba(43,107,87,0.40)]"
            >
              Clear
            </Link>
          </div>
        </div>
      </form>

      {!configured ? (
        <div className="rounded-[14px] border border-[rgba(35,33,31,0.10)] p-8 text-center text-[color:var(--text-secondary)]">
          <p className="font-display text-display-md font-light text-[color:var(--text-primary)]">
            Service client not configured.
          </p>
          <p className="mt-3 text-body-md">
            Set <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in the project env to
            load the call log.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[rgba(35,33,31,0.20)] p-12 text-center">
          <p className="font-display text-display-md font-light text-[color:var(--text-primary)]">
            No calls match.
          </p>
          <p className="mt-3 text-body-md text-[color:var(--text-body)]">
            Try widening the date range or clearing the filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-[rgba(35,33,31,0.10)]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(35,33,31,0.12)] bg-[color:var(--assembl-paper)] font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                <th className="px-4 py-3 font-normal">Started</th>
                <th className="px-4 py-3 font-normal">Call SID</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Caller</th>
                <th className="px-4 py-3 font-normal">Transferred</th>
                <th className="px-4 py-3 font-normal">Evidence pack</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const receiptId = receiptByCall.get(r.call_sid);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-[rgba(35,33,31,0.07)] align-middle last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-[color:var(--text-body)]">
                      {fmt(r.started_at)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--text-secondary)]">
                      {r.call_sid.slice(0, 12)}…
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--text-body)]">
                      {maskNumber(r.caller_number)}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--text-body)]">
                      {r.status === 'transferred' ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3">
                      {receiptId ? (
                        <Link
                          href={`/internal/kahu/receipts/${receiptId}`}
                          className="font-medium text-[color:var(--assembl-pounamu)] underline-offset-2 hover:underline"
                        >
                          View receipt →
                        </Link>
                      ) : (
                        <span className="text-[color:var(--text-secondary)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
