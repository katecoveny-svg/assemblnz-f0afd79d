/**
 * Leads viewer — a private, server-rendered page that lists hapai_leads.
 *
 * hapai_leads is insert-only under RLS: the public can submit, but nobody can
 * read the list with the public key. This page runs ON THE SERVER with the
 * SERVICE ROLE key (never sent to the browser) and is gated by a secret token
 * in the URL.
 *
 * Env (Vercel → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL    = https://wurwcrgxjjwqdaxqceey.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY   = <service role key>   ← server-only, never NEXT_PUBLIC
 *   LEADS_VIEW_TOKEN            = <a long random string you choose>
 *
 * Open:  https://www.assembl.co.nz/admin/leads?key=YOUR_LEADS_VIEW_TOKEN
 *
 * Stopgap gate for a solo founder — put it behind the real admin login before
 * anyone else joins the team.
 */

export const dynamic = 'force-dynamic'; // always fetch fresh, never cache leads

type HapaiLead = {
  id: string;
  created_at: string;
  email: string;
  tool_slug: string;
  source: string | null;
  consent: boolean;
  payload: { name?: string | null; business?: string | null } | null;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const VIEW_TOKEN = process.env.LEADS_VIEW_TOKEN ?? '';

async function fetchLeads(): Promise<HapaiLead[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/hapai_leads?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      cache: 'no-store',
    },
  );
  if (!res.ok) throw new Error(`Could not load leads (${res.status})`);
  return res.json();
}

const nzDate = (iso: string) =>
  new Date(iso).toLocaleString('en-NZ', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }> | { key?: string };
}) {
  const params = await searchParams;

  if (!VIEW_TOKEN || params.key !== VIEW_TOKEN) {
    return (
      <main style={styles.page}>
        <p style={styles.muted}>Not authorised.</p>
      </main>
    );
  }

  let leads: HapaiLead[] = [];
  let error = '';
  try {
    leads = await fetchLeads();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  const consented = leads.filter((l) => l.consent).length;

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>Leads</h1>
      <p style={styles.muted}>
        {leads.length} total · {consented} opted in to updates
      </p>

      {error && <p style={styles.error}>{error}</p>}
      {!error && leads.length === 0 && <p style={styles.muted}>No leads yet.</p>}

      {leads.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['When', 'Email', 'Name', 'Business', 'Tool', 'Source', 'Updates?'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} style={styles.tr}>
                  <td style={styles.td}>{nzDate(l.created_at)}</td>
                  <td style={styles.td}>{l.email}</td>
                  <td style={styles.td}>{l.payload?.name ?? '—'}</td>
                  <td style={styles.td}>{l.payload?.business ?? '—'}</td>
                  <td style={styles.td}>{l.tool_slug}</td>
                  <td style={styles.td}>{l.source ?? '—'}</td>
                  <td style={{ ...styles.td, color: l.consent ? '#3A7D6E' : '#6B6B66' }}>
                    {l.consent ? 'Yes' : 'No'}
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F4F1EA',
    padding: '40px 24px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#1F1F1D',
  },
  h1: {
    fontFamily: 'var(--font-display), Georgia, serif',
    fontSize: 30,
    fontWeight: 600,
    margin: '0 0 4px',
  },
  muted: { color: '#6B6B66', fontSize: 14, margin: '0 0 20px' },
  error: { color: '#B5533A', fontSize: 14 },
  tableWrap: {
    overflowX: 'auto',
    background: '#FFFFFF',
    border: '1px solid #E5E0D6',
    borderRadius: 12,
  },
  table: { borderCollapse: 'collapse', width: '100%', fontSize: 14 },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    borderBottom: '1px solid #E5E0D6',
    color: '#6B6B66',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #F0ECE2' },
  td: { padding: '11px 14px', verticalAlign: 'top', whiteSpace: 'nowrap' },
};
