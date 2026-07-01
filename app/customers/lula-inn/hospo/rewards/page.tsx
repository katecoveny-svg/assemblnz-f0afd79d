import { LULA_BRAND } from '@/lib/customers/lula-inn/brand';
import {
  Container,
  PageHeader,
  Card,
  Grid,
  Stat,
  Section,
  Pill,
  Table,
} from '@/components/customers/lula-inn/ui';
import {
  MILESTONES,
  INCENTIVES,
  TRAINING,
  staffById,
} from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

const MILESTONE_TONE: Record<string, { bg: string; text: string }> = {
  Birthday: { bg: B.coralLight, text: B.coralDark },
  'Work anniversary': { bg: B.oceanLight, text: B.ocean },
  'New baby': { bg: '#FBEFD6', text: B.brassDark },
  Tenure: { bg: B.sand, text: B.inkSoft },
};

// Short peer shout-outs, drawn from names already appearing in the
// milestones/incentives demo data above — kept warm, specific, and private.
const SHOUT_OUTS: { from: string; to: string; note: string }[] = [
  { from: 'Marama T.', to: 'Vai S.', note: 'ran a flawless Friday close — legend behind that bar.' },
  { from: 'Sina F.', to: 'Ana P.', note: 'held the floor together during the ANZ corporate booking without blinking.' },
  { from: 'Hemi R.', to: 'Josh M.', note: 'picked up three cover shifts this month without being asked twice. That’s the culture.' },
  { from: 'Ana P.', to: 'Kiri H.', note: 'talked a whole table into the gin flight and made it feel like a gift, not a sell.' },
];

export default function RewardsPage() {
  const expiringCerts = TRAINING.filter((t) => t.status === 'Expiring').length;

  return (
    <Container>
      <PageHeader
        eyebrow="Team · loyalty · recognition"
        title="Team rewards"
        intro="Looking after the people who look after the guests — milestones, incentives, and keeping certificates current."
      />

      {/* KPI row */}
      <Grid min={168} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat value={String(MILESTONES.length)} label="Milestones this week" />
        </Card>
        <Card pad={18}>
          <Stat value={String(INCENTIVES.length)} label="Active incentives" tone="coral" />
        </Card>
        <Card pad={18}>
          <Stat
            value={String(expiringCerts)}
            label="Certs expiring soon"
            tone={expiringCerts ? 'amber' : 'green'}
          />
        </Card>
      </Grid>

      {/* Milestones */}
      <Section title="Milestones" basis="birthdays · anniversaries · tenure">
        <Grid min={240} gap={14}>
          {MILESTONES.map((m, i) => {
            const p = staffById(m.staffId);
            const tone = MILESTONE_TONE[m.kind] ?? { bg: B.sand, text: B.inkSoft };
            return (
              <Card key={i} pad={18} style={{ borderLeft: `4px solid ${B.brass}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: B.ink }}>{p?.name ?? m.staffId}</span>
                  <Pill tone={tone}>{m.kind}</Pill>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--lula-mono), monospace',
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: B.brassDark,
                    marginTop: 8,
                  }}
                >
                  {m.when}
                </div>
                <p style={{ fontSize: 13.5, color: B.inkSoft, lineHeight: 1.55, margin: '8px 0 0' }}>
                  {m.detail}
                </p>
              </Card>
            );
          })}
        </Grid>
      </Section>

      {/* Incentive tracker */}
      <Section title="Incentive tracker" basis="weekly · leaderboard">
        <Grid min={240} gap={14}>
          {INCENTIVES.map((inc) => (
            <Card key={inc.id} pad={18}>
              <div style={{ fontFamily: 'var(--lula-display), Georgia, serif', fontWeight: 600, fontSize: 17, color: B.ocean }}>
                {inc.title}
              </div>
              <p style={{ fontSize: 13, color: B.inkSoft, margin: '6px 0 12px', lineHeight: 1.5 }}>
                {inc.detail}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: B.ink }}>{inc.leader}</span>
                <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 12, color: B.coral, fontWeight: 700 }}>
                  {inc.metric}
                </span>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Recognition wall */}
      <Section title="Recognition wall" basis="private to the team">
        <Card pad={18} style={{ background: B.sand }}>
          <div
            style={{
              fontFamily: 'var(--lula-mono), monospace',
              fontSize: 10.5,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: B.brassDark,
              marginBottom: 14,
            }}
          >
            Private to the team — never shown to guests
          </div>
          <Grid min={260} gap={12}>
            {SHOUT_OUTS.map((s, i) => (
              <div
                key={i}
                style={{
                  background: B.cream,
                  borderRadius: 14,
                  padding: 14,
                  border: `1px solid ${B.line}`,
                }}
              >
                <p style={{ fontSize: 13.5, color: B.ink, lineHeight: 1.55, margin: 0 }}>
                  <strong>{s.to}</strong> {s.note}
                </p>
                <div style={{ fontSize: 12, color: B.inkSoft, marginTop: 8 }}>— {s.from}</div>
              </div>
            ))}
          </Grid>
        </Card>
      </Section>

      {/* Training & certificates */}
      <Section title="Training & certificates" basis="Sale and Supply of Alcohol Act 2012">
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 0' }}>
            <p style={{ fontSize: 13, color: B.inkSoft, lineHeight: 1.55, margin: '0 0 6px' }}>
              Manager’s Certificate expiry alerts fire well ahead of time, so no one is ever rostered to
              serve alcohol on an expired cert.
            </p>
          </div>
          <div style={{ padding: 18 }}>
            <Table
              columns={[
                { key: 'name', label: 'Staff' },
                { key: 'cert', label: 'Certificate' },
                { key: 'status', label: 'Status' },
                { key: 'expires', label: 'Expires', align: 'right' },
              ]}
              rows={TRAINING.map((t) => {
                const p = staffById(t.staffId);
                const status =
                  t.status === 'Current' ? 'green' : t.status === 'Expiring' ? 'amber' : 'red';
                return {
                  name: p?.name ?? t.staffId,
                  cert: t.cert,
                  status: <Pill status={status}>{t.status}</Pill>,
                  expires: t.expires,
                };
              })}
            />
          </div>
        </Card>
      </Section>
    </Container>
  );
}
