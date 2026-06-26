import Link from 'next/link';
import {
  PUBLIC_MARKETPLACE_AGENTS,
  CATEGORY_LABELS,
  priceLabel,
} from '@/lib/marketplace/agents';
import { getAgentMetrics, getAgentStatusOverrides, nzd } from '@/lib/admin/data';
import { BODY, C, Grid, MONO, PageHeader, Pill, StatCard, Table, td } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'neutral'> = {
  live: 'ok',
  draft: 'warn',
  archived: 'neutral',
};

/** Registry status → catalogue status. coming_soon maps to draft. */
function defaultStatus(registryStatus: string): string {
  return registryStatus === 'live' ? 'live' : 'draft';
}

export default async function AgentsPage() {
  const [metrics, overrides] = await Promise.all([getAgentMetrics(), getAgentStatusOverrides()]);

  const agents = [...PUBLIC_MARKETPLACE_AGENTS].sort((a, b) => a.name.localeCompare(b.name));

  const totalChats = Object.values(metrics).reduce((s, m) => s + m.chats, 0);
  const totalInstalls = Object.values(metrics).reduce((s, m) => s + m.installs, 0);
  const totalRevenue = Object.values(metrics).reduce((s, m) => s + m.revenue, 0);
  const liveCount = agents.filter((a) => (overrides[a.slug] ?? defaultStatus(a.status)) === 'live').length;

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Agents"
        title="Agents"
        lede="The marketplace catalogue. Toggle status, open an agent to edit its metadata, and see chats and revenue per agent."
      />

      <Grid min={200}>
        <StatCard label="Agents · live" value={`${liveCount}/${agents.length}`} />
        <StatCard label="Chats · all-time" value={totalChats.toLocaleString('en-NZ')} />
        <StatCard label="Installs · all-time" value={totalInstalls.toLocaleString('en-NZ')} />
        <StatCard label="Revenue · est." value={nzd(totalRevenue)} hint="Flat $15/install" />
      </Grid>

      <div style={{ height: 28 }} />

      <Table head={['Agent', 'Category', 'Price', 'Status', 'Chats', 'Installs', 'Revenue', '']}>
        {agents.map((a) => {
          const status = overrides[a.slug] ?? defaultStatus(a.status);
          const m = metrics[a.slug] ?? { chats: 0, installs: 0, revenue: 0 };
          return (
            <tr key={a.slug}>
              <td style={td}>
                <div style={{ fontFamily: BODY, fontWeight: 700, color: C.ink }}>{a.name}</div>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{a.slug}</span>
              </td>
              <td style={{ ...td, fontFamily: BODY, fontSize: 13, color: C.body }}>
                {CATEGORY_LABELS[a.category] ?? a.category}
              </td>
              <td style={{ ...td, fontFamily: MONO, fontSize: 12.5 }}>{priceLabel(a)}</td>
              <td style={td}>
                <Pill tone={STATUS_TONE[status] ?? 'neutral'}>{status}</Pill>
              </td>
              <td style={{ ...td, fontFamily: MONO }}>{m.chats}</td>
              <td style={{ ...td, fontFamily: MONO }}>{m.installs}</td>
              <td style={{ ...td, fontFamily: MONO }}>{m.revenue ? nzd(m.revenue) : '—'}</td>
              <td style={td}>
                <Link
                  href={`/admin/agents/${a.slug}`}
                  style={{ fontFamily: BODY, fontWeight: 700, fontSize: 13, color: C.gold, textDecoration: 'none' }}
                >
                  Edit →
                </Link>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
