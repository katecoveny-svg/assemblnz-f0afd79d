/**
 * /dash/admin — the Assembling by assembl operator dashboard.
 *
 * Gated to Kate via the site's existing Supabase auth + the same email
 * allowlist used by the other /internal admin pages. Reads with the service
 * role (bypasses RLS) once authorisation is proven. Live counters, campaign
 * list, fill rate.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { nzTodayString } from '@/lib/dash/auction';

export const dynamic = 'force-dynamic';

const ALLOWED_EMAILS = new Set<string>(['assembl@assembl.co.nz', 'kate@assembl.co.nz']);
const DASH_AMBER = '#D9A85A';

type Campaign = {
  id: string;
  name: string;
  advertiser: { company: string } | { company: string }[] | null;
  bid_cpm_nzd_cents: number;
  daily_budget_nzd_cents: number;
  spent_today: number;
  spent_today_date: string | null;
  status: string;
  category: string | null;
};

type ImpressionRow = {
  campaign_id: string | null;
  clicked: boolean;
  dismissed: boolean;
  charged_nzd_cents: number;
  served_at: string;
};

type LedgerRow = {
  created_at: string;
  party_type: string;
  party_id: string;
  direction: 'credit' | 'debit';
  amount_nzd: number;
  reason: string;
};

type PayoutRow = {
  created_at: string;
  party_type: string;
  party_id: string;
  amount_nzd: number;
  method: string;
  destination: string | null;
  status: string;
};

// Supabase embeds a to-one relation as an object or (in some typings) an array.
function advertiserName(a: Campaign['advertiser']): string {
  if (!a) return '—';
  const row = Array.isArray(a) ? a[0] : a;
  return row?.company ?? '—';
}

const nzd = (cents: number) =>
  `NZ$${(cents / 100).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number, d: number) => (d === 0 ? '—' : `${((n / d) * 100).toFixed(1)}%`);

export default async function DashAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/login?redirect=/dash/admin');
  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) {
    return (
      <main style={page}>
        <h1 style={h1}>Not authorised</h1>
        <p style={muted}>{user.email} is not on the Assembling operator allowlist.</p>
      </main>
    );
  }

  let campaigns: Campaign[] = [];
  let impressions: ImpressionRow[] = [];
  let ledger: LedgerRow[] = [];
  let payouts: PayoutRow[] = [];
  let error = '';
  try {
    const service = getServiceClient();
    const [c, i, l, p] = await Promise.all([
      service
        .from('dash_campaigns')
        .select('id, name, bid_cpm_nzd_cents, daily_budget_nzd_cents, spent_today, spent_today_date, status, category, advertiser:dash_advertisers(company)')
        .order('created_at', { ascending: false }),
      service
        .from('dash_impressions')
        .select('campaign_id, clicked, dismissed, charged_nzd_cents, served_at')
        .order('served_at', { ascending: false })
        .limit(5000),
      service
        .from('dash_payout_ledger')
        .select('created_at, party_type, party_id, direction, amount_nzd, reason')
        .order('created_at', { ascending: false })
        .limit(100),
      service
        .from('dash_payouts')
        .select('created_at, party_type, party_id, amount_nzd, method, destination, status')
        .order('created_at', { ascending: false })
        .limit(100),
    ]);
    campaigns = (c.data as Campaign[]) ?? [];
    impressions = (i.data as ImpressionRow[]) ?? [];
    ledger = (l.data as LedgerRow[]) ?? [];
    payouts = (p.data as PayoutRow[]) ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  // Ledger balances by party type (credits − debits).
  const balanceByType = ledger.reduce<Record<string, number>>((acc, r) => {
    const delta = (r.direction === 'credit' ? 1 : -1) * Number(r.amount_nzd ?? 0);
    acc[r.party_type] = (acc[r.party_type] ?? 0) + delta;
    return acc;
  }, {});
  const pendingPayouts = payouts.filter((p) => p.status === 'pending');

  // Counters over the loaded impression window.
  const requests = impressions.length;
  const filled = impressions.filter((r) => r.campaign_id !== null);
  const clicks = filled.filter((r) => r.clicked).length;
  const dismissed = filled.filter((r) => r.dismissed).length;
  const revenueCents = filled.reduce((s, r) => s + (r.charged_nzd_cents ?? 0), 0);
  const today = nzTodayString();
  const filledToday = filled.filter((r) => r.served_at.slice(0, 10) >= today).length;
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;

  const stats: { label: string; value: string; hint?: string }[] = [
    { label: 'Fill rate', value: pct(filled.length, requests), hint: `${filled.length} filled / ${requests} requests` },
    { label: 'Impressions served', value: filled.length.toLocaleString('en-NZ'), hint: `${filledToday} today` },
    { label: 'Clicks · CTR', value: `${clicks} · ${pct(clicks, filled.length)}` },
    { label: 'Dismissals', value: dismissed.toLocaleString('en-NZ'), hint: pct(dismissed, filled.length) },
    { label: 'Network revenue', value: nzd(revenueCents), hint: 'charged to advertisers' },
    { label: 'Active campaigns', value: `${activeCampaigns} / ${campaigns.length}` },
  ];

  return (
    <main style={page}>
      <header style={{ marginBottom: 28 }}>
        <span style={{ color: DASH_AMBER, fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          Assembling by assembl · operator
        </span>
        <h1 style={h1}>Network dashboard</h1>
        <p style={muted}>
          Signed in as {user.email}. Window: latest {requests.toLocaleString('en-NZ')} serve attempts.
        </p>
      </header>

      {error && <p style={{ color: '#B5533A', fontSize: 14 }}>{error}</p>}

      <section style={statGrid}>
        {stats.map((s) => (
          <div key={s.label} style={statCard}>
            <div style={statLabel}>{s.label}</div>
            <div style={statValue}>{s.value}</div>
            {s.hint && <div style={statHint}>{s.hint}</div>}
          </div>
        ))}
      </section>

      <h2 style={h2}>Campaigns</h2>
      {campaigns.length === 0 ? (
        <p style={muted}>
          No campaigns yet. Insert one in the Supabase SQL editor (see the migration footer) and it
          will serve on the next HAPAI wait state.
        </p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {['Name', 'Advertiser', 'Status', 'Bid CPM', 'Daily budget', 'Spent today', 'Category'].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const spent = c.spent_today_date === today ? c.spent_today : 0;
                return (
                  <tr key={c.id} style={tr}>
                    <td style={td}>{c.name}</td>
                    <td style={td}>{advertiserName(c.advertiser)}</td>
                    <td style={{ ...td, color: c.status === 'active' ? '#3A7D6E' : '#6B6B66' }}>{c.status}</td>
                    <td style={td}>{nzd(c.bid_cpm_nzd_cents)}</td>
                    <td style={td}>{nzd(c.daily_budget_nzd_cents)}</td>
                    <td style={td}>{nzd(spent)}</td>
                    <td style={td}>{c.category ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- LEDGER ---------------- */}
      <h2 style={h2}>Ledger</h2>
      <section style={{ ...statGrid, marginBottom: 14 }}>
        {(['publisher', 'earner', 'charity'] as const).map((t) => (
          <div key={t} style={statCard}>
            <div style={statLabel}>{t} balance</div>
            <div style={statValue}>{nzd(Math.round((balanceByType[t] ?? 0) * 100))}</div>
            <div style={statHint}>credits − debits, all time</div>
          </div>
        ))}
      </section>
      {ledger.length === 0 ? (
        <p style={muted}>No ledger entries yet. They appear as waits accrue and rewards redeem.</p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {['When', 'Party', 'ID', 'Dir', 'Amount', 'Reason'].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledger.map((r, idx) => (
                <tr key={idx} style={tr}>
                  <td style={td}>{new Date(r.created_at).toLocaleString('en-NZ')}</td>
                  <td style={td}>{r.party_type}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{r.party_id}</td>
                  <td style={{ ...td, color: r.direction === 'credit' ? '#3A7D6E' : '#B5533A' }}>
                    {r.direction}
                  </td>
                  <td style={td}>{nzd(Math.round(Number(r.amount_nzd) * 100))}</td>
                  <td style={td}>{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- PAYOUTS ---------------- */}
      <h2 style={h2}>
        Payouts{pendingPayouts.length > 0 ? ` · ${pendingPayouts.length} pending` : ''}
      </h2>
      {payouts.length === 0 ? (
        <p style={muted}>No payouts yet. Redemptions and the payouts cron write here.</p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {['When', 'Party', 'ID', 'Amount', 'Method', 'Destination', 'Status'].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((r, idx) => (
                <tr key={idx} style={tr}>
                  <td style={td}>{new Date(r.created_at).toLocaleString('en-NZ')}</td>
                  <td style={td}>{r.party_type}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{r.party_id}</td>
                  <td style={td}>{nzd(Math.round(Number(r.amount_nzd) * 100))}</td>
                  <td style={td}>{r.method}</td>
                  <td style={td}>{r.destination ?? '—'}</td>
                  <td
                    style={{
                      ...td,
                      color:
                        r.status === 'paid' ? '#3A7D6E' : r.status === 'failed' ? '#B5533A' : '#6B6B66',
                    }}
                  >
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: '#F4F1EA',
  padding: '40px 24px',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  color: '#1F1F1D',
  maxWidth: 1100,
  margin: '0 auto',
};
const h1: React.CSSProperties = { fontFamily: 'var(--font-display), Georgia, serif', fontSize: 32, fontWeight: 600, margin: '8px 0 4px' };
const h2: React.CSSProperties = { fontFamily: 'var(--font-display), Georgia, serif', fontSize: 22, fontWeight: 600, margin: '36px 0 14px' };
const muted: React.CSSProperties = { color: '#6B6B66', fontSize: 14, margin: '0 0 4px' };
const statGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 };
const statCard: React.CSSProperties = { background: '#FFFFFF', border: '1px solid #E5E0D6', borderRadius: 12, padding: '16px 18px' };
const statLabel: React.CSSProperties = { color: '#6B6B66', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace' };
const statValue: React.CSSProperties = { fontSize: 26, fontWeight: 600, marginTop: 6, fontFamily: 'var(--font-display), Georgia, serif' };
const statHint: React.CSSProperties = { color: '#6B6B66', fontSize: 12, marginTop: 4 };
const tableWrap: React.CSSProperties = { overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E5E0D6', borderRadius: 12 };
const table: React.CSSProperties = { borderCollapse: 'collapse', width: '100%', fontSize: 14 };
const th: React.CSSProperties = { textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #E5E0D6', color: '#6B6B66', fontWeight: 600, whiteSpace: 'nowrap' };
const tr: React.CSSProperties = { borderBottom: '1px solid #F0ECE2' };
const td: React.CSSProperties = { padding: '11px 14px', verticalAlign: 'top', whiteSpace: 'nowrap' };
