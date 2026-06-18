/**
 * /dash/admin — the Dash by assembl operator dashboard.
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
  advertiser_email: string;
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
        <p style={muted}>{user.email} is not on the Dash operator allowlist.</p>
      </main>
    );
  }

  let campaigns: Campaign[] = [];
  let impressions: ImpressionRow[] = [];
  let error = '';
  try {
    const service = getServiceClient();
    const [c, i] = await Promise.all([
      service
        .from('dash_campaigns')
        .select('id, name, advertiser_email, bid_cpm_nzd_cents, daily_budget_nzd_cents, spent_today, spent_today_date, status, category')
        .order('created_at', { ascending: false }),
      service
        .from('dash_impressions')
        .select('campaign_id, clicked, dismissed, charged_nzd_cents, served_at')
        .order('served_at', { ascending: false })
        .limit(5000),
    ]);
    campaigns = (c.data as Campaign[]) ?? [];
    impressions = (i.data as ImpressionRow[]) ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

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
          Dash by assembl · operator
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
                    <td style={td}>{c.advertiser_email}</td>
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
