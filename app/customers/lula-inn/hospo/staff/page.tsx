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
  nzd,
} from '@/components/customers/lula-inn/ui';
import {
  STAFF,
  SHIFTS,
  TIMESHEETS,
  PAY_RUN,
  LEAVE,
  staffById,
} from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

export default function StaffPage() {
  const headcount = STAFF.length;
  const ftCount = STAFF.filter((s) => s.employment === 'Full-time').length;
  const ptCount = STAFF.filter((s) => s.employment === 'Part-time').length;
  const casualCount = STAFF.filter((s) => s.employment === 'Casual').length;

  const weekendGapShifts = SHIFTS.filter((s) => s.status !== 'confirmed');
  const certifiedManagers = STAFF.filter((s) => s.managerCert?.held).length;

  const rosterSorted = [...STAFF].sort((a, b) => a.role.localeCompare(b.role));

  const fri = SHIFTS.filter((s) => s.day === 'Fri');
  const sat = SHIFTS.filter((s) => s.day === 'Sat');

  const payTotals = PAY_RUN.lines.reduce(
    (acc, l) => ({
      hours: acc.hours + l.hours,
      gross: acc.gross + l.gross,
      paye: acc.paye + l.paye,
      kiwiSaver: acc.kiwiSaver + l.kiwiSaver,
      net: acc.net + l.net,
    }),
    { hours: 0, gross: 0, paye: 0, kiwiSaver: 0, net: 0 }
  );

  return (
    <Container>
      <PageHeader
        eyebrow="Staffing · rosters · pay"
        title="Team, rosters & pay"
        intro="Run the whole team from one place — who’s on the roster, who clocked in, and what payday looks like before it lands — kept Holidays Act compliant end to end."
      />

      {/* KPI row */}
      <Grid min={168} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat value={String(headcount)} label="Team headcount" />
        </Card>
        <Card pad={18}>
          <Stat value={`${ftCount} / ${ptCount} / ${casualCount}`} label="Full-time / part-time / casual" />
        </Card>
        <Card pad={18}>
          <Stat
            value={String(weekendGapShifts.length)}
            label="Open + cover shifts this weekend"
            tone={weekendGapShifts.length ? 'red' : 'green'}
          />
        </Card>
        <Card pad={18}>
          <Stat value={String(certifiedManagers)} label="Certificated duty managers" tone="green" />
        </Card>
      </Grid>

      {/* Team roster */}
      <Section title="Team roster" basis="Employment Relations Act 2000">
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'title', label: 'Title' },
              { key: 'role', label: 'Role' },
              { key: 'venue', label: 'Venue' },
              { key: 'employment', label: 'Employment' },
              { key: 'rate', label: 'Base rate', align: 'right' },
            ]}
            rows={rosterSorted.map((s) => ({
              name: <span style={{ fontWeight: 700 }}>{s.name}</span>,
              title: s.title,
              role: s.role,
              venue: 'Lula Inn',
              employment: s.employment,
              rate: `${nzd(s.baseRate, true)}/hr`,
            }))}
          />
        </Card>
      </Section>

      {/* This weekend's roster */}
      <Section title="This weekend’s roster" basis="shift planner">
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
            {[
              { label: 'Friday', shifts: fri },
              { label: 'Saturday', shifts: sat },
            ].map((day) => (
              <div key={day.label}>
                <div
                  style={{
                    fontFamily: 'var(--lula-mono), monospace',
                    fontSize: 12,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: B.brassDark,
                    marginBottom: 10,
                  }}
                >
                  {day.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {day.shifts.map((s) => {
                    const p = staffById(s.staffId);
                    const status = s.status === 'confirmed' ? 'green' : s.status === 'cover-requested' ? 'amber' : 'red';
                    return (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          padding: '9px 0',
                          borderBottom: `1px solid ${B.line}`,
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: B.ink }}>
                            {p ? p.name : 'OPEN — needs cover'}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--lula-mono), monospace',
                              fontSize: 12,
                              color: B.inkSoft,
                            }}
                          >
                            {s.start}–{s.end}
                          </span>
                        </div>
                        <Pill status={status}>{s.status}</Pill>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '16px 0 0', lineHeight: 1.55 }}>
            Concept supports drag-drop roster templates plus a cover-request workflow — open shifts broadcast to eligible staff automatically.
          </p>
        </Card>
      </Section>

      {/* Timesheets */}
      <Section title="Timesheets" basis="clock in / out">
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <Table
            columns={[
              { key: 'staff', label: 'Staff' },
              { key: 'date', label: 'Date' },
              { key: 'clockIn', label: 'Clock in' },
              { key: 'clockOut', label: 'Clock out' },
              { key: 'hours', label: 'Hours', align: 'right' },
              { key: 'status', label: 'Status', align: 'right' },
            ]}
            rows={TIMESHEETS.map((t) => {
              const p = staffById(t.staffId);
              return {
                staff: <span style={{ fontWeight: 700 }}>{p?.name ?? t.staffId}</span>,
                date: t.date,
                clockIn: t.clockIn,
                clockOut: t.clockOut,
                hours: t.hours.toFixed(1),
                status: <Pill status={t.status === 'approved' ? 'green' : 'amber'}>{t.status}</Pill>,
              };
            })}
          />
        </Card>
        <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '10px 2px 0', lineHeight: 1.55 }}>
          Hours auto-calculate from clock in/out; staff clock in from their phone on the floor.
        </p>
      </Section>

      {/* Pay run — draft */}
      <Section title="Pay run — draft" basis="Holidays Act 2003 · PAYE + KiwiSaver">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--lula-display), Georgia, serif', fontSize: 18, fontWeight: 600, color: B.ocean }}>
              {PAY_RUN.period}
            </span>
            <Pill status="amber">{PAY_RUN.status}</Pill>
          </div>
          <Table
            columns={[
              { key: 'staff', label: 'Staff' },
              { key: 'hours', label: 'Hours', align: 'right' },
              { key: 'gross', label: 'Gross', align: 'right' },
              { key: 'paye', label: 'PAYE', align: 'right' },
              { key: 'kiwiSaver', label: 'KiwiSaver (3%)', align: 'right' },
              { key: 'net', label: 'Net', align: 'right' },
            ]}
            rows={[
              ...PAY_RUN.lines.map((l) => {
                const p = staffById(l.staffId);
                return {
                  staff: <span style={{ fontWeight: 700 }}>{p?.name ?? l.staffId}</span>,
                  hours: l.hours.toFixed(1),
                  gross: nzd(l.gross, true),
                  paye: nzd(l.paye, true),
                  kiwiSaver: nzd(l.kiwiSaver, true),
                  net: nzd(l.net, true),
                };
              }),
              {
                staff: <span style={{ fontWeight: 800, color: B.ocean }}>TOTAL</span>,
                hours: <span style={{ fontWeight: 800 }}>{payTotals.hours.toFixed(1)}</span>,
                gross: <span style={{ fontWeight: 800 }}>{nzd(payTotals.gross, true)}</span>,
                paye: <span style={{ fontWeight: 800 }}>{nzd(payTotals.paye, true)}</span>,
                kiwiSaver: <span style={{ fontWeight: 800 }}>{nzd(payTotals.kiwiSaver, true)}</span>,
                net: <span style={{ fontWeight: 800 }}>{nzd(payTotals.net, true)}</span>,
              },
            ]}
          />
          <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '14px 2px 0', lineHeight: 1.55 }}>
            Penalty rates apply for weekend and public-holiday work (Holidays Act 2003 — time-and-a-half plus an alternative day). Draft posts through to Xero Payroll / MYOB (scaffolded, not connected).
          </p>
        </Card>
      </Section>

      {/* Leave register */}
      <Section title="Leave register" basis="Holidays Act 2003">
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <Table
            columns={[
              { key: 'staff', label: 'Staff' },
              { key: 'type', label: 'Type' },
              { key: 'balance', label: 'Balance (days)', align: 'right' },
              { key: 'pending', label: 'Pending request' },
            ]}
            rows={LEAVE.map((l) => {
              const p = staffById(l.staffId);
              return {
                staff: <span style={{ fontWeight: 700 }}>{p?.name ?? l.staffId}</span>,
                type: l.type,
                balance: l.balanceDays.toFixed(1),
                pending: l.pending ?? '—',
              };
            })}
          />
        </Card>
        <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '10px 2px 0', lineHeight: 1.55 }}>
          Annual, sick, bereavement and parental leave all tracked Holidays-Act compliant, with balances kept current as time is taken and accrued.
        </p>
      </Section>
    </Container>
  );
}
