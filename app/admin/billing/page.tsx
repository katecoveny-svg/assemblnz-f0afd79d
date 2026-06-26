import { getBillingSummary, nzd } from '@/lib/admin/data';
import { BODY, C, Card, Empty, Grid, LinkPill, MONO, PageHeader, SectionTitle, StatCard, Table, td } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const TIER_PRICE: Record<string, number> = { solo: 49, team: 149, business: 199, pro: 49, starter: 9.99 };

export default async function BillingPage() {
  const b = await getBillingSummary();

  // ARR = MRR × 12 (estimate from flat per-agent installs).
  const arr = b.mrrEstimate === null ? null : b.mrrEstimate * 12;
  const tierEntries = Object.entries(b.byTier).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Billing"
        title="Billing"
        lede="Subscriptions, recurring revenue and anything that needs chasing. Numbers are estimates from local data — Stripe is the source of truth."
        actions={
          <LinkPill href="https://dashboard.stripe.com" external>
            Open Stripe ↗
          </LinkPill>
        }
      />

      <Grid min={200}>
        <StatCard label="MRR · est." value={nzd(b.mrrEstimate)} hint="Flat $15/agent install" />
        <StatCard label="ARR · est." value={nzd(arr)} hint="MRR × 12" />
        <StatCard label="Active subscriptions" value={b.activeSubs === null ? '—' : b.activeSubs} />
        <StatCard
          label="Needs attention"
          value={b.failed === null ? '—' : b.failed}
          tone={b.failed && b.failed > 0 ? 'bad' : undefined}
          hint="Past due / unpaid"
        />
      </Grid>

      <SectionTitle>Active by tier</SectionTitle>
      {tierEntries.length === 0 ? (
        <Empty>
          No active subscriptions in the <code style={{ fontFamily: MONO, fontSize: 12.5 }}>subscriptions</code> table.
          Per-agent installs are billed flat at $15 — see the estimate above.
        </Empty>
      ) : (
        <Table head={['Tier', 'Active', 'Est. monthly']}>
          {tierEntries.map(([tier, n]) => (
            <tr key={tier}>
              <td style={{ ...td, fontFamily: BODY, fontWeight: 700, textTransform: 'capitalize' }}>{tier}</td>
              <td style={{ ...td, fontFamily: MONO }}>{n}</td>
              <td style={{ ...td, fontFamily: MONO }}>
                {TIER_PRICE[tier] ? nzd(n * TIER_PRICE[tier]) : '—'}
              </td>
            </tr>
          ))}
        </Table>
      )}

      <SectionTitle>How billing works</SectionTitle>
      <Card>
        <ul style={{ fontFamily: BODY, color: C.body, fontSize: 14, lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
          <li>Agents bill per tier — NZ$9.99/mo everyday, NZ$199/mo specialist, NZ$250/mo all-access (GST inclusive).</li>
          <li>Three free messages per agent, then the paywall — counted in agent chat sessions.</li>
          <li>
            Failed charges show up as <code style={{ fontFamily: MONO, fontSize: 12.5 }}>past_due</code> /{' '}
            <code style={{ fontFamily: MONO, fontSize: 12.5 }}>unpaid</code> on the Stripe customer record.
          </li>
        </ul>
      </Card>
    </>
  );
}
