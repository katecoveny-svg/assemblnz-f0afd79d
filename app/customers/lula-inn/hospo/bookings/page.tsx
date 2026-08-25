import { LULA_BRAND, LULA_TENANT } from '@/lib/customers/lula-inn/brand';
import {
  Container,
  PageHeader,
  Card,
  Grid,
  Stat,
  Section,
  Pill,
  Table,
  nzd,
} from '@/components/customers/lula-inn/ui';
import {
  BOOKINGS_TODAY,
  COVERS,
  EVENTS,
  EVENT_RUN_SHEET,
} from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

function bookingStatusTone(status: (typeof BOOKINGS_TODAY)[number]['status']): 'green' | 'amber' | 'red' {
  if (status === 'No-show risk') return 'amber';
  return 'green';
}

function eventTypeTone(type: (typeof EVENTS)[number]['type']) {
  switch (type) {
    case 'Wedding':
      return { bg: B.coralLight, text: B.coralDark };
    case 'Corporate':
      return { bg: B.oceanLight, text: B.ocean };
    case 'Ticketed':
      return { bg: '#F4EDE1', text: B.brassDark };
    default:
      return { bg: B.sand, text: B.inkSoft };
  }
}

function eventStatusTone(status: (typeof EVENTS)[number]['status']): 'green' | 'amber' {
  return status === 'Run sheet ready' || status === 'Confirmed' ? 'green' : 'amber';
}

export default function BookingsPage() {
  const noShowRisks = BOOKINGS_TODAY.filter((b) => b.status === 'No-show risk').length;
  const runSheetEvent = EVENTS.find((e) => e.id === EVENT_RUN_SHEET.eventId);

  return (
    <Container>
      <PageHeader
        eyebrow="Bookings · events"
        title="Bookings & events"
        intro="Today’s covers pulled through in one place, alongside the private functions and events running through the venue — from first enquiry to the day-of run sheet."
      />

      {/* Integration status */}
      <Card
        pad={16}
        style={{
          marginBottom: 26,
          background: B.sand,
          border: `1px dashed ${B.brass}`,
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--lula-mono), monospace',
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: B.brassDark,
              fontWeight: 700,
            }}
          >
            Scaffolded · not connected
          </span>
        </div>
        <p style={{ fontSize: 13.5, color: B.inkSoft, margin: '8px 0 0', lineHeight: 1.55 }}>
          {LULA_TENANT.integrations.bookings}. Today’s bookings, covers and VIP flags pull through
          once credentials are added.
        </p>
      </Card>

      {/* KPI row */}
      <Grid min={168} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat
            value={String(COVERS.today)}
            label={`Covers today · target ${COVERS.target}`}
            tone={COVERS.today >= COVERS.target ? 'green' : 'amber'}
          />
        </Card>
        <Card pad={18}>
          <Stat value={String(COVERS.tomorrow)} label="Covers tomorrow" />
        </Card>
        <Card pad={18}>
          <Stat value={String(COVERS.weekend)} label="Covers this weekend" tone="coral" />
        </Card>
        <Card pad={18}>
          <Stat
            value={String(noShowRisks)}
            label="No-show risks flagged today"
            tone={noShowRisks ? 'red' : 'green'}
          />
        </Card>
      </Grid>

      {/* Today's bookings */}
      <Section title="Today’s bookings" basis="live covers · VIP flags">
        <Card pad={0}>
          <div style={{ padding: 18 }}>
            <Table
              columns={[
                { key: 'time', label: 'Time' },
                { key: 'name', label: 'Name' },
                { key: 'covers', label: 'Covers', align: 'right' },
                { key: 'area', label: 'Area' },
                { key: 'note', label: 'Note' },
                { key: 'status', label: 'Status' },
              ]}
              rows={BOOKINGS_TODAY.map((b) => ({
                time: (
                  <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 13 }}>
                    {b.time}
                  </span>
                ),
                name: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                    {b.vip ? <Pill tone={{ bg: B.coralLight, text: B.coralDark }}>★ VIP</Pill> : null}
                  </span>
                ),
                covers: b.covers,
                area: b.area,
                note: b.note ?? '—',
                status: <Pill status={bookingStatusTone(b.status)}>{b.status}</Pill>,
              }))}
            />
          </div>
          <div
            style={{
              padding: '12px 18px',
              borderTop: `1px solid ${B.line}`,
              fontSize: 12.5,
              color: B.inkSoft,
            }}
          >
            No-show alerts fire automatically for repeat no-shows, so the floor knows before the
            table is meant to sit.
          </div>
        </Card>
      </Section>

      {/* Covers */}
      <Section title="Covers" basis="pacing · table turns">
        <Card>
          <Grid min={160} gap={16}>
            <Stat
              value={`${COVERS.today} / ${COVERS.target}`}
              label="Today vs target"
              tone={COVERS.today >= COVERS.target ? 'green' : 'amber'}
            />
            <Stat value={String(COVERS.tomorrow)} label="Tomorrow" />
            <Stat value={String(COVERS.weekend)} label="This weekend" tone="coral" />
            <Stat value="~95 min" label="Avg table-turn (concept metric)" />
          </Grid>
          <p style={{ fontSize: 13, color: B.inkSoft, margin: '16px 0 0', lineHeight: 1.55 }}>
            Table-turn tracking sits alongside covers once the POS/booking feed is connected — it
            will flag sittings running long against the deck and private-room pacing shown above.
          </p>
        </Card>
      </Section>

      {/* Event calendar */}
      <Section title="Event calendar" basis="functions · weddings · corporate · ticketed">
        <Card pad={0}>
          <div style={{ padding: 18 }}>
            <Table
              columns={[
                { key: 'name', label: 'Event' },
                { key: 'type', label: 'Type' },
                { key: 'date', label: 'Date' },
                { key: 'covers', label: 'Covers', align: 'right' },
                { key: 'space', label: 'Space' },
                { key: 'deposit', label: 'Deposit' },
                { key: 'status', label: 'Status' },
              ]}
              rows={EVENTS.map((e) => ({
                name: <span style={{ fontWeight: 600 }}>{e.name}</span>,
                type: <Pill tone={eventTypeTone(e.type)}>{e.type}</Pill>,
                date: e.date,
                covers: e.covers,
                space: e.space,
                deposit: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 13 }}>
                      {nzd(e.depositAmount)}
                    </span>
                    <Pill status={e.depositPaid ? 'green' : 'amber'}>
                      {e.depositPaid ? 'paid' : 'due'}
                    </Pill>
                  </span>
                ),
                status: <Pill status={eventStatusTone(e.status)}>{e.status}</Pill>,
              }))}
            />
          </div>
        </Card>
      </Section>

      {/* Event ops plan / run sheet */}
      <Section title="Event ops plan — run sheet" basis="day-of run sheet">
        <Card>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: 'var(--lula-display), Georgia, serif',
                fontWeight: 600,
                fontSize: 20,
                color: B.ocean,
              }}
            >
              {runSheetEvent?.name ?? 'Event'}
            </div>
            {runSheetEvent ? (
              <div style={{ fontSize: 13, color: B.inkSoft, marginTop: 2 }}>
                {runSheetEvent.type} · {runSheetEvent.date} · {runSheetEvent.covers} covers ·{' '}
                {runSheetEvent.space}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {EVENT_RUN_SHEET.timeline.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 16,
                  paddingLeft: 14,
                  paddingBottom: i < EVENT_RUN_SHEET.timeline.length - 1 ? 16 : 0,
                  borderLeft: `2px solid ${B.line}`,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: -6,
                    top: 2,
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: B.coral,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--lula-mono), monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: B.brassDark,
                    minWidth: 52,
                    flexShrink: 0,
                  }}
                >
                  {row.time}
                </span>
                <span style={{ fontSize: 14, color: B.ink, lineHeight: 1.5 }}>{row.item}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: `1px solid ${B.line}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 12.5, color: B.inkSoft }}>
              <strong style={{ color: B.ink }}>Staffing:</strong> {EVENT_RUN_SHEET.staffing}
            </span>
            <span style={{ fontSize: 12.5, color: B.inkSoft }}>
              <strong style={{ color: B.ink }}>Contract:</strong> {EVENT_RUN_SHEET.contract}
            </span>
          </div>
        </Card>
      </Section>
    </Container>
  );
}
