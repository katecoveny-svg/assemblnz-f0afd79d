import { LULA_BRAND, LULA_TENANT, STAR_GROUP_VENUES } from '@/lib/customers/lula-inn/brand';
import {
  Container,
  PageHeader,
  Card,
  Grid,
  Stat,
  Section,
  Pill,
  Table,
  VenueScope,
  nzd,
} from '@/components/customers/lula-inn/ui';
import { VENUE_REVENUE, WEEKLY_PL, CASH_RECON, reconVariance } from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

export default function FinancePage() {
  const lulaRevenue = VENUE_REVENUE.find((v) => v.venue === 'The Lula Inn')!;
  const totalRevenue = VENUE_REVENUE.reduce((sum, v) => sum + v.revenue, 0);
  const variance = reconVariance();
  const varianceLabel = variance > 0 ? 'over' : variance < 0 ? 'short' : 'exact';

  return (
    <Container>
      <PageHeader
        eyebrow="Finance · reporting"
        title="Finance"
        intro="Daily revenue, wage %, food %, and a weekly P&L the group operator can trust."
      />

      <VenueScope venues={STAR_GROUP_VENUES} active="lula-inn" />

      {/* Integration status */}
      <Card
        style={{
          marginBottom: 26,
          background: B.sand,
          border: `1px dashed ${B.brass}`,
          boxShadow: 'none',
        }}
        pad={18}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <span
            style={{
              fontFamily: 'var(--lula-mono), monospace',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: B.brassDark,
              fontWeight: 700,
            }}
          >
            Integration status
          </span>
          <Pill tone={{ bg: B.amberBg, text: '#7c5610' }}>pending</Pill>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: B.inkSoft }}>
          {LULA_TENANT.integrations.finance}. Daily revenue, wage cost % and event splits sync once
          credentials are added.
        </p>
      </Card>

      {/* KPI row */}
      <Grid min={180} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat value={nzd(lulaRevenue.revenue)} label="Yesterday's revenue · Lula Inn" tone="coral" />
        </Card>
        <Card pad={18}>
          <Stat
            value={`${lulaRevenue.wagePct}%`}
            label="Wage cost (yday)"
            tone={lulaRevenue.wagePct <= 30 ? 'green' : 'amber'}
          />
        </Card>
        <Card pad={18}>
          <Stat
            value={`${lulaRevenue.foodPct}%`}
            label="Food cost (yday)"
            tone={lulaRevenue.foodPct <= 32 ? 'green' : 'amber'}
          />
        </Card>
        <Card pad={18}>
          <Stat value={nzd(WEEKLY_PL.netBeforeTax)} label="Week net before tax" tone="coral" />
        </Card>
      </Grid>

      {/* Daily revenue by venue */}
      <Section title="Daily revenue by venue" basis="Star Group rollup">
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <Table
            columns={[
              { key: 'venue', label: 'Venue' },
              { key: 'revenue', label: 'Revenue', align: 'right' },
              { key: 'wage', label: 'Wage %', align: 'right' },
              { key: 'food', label: 'Food %', align: 'right' },
            ]}
            rows={[
              ...VENUE_REVENUE.map((v) => ({
                venue: v.venue,
                revenue: nzd(v.revenue),
                wage: <Pill status={v.wagePct <= 30 ? 'green' : 'amber'}>{v.wagePct}%</Pill>,
                food: <Pill status={v.foodPct <= 32 ? 'green' : 'amber'}>{v.foodPct}%</Pill>,
              })),
              {
                venue: <strong style={{ color: B.ocean }}>Star Group total</strong>,
                revenue: <strong style={{ color: B.ocean }}>{nzd(totalRevenue)}</strong>,
                wage: '—',
                food: '—',
              },
            ]}
          />
        </Card>
      </Section>

      {/* Weekly P&L snapshot */}
      <Section title="Weekly P&L snapshot" basis={WEEKLY_PL.week}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PLRow label="Revenue" value={nzd(WEEKLY_PL.revenue)} strong />
            <PLRow label="Food" value={nzd(WEEKLY_PL.food)} sub />
            <PLRow label="Beverage" value={nzd(WEEKLY_PL.beverage)} sub />
            <PLRow label="Events" value={nzd(WEEKLY_PL.events)} sub />

            <div style={{ height: 1, background: B.line, margin: '10px 0' }} />

            <PLRow label="Wages" value={`(${nzd(WEEKLY_PL.wages)})`} deduction />
            <PLRow label="COGS" value={`(${nzd(WEEKLY_PL.cogs)})`} deduction />
            <PLRow label="Overheads" value={`(${nzd(WEEKLY_PL.overheads)})`} deduction />

            <div style={{ height: 1.5, background: B.ocean, margin: '12px 0 8px', opacity: 0.25 }} />

            <PLRow label="Net before tax" value={nzd(WEEKLY_PL.netBeforeTax)} emphasise />
          </div>
        </Card>
      </Section>

      {/* Cash reconciliation */}
      <Section title="Cash reconciliation" basis="till · Eftpos · online · deposits">
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <Table
            columns={[
              { key: 'source', label: 'Source' },
              { key: 'expected', label: 'Expected', align: 'right' },
              { key: 'counted', label: 'Counted', align: 'right' },
              { key: 'variance', label: 'Variance', align: 'right' },
            ]}
            rows={CASH_RECON.map((r) => {
              const v = r.counted - r.expected;
              return {
                source: r.source,
                expected: nzd(r.expected, true),
                counted: nzd(r.counted, true),
                variance: (
                  <span style={{ fontWeight: 700, color: v < 0 ? B.red : B.green }}>
                    {v > 0 ? '+' : ''}
                    {nzd(v, true)}
                  </span>
                ),
              };
            })}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 12px',
              borderTop: `1.5px solid ${B.line}`,
              background: 'rgba(244,237,225,0.5)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: B.ocean }}>Total variance</span>
            <span
              style={{
                fontFamily: 'var(--lula-mono), monospace',
                fontSize: 13.5,
                fontWeight: 700,
                color: variance < 0 ? B.red : B.green,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {variance > 0 ? '+' : ''}
              {nzd(variance, true)} · {varianceLabel}
            </span>
          </div>
        </Card>
      </Section>

      {/* Supplier invoice matching */}
      <Section title="Supplier invoice matching" basis="AP automation" demo={false}>
        <Card>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: B.ink }}>
            Supplier invoices auto-match against delivered orders — quantities, pricing and GST
            reconciled line-by-line before they hit the ledger. See the Kitchen module for live
            supplier orders and deliveries feeding this match.
          </p>
        </Card>
      </Section>
    </Container>
  );
}

function PLRow({
  label,
  value,
  sub = false,
  deduction = false,
  strong = false,
  emphasise = false,
}: {
  label: string;
  value: string;
  sub?: boolean;
  deduction?: boolean;
  strong?: boolean;
  emphasise?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
        padding: emphasise ? '4px 0' : '5px 0',
        paddingLeft: sub ? 16 : 0,
      }}
    >
      <span
        style={{
          fontSize: emphasise ? 16 : sub ? 13 : 14,
          fontWeight: emphasise || strong ? 700 : 500,
          color: sub ? B.inkSoft : deduction ? B.inkSoft : B.ink,
          fontFamily: emphasise
            ? 'var(--lula-display), Georgia, serif'
            : 'var(--lula-body), system-ui, sans-serif',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: emphasise ? 'var(--lula-display), Georgia, serif' : 'var(--lula-mono), monospace',
          fontSize: emphasise ? 20 : sub ? 13 : 14,
          fontWeight: emphasise || strong ? 700 : 500,
          color: emphasise ? B.coral : deduction ? B.red : sub ? B.inkSoft : B.ink,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}
