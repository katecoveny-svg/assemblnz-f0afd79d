import { LULA_BRAND } from '@/lib/customers/lula-inn/brand';
import {
  Container,
  PageHeader,
  Card,
  Grid,
  Stat,
  Section,
  StatusDot,
  Pill,
  Table,
} from '@/components/customers/lula-inn/ui';
import { ManaReceiptsPanel } from '@/components/customers/lula-inn/ManaReceipts';
import {
  DUTY_MANAGERS,
  ALCOHOL_INCIDENTS,
  LICENCE_CALENDAR,
  MANA_RECEIPTS,
  NZ_CITATIONS,
} from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

export default function CompliancePage() {
  const attentionItems = LICENCE_CALENDAR.filter((l) => l.status !== 'green');

  // Draft DLC quarterly counts — derived inline from ALCOHOL_INCIDENTS, not stored.
  const idChecks = ALCOHOL_INCIDENTS.filter((a) => a.type === 'ID check').length;
  const refusals = ALCOHOL_INCIDENTS.filter(
    (a) => a.type === 'Intoxication refusal' || a.type === 'Minor refused'
  ).length;
  const disorder = ALCOHOL_INCIDENTS.filter((a) => a.type === 'Disorder').length;
  const totalIncidents = ALCOHOL_INCIDENTS.length;

  return (
    <Container>
      <PageHeader
        eyebrow="Alcohol licence · Sale & Supply of Alcohol Act 2012"
        title="Alcohol licence & compliance"
        intro="A certificated duty manager on every shift, incidents logged as they happen, and renewals that never sneak up on the licence."
      />

      {/* Statutory basis */}
      <Card style={{ marginBottom: 26 }}>
        <div
          style={{
            fontFamily: 'var(--lula-mono), monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: B.brassDark,
            marginBottom: 8,
          }}
        >
          {NZ_CITATIONS.alcoholAct.label}
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: B.ink, margin: 0, maxWidth: 720 }}>
          {NZ_CITATIONS.alcoholAct.note}
        </p>
      </Card>

      {/* KPI row */}
      <Grid min={168} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat value={String(DUTY_MANAGERS.length)} label="Duty managers rostered" />
        </Card>
        <Card pad={18}>
          <Stat value={String(ALCOHOL_INCIDENTS.length)} label="Incidents logged" />
        </Card>
        <Card pad={18}>
          <Stat
            value={String(attentionItems.length)}
            label="Licence items needing attention"
            tone="amber"
          />
        </Card>
      </Grid>

      {/* Duty manager on shift */}
      <Section title="Duty manager on shift" basis="s.214 · certificated manager present">
        <Card>
          <Table
            columns={[
              { key: 'day', label: 'Day' },
              { key: 'manager', label: 'Manager' },
              { key: 'cert', label: 'Cert expires' },
              { key: 'present', label: 'Present' },
            ]}
            rows={DUTY_MANAGERS.map((d) => {
              const expiresSoon = LICENCE_CALENDAR.some(
                (l) => l.item.includes(d.manager) && l.status === 'amber'
              );
              return {
                day: d.day,
                manager: d.manager,
                cert: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {d.certExpires}
                    {expiresSoon ? <Pill status="amber">renewal due</Pill> : null}
                  </span>
                ),
                present: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <StatusDot status={d.present ? 'green' : 'red'} />
                    {d.present ? <Pill status="green">Present</Pill> : <Pill status="red">Not present</Pill>}
                  </span>
                ),
              };
            })}
          />
          <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '14px 0 0', lineHeight: 1.55 }}>
            The venue cannot serve alcohol without a certificated duty manager present on the floor.
          </p>
        </Card>
      </Section>

      {/* Incident log */}
      <Section title="Incident log" basis="host responsibility">
        <Card>
          <Table
            columns={[
              { key: 'time', label: 'Time' },
              { key: 'type', label: 'Type' },
              { key: 'detail', label: 'Detail' },
              { key: 'manager', label: 'Manager' },
            ]}
            rows={ALCOHOL_INCIDENTS.map((a) => ({
              time: a.time,
              type: <Pill>{a.type}</Pill>,
              detail: a.detail,
              manager: a.manager,
            }))}
          />
        </Card>
      </Section>

      {/* Licence renewal calendar */}
      <Section title="Licence renewal calendar" basis="on-licence · endorsements">
        <Card>
          <Table
            columns={[
              { key: 'item', label: 'Item' },
              { key: 'renews', label: 'Renews' },
              { key: 'status', label: 'Status' },
            ]}
            rows={LICENCE_CALENDAR.map((l) => ({
              item: l.item,
              renews: l.renews,
              status: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <StatusDot status={l.status} />
                  <Pill status={l.status}>{l.status === 'green' ? 'current' : 'due soon'}</Pill>
                </span>
              ),
            }))}
          />
        </Card>
      </Section>

      {/* DLC quarterly report — draft */}
      <Section title="DLC quarterly report — draft" basis="District Licensing Committee">
        <Card style={{ borderLeft: `4px solid ${B.coral}` }}>
          <div
            style={{
              fontFamily: 'var(--lula-display), Georgia, serif',
              fontSize: 18,
              fontWeight: 600,
              color: B.ocean,
              marginBottom: 8,
            }}
          >
            Quarterly summary — auto-drafted
          </div>
          <p style={{ fontSize: 13.5, color: B.ink, lineHeight: 1.6, margin: '0 0 12px' }}>
            Over the reporting window logged so far: <strong>{totalIncidents}</strong> host-responsibility
            incidents recorded, of which <strong>{idChecks}</strong> were ID checks at the door,{' '}
            <strong>{refusals}</strong> were intoxication or minor refusals, and <strong>{disorder}</strong>{' '}
            were disorder events. A certificated duty manager was present for every incident logged.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: B.sand,
              border: `1px solid ${B.line}`,
              borderRadius: 10,
            }}
          >
            <StatusDot status="amber" />
            <span style={{ fontSize: 13, color: B.inkSoft }}>
              Duty manager reviews &amp; signs before submission. Nothing here submits automatically.
            </span>
          </div>
        </Card>
      </Section>

      {/* Mana Receipts */}
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <ManaReceiptsPanel receipts={MANA_RECEIPTS.filter((r) => r.basis.label.includes('Alcohol'))} />
      </div>
    </Container>
  );
}
