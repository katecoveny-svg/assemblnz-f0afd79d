import Link from 'next/link';
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
  nzd,
} from '@/components/customers/lula-inn/ui';
import { ManaReceiptsPanel } from '@/components/customers/lula-inn/ManaReceipts';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import {
  COVERS,
  SHIFTS,
  FRIDGE_LOGS,
  EVENTS,
  TODAY_ALERTS,
  VENUE_REVENUE,
  staffById,
} from '@/lib/customers/lula-inn/demo-data';
import { HOSPO_LINKS } from '@/components/customers/lula-inn/nav-links';
import {
  LULA_AGENT_GREETING,
  LULA_AGENT_NAME,
  LULA_TRY_ME,
} from '@/lib/customers/lula-inn/agent';

const B = LULA_BRAND;

export default function TodayPage() {
  const lulaRevenue = VENUE_REVENUE.find((v) => v.venue === 'The Lula Inn')!;
  const onNow = SHIFTS.filter((s) => s.day === 'Fri' && s.status === 'confirmed').slice(0, 5);
  const openShifts = SHIFTS.filter((s) => s.status !== 'confirmed');
  const tonight = EVENTS[0];

  return (
    <Container>
      <PageHeader
        eyebrow="Friday · 27 June 2026 · Viaduct Harbour"
        title="Today at The Lula Inn"
        intro="One screen for the venue as it opens: who’s on, what’s coming through the doors, the fridges, tonight’s event brief, and anything that needs a manager before service."
      />

      {/* KPI row */}
      <Grid min={168} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat value={String(COVERS.today)} label={`Covers today · target ${COVERS.target}`} tone={COVERS.today >= COVERS.target ? 'green' : 'amber'} />
        </Card>
        <Card pad={18}>
          <Stat value={String(COVERS.tomorrow)} label="Covers tomorrow" />
        </Card>
        <Card pad={18}>
          <Stat value={nzd(lulaRevenue.revenue)} label="Yesterday’s revenue" tone="coral" />
        </Card>
        <Card pad={18}>
          <Stat value={`${lulaRevenue.wagePct}%`} label="Wage cost (yday)" tone={lulaRevenue.wagePct <= 30 ? 'green' : 'amber'} />
        </Card>
        <Card pad={18}>
          <Stat value={String(openShifts.length)} label="Shifts needing cover" tone={openShifts.length ? 'red' : 'green'} />
        </Card>
      </Grid>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <div>
          {/* Alerts */}
          <Section title="Needs a manager" demo>
            <Card>
              {TODAY_ALERTS.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '11px 0',
                    borderBottom: i < TODAY_ALERTS.length - 1 ? `1px solid ${B.line}` : 'none',
                  }}
                >
                  <StatusDot status={a.level} />
                  <span style={{ fontSize: 14, color: B.ink }}>{a.text}</span>
                </div>
              ))}
            </Card>
          </Section>

          {/* On shift now */}
          <Section title="On shift now" basis="clock-in / roster" demo>
            <Card>
              <Grid min={150} gap={12}>
                {onNow.map((s) => {
                  const p = staffById(s.staffId);
                  if (!p) return null;
                  return (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: B.ink }}>{p.name}</span>
                      <span style={{ fontSize: 12.5, color: B.inkSoft }}>{p.title} · {p.role}</span>
                      <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 11, color: B.brassDark }}>
                        {s.start}–{s.end}
                      </span>
                    </div>
                  );
                })}
              </Grid>
              {openShifts.length ? (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${B.line}`, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: B.inkSoft }}>Gaps:</span>
                  {openShifts.map((s) => (
                    <Pill key={s.id} status={s.status === 'open' ? 'red' : 'amber'}>
                      {s.day} {s.start}–{s.end} · {s.status === 'open' ? 'open' : 'cover wanted'}
                    </Pill>
                  ))}
                </div>
              ) : null}
            </Card>
          </Section>

          {/* Tonight's event brief */}
          <Section title="Event on tonight" basis="events + kitchen brief" demo>
            <Card style={{ borderLeft: `4px solid ${B.coral}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontFamily: 'var(--lula-display), Georgia, serif', fontSize: 20, fontWeight: 600, color: B.ocean }}>
                    {tonight.name}
                  </div>
                  <div style={{ fontSize: 13, color: B.inkSoft, marginTop: 2 }}>
                    {tonight.type} · {tonight.date} · {tonight.covers} covers · {tonight.space}
                  </div>
                </div>
                <Pill status="green">{tonight.status}</Pill>
              </div>
              <p style={{ fontSize: 13.5, color: B.ink, margin: '12px 0 0', lineHeight: 1.55 }}>
                Kitchen: set menu C — <strong>2 vegan, 1 GF, 1 nut allergy</strong>. Duty manager on floor for cake + speeches. Full run sheet on the bookings module.
              </p>
              <div style={{ marginTop: 12 }}>
                <Link href="/customers/lula-inn/hospo/bookings" style={{ fontSize: 13, fontWeight: 700, color: B.coral, textDecoration: 'none' }}>
                  Open run sheet →
                </Link>
              </div>
            </Card>
          </Section>
        </div>

        <div>
          {/* Fridge temps */}
          <Section title="Fridge temps" basis="Food Act 2014" demo>
            <Card>
              {FRIDGE_LOGS.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 0',
                    borderBottom: i < FRIDGE_LOGS.length - 1 ? `1px solid ${B.line}` : 'none',
                  }}
                >
                  <StatusDot status={f.status} />
                  <span style={{ flex: 1, fontSize: 13.5, color: B.ink }}>{f.unit}</span>
                  <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 13, fontWeight: 700, color: f.status === 'green' ? B.green : f.status === 'amber' ? B.amber : B.red }}>
                    {f.temp}°C
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <Link href="/customers/lula-inn/hospo/food-safety" style={{ fontSize: 12.5, fontWeight: 700, color: B.coral, textDecoration: 'none' }}>
                  Full food-safety log →
                </Link>
              </div>
            </Card>
          </Section>

          {/* Jump to modules */}
          <Section title="Jump to" demo={false}>
            <Card pad={14}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {HOSPO_LINKS.filter((l) => !l.href.endsWith('/today')).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '9px 8px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      color: B.ink,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {l.label}
                    <span style={{ color: B.brass }}>→</span>
                  </Link>
                ))}
              </div>
            </Card>
          </Section>
        </div>
      </div>

      {/* Mana Receipts */}
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <ManaReceiptsPanel limit={4} />
      </div>

      <Section title={`Talk to ${LULA_AGENT_NAME}`} basis="live floor desk · draft-only">
        <Card pad={16}>
          <PilotAgentChat
            apiPath="/api/customers/lula-inn/chat"
            agentName={LULA_AGENT_NAME}
            greeting={LULA_AGENT_GREETING}
            tryMe={LULA_TRY_ME}
            accent={B.coral}
            draftNote="Draft-only: the floor desk never sends staff messages or changes the roster without a manager yes."
          />
        </Card>
      </Section>
    </Container>
  );
}
