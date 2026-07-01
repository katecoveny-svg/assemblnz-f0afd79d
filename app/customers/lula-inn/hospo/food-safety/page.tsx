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
  FRIDGE_LOGS,
  SAFETY_CHECKS,
  FOOD_INCIDENTS,
  MANA_RECEIPTS,
  NZ_CITATIONS,
} from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

const PRE_SERVICE_CHECKLIST = [
  'Fridge & freezer temps logged (all units in range)',
  'Hand-wash stations stocked — soap + towel',
  'Allergen matrix current for tonight’s menu',
  'Sanitiser made up to spec at each station',
  'Use-by rotation checked — FIFO on fridge & dry store',
];

export default function FoodSafetyPage() {
  const unitsInRange = FRIDGE_LOGS.filter((f) => f.status === 'green').length;
  const openIncidents = FOOD_INCIDENTS.filter((i) => i.status === 'Open').length;
  const checksUpToDate = SAFETY_CHECKS.filter((c) => c.status === 'green').length;
  const foodReceipts = MANA_RECEIPTS.filter((r) => r.basis.label.includes('Food'));

  return (
    <Container>
      <PageHeader
        eyebrow="Food safety · Food Act 2014"
        title="Food safety"
        intro="The paper logbook, replaced — current and historic records a health inspector or MPI verifier can browse."
      />

      {/* KPI row */}
      <Grid min={168} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat value={String(FRIDGE_LOGS.length)} label="Fridges / units logged today" />
        </Card>
        <Card pad={18}>
          <Stat
            value={`${unitsInRange}/${FRIDGE_LOGS.length}`}
            label="Units in range"
            tone={unitsInRange === FRIDGE_LOGS.length ? 'green' : 'amber'}
          />
        </Card>
        <Card pad={18}>
          <Stat value={String(openIncidents)} label="Open incidents" tone={openIncidents ? 'red' : 'green'} />
        </Card>
        <Card pad={18}>
          <Stat
            value={`${checksUpToDate}/${SAFETY_CHECKS.length}`}
            label="Checks up to date"
            tone={checksUpToDate === SAFETY_CHECKS.length ? 'green' : 'amber'}
          />
        </Card>
      </Grid>

      {/* Daily temperature logs */}
      <Section title="Daily temperature logs" basis={NZ_CITATIONS.foodChillTemp.label}>
        <Card>
          <Table
            columns={[
              { key: 'unit', label: 'Unit' },
              { key: 'temp', label: 'Temp', align: 'right' },
              { key: 'target', label: 'Target', align: 'right' },
              { key: 'time', label: 'Time', align: 'right' },
              { key: 'by', label: 'Checked by' },
              { key: 'status', label: 'Status', align: 'center' },
            ]}
            rows={FRIDGE_LOGS.map((f) => ({
              unit: f.unit,
              temp: (
                <span
                  style={{
                    fontFamily: 'var(--lula-mono), monospace',
                    fontWeight: 700,
                    color: f.status === 'green' ? B.green : f.status === 'amber' ? B.amber : B.red,
                  }}
                >
                  {f.temp}°C
                </span>
              ),
              target: (
                <span style={{ fontFamily: 'var(--lula-mono), monospace', color: B.inkSoft, fontSize: 12.5 }}>
                  ≤{f.targetMax}°C
                </span>
              ),
              time: <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 12.5, color: B.inkSoft }}>{f.time}</span>,
              by: f.by,
              status: <StatusDot status={f.status} />,
            }))}
          />
          <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '14px 0 0', lineHeight: 1.5 }}>
            Chilled food ≤4°C · frozen food ≤−18°C · dishwasher final sanitising rinse ≥82°C.
          </p>
        </Card>
      </Section>

      {/* Cleaning schedule & safety checks */}
      <Section title="Cleaning schedule & safety checks" basis="Food Control Plan">
        <Card>
          <Table
            columns={[
              { key: 'task', label: 'Task' },
              { key: 'cadence', label: 'Cadence' },
              { key: 'lastDone', label: 'Last done' },
              { key: 'by', label: 'By' },
              { key: 'status', label: 'Status', align: 'center' },
            ]}
            rows={SAFETY_CHECKS.map((c) => ({
              task: c.task,
              cadence: <span style={{ color: B.inkSoft }}>{c.cadence}</span>,
              lastDone: <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 12.5, color: B.inkSoft }}>{c.lastDone}</span>,
              by: c.by,
              status: <StatusDot status={c.status} />,
            }))}
          />
        </Card>
      </Section>

      {/* Chef pre-service checklist */}
      <Section title="Chef pre-service checklist" basis="Food Control Plan">
        <Card style={{ borderLeft: `4px solid ${B.green}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRE_SERVICE_CHECKLIST.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: B.greenBg,
                    color: B.green,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: 13.5, color: B.ink }}>{item}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${B.line}`,
              fontSize: 12.5,
              color: B.inkSoft,
              fontStyle: 'italic',
            }}
          >
            Signed by Sina F. · 15:35
          </div>
        </Card>
      </Section>

      {/* Incidents & near-misses */}
      <Section title="Incidents & near-misses" basis={NZ_CITATIONS.foodAct.label}>
        <Card>
          <Table
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'detail', label: 'Detail' },
              { key: 'date', label: 'Date', align: 'right' },
              { key: 'severity', label: 'Severity', align: 'center' },
              { key: 'status', label: 'Status', align: 'right' },
            ]}
            rows={FOOD_INCIDENTS.map((f) => ({
              type: <span style={{ fontWeight: 600 }}>{f.type}</span>,
              detail: <span style={{ color: B.inkSoft }}>{f.detail}</span>,
              date: <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 12.5, color: B.inkSoft }}>{f.date}</span>,
              severity: <StatusDot status={f.severity} />,
              status: (
                <Pill status={f.status === 'Open' ? 'red' : f.status === 'MPI draft' ? 'amber' : 'green'}>
                  {f.status}
                </Pill>
              ),
            }))}
          />
        </Card>
      </Section>

      {/* MPI notification — draft */}
      <Section title="MPI notification — draft" basis={NZ_CITATIONS.mpiNotifiable.label}>
        <Card style={{ borderLeft: `4px solid ${B.coral}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'var(--lula-display), Georgia, serif', fontSize: 18, fontWeight: 600, color: B.ocean }}>
              Notifiable event — draft notice to MPI
            </div>
            <Pill status="amber">Draft · unsent</Pill>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: '14px 16px',
              borderRadius: 12,
              background: B.sand,
              border: `1px solid ${B.line}`,
              fontSize: 13.5,
              lineHeight: 1.6,
              color: B.ink,
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Subject:</strong> Suspected foodborne complaint — The Lula Inn, 149 Quay Street, Auckland
            </p>
            <p style={{ margin: '10px 0 0' }}>
              A guest reported gastrointestinal illness following a visit on {FOOD_INCIDENTS[0]?.date ?? 'recent service'}.
              Kitchen fridge 2 had drifted to 4.6°C overnight prior to this service — affected stock from that unit has
              been isolated and withheld from sale pending assessment. Batch and supplier records for the isolated stock
              have been pulled for review. No further stock from the affected batch has been served.
            </p>
            <p style={{ margin: '10px 0 0' }}>
              <strong>Actions taken:</strong> stock isolated, fridge unit flagged for technician callout, incident logged
              in the Food Control Plan register.
            </p>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              disabled
              style={{
                fontFamily: 'var(--lula-body), system-ui, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                padding: '10px 18px',
                borderRadius: 10,
                border: `1px solid ${B.line}`,
                background: B.white,
                color: B.inkSoft,
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
            >
              Review &amp; sign
            </button>
            <span style={{ fontSize: 12.5, color: B.inkSoft, maxWidth: 420 }}>
              Nothing sends automatically. The head chef reviews and signs this draft before anything goes to MPI or the
              verifier.
            </span>
          </div>
        </Card>
      </Section>

      {/* Mana Receipts */}
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <Section title="Auditable food-safety actions" basis="tamper-evident audit trail" demo={false}>
          <ManaReceiptsPanel receipts={foodReceipts} />
        </Section>
      </div>
    </Container>
  );
}
