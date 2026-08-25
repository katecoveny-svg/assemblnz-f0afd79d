import Link from 'next/link';
import { getDashboard, listComms } from '@/lib/customs/store';
import { DEMO_NOW } from '@/lib/customs/demo';
import { formatMoney, formatNzDateTime, relativeDeadline } from '@/lib/customs/format';
import {
  Card,
  EntryStatusPill,
  PageHeader,
  Pill,
  SectionTitle,
  StatTile,
} from '@/components/customs/ui';

export default async function AironautDashboard() {
  const nowIso = DEMO_NOW.toISOString();
  const dash = await getDashboard(nowIso);
  const comms = await listComms();
  const pendingComms = comms.filter((c) => c.status !== 'sent').length;

  return (
    <div>
      <PageHeader
        eyebrow="Today · Tuesday 1 July 2026"
        title="Morning, Aironaut"
        lead="Everything on the desk today — cut-offs, entries waiting, importer chases, who's on shift, and where the money sits."
        action={
          <Link
            href="/customers/aeronaut/pikau/entries"
            className="rounded-lg bg-[color:var(--air-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--air-navy-deep)]"
          >
            Open entries queue
          </Link>
        }
      />

      {/* Pulse tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Open entries" value={dash.openEntries} hint="Across all importers" />
        <StatTile label="Ready to lodge" value={dash.readyToLodge} tone="ok" hint="Hand to the broker" />
        <StatTile label="Held — compliance" value={dash.heldForCompliance} tone="hold" hint="Blockers to clear" />
        <StatTile label="Missing info" value={dash.missingInfo} tone="warn" hint="Docs outstanding" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: urgent entries */}
        <div className="lg:col-span-2">
          <SectionTitle
            right={
              <Link href="/customers/aeronaut/pikau/entries" className="text-xs text-[color:var(--air-slate)] hover:text-[color:var(--air-navy)]">
                All entries →
              </Link>
            }
          >
            Entries needing attention
          </SectionTitle>
          <div className="space-y-3">
            {dash.entries
              .filter((e) => e.status === 'hold_for_compliance' || e.status === 'missing_information' || e.status === 'ready_for_broker_review')
              .map((e) => (
                <Link key={e.id} href={`/customers/aeronaut/pikau/entries/${e.id}`} className="block">
                  <Card className="transition hover:border-[color:var(--air-brass)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[color:var(--air-slate)]">{e.shipmentRef}</span>
                          <EntryStatusPill status={e.status} />
                        </div>
                        <p className="air-display mt-1 text-lg">{e.goods}</p>
                        <p className="text-sm text-[color:var(--air-slate)]">
                          {e.importerName} · {e.originCountry} → NZ
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.75rem] uppercase tracking-[0.12em] text-[color:var(--air-slate)]">Readiness</p>
                        <p className="air-display text-2xl" style={{ color: e.plan.readinessScore >= 80 ? 'var(--air-ok)' : e.plan.readinessScore >= 50 ? 'var(--air-warn)' : 'var(--air-hold)' }}>
                          {e.plan.readinessScore}
                        </p>
                        {e.input.cutoffIso ? (
                          <p className="text-xs text-[color:var(--air-slate)]">cut-off {relativeDeadline(e.input.cutoffIso, DEMO_NOW)}</p>
                        ) : null}
                      </div>
                    </div>
                    {e.plan.blockers.length > 0 ? (
                      <p className="mt-2 text-xs text-[color:var(--air-hold)]">
                        {e.plan.blockers.length} blocker{e.plan.blockers.length === 1 ? '' : 's'}: {e.plan.blockers.map((b) => b.title).join(' · ')}
                      </p>
                    ) : null}
                  </Card>
                </Link>
              ))}
          </div>
        </div>

        {/* Right: today rail */}
        <div className="space-y-6">
          <div>
            <SectionTitle>Today&apos;s cut-offs</SectionTitle>
            <Card mist>
              {dash.todaysCutoffs.length === 0 ? (
                <p className="text-sm text-[color:var(--air-slate)]">No lodgement cut-offs today. Next up on the ops calendar.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {dash.todaysCutoffs.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-2">
                      <span>{o.title}</span>
                      <span className="font-mono text-xs text-[color:var(--air-slate)]">{formatNzDateTime(o.whenIso)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div>
            <SectionTitle
              right={
                <Link href="/customers/aeronaut/pikau/compliance" className="text-xs text-[color:var(--air-slate)] hover:text-[color:var(--air-navy)]">
                  Calendar →
                </Link>
              }
            >
              Compliance alerts
            </SectionTitle>
            <Card>
              <ul className="space-y-2 text-sm">
                {[...dash.overdueCompliance, ...dash.dueSoonCompliance].slice(0, 4).map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-2">
                    <span className="text-[color:var(--air-ink)]">{c.title}</span>
                    <Pill tone={c.status === 'overdue' ? 'hold' : 'warn'}>{c.status === 'overdue' ? 'overdue' : 'due soon'}</Pill>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div>
            <SectionTitle>On shift today</SectionTitle>
            <Card>
              <ul className="space-y-1.5 text-sm">
                {dash.staffOnShiftToday.map(({ staff, shift }) => (
                  <li key={shift.id} className="flex items-center justify-between">
                    <span>{staff.name}</span>
                    <span className="font-mono text-xs text-[color:var(--air-slate)]">
                      {shift.startHhmm}–{shift.endHhmm}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div>
            <SectionTitle>Finance pulse</SectionTitle>
            <Card>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[color:var(--air-slate)]">Outstanding</span>
                <span className="air-display text-2xl">{formatMoney(dash.financePulse.outstandingNzd)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Pill tone="navy">{dash.financePulse.draftInvoices} draft</Pill>
                <Pill tone="warn">{dash.financePulse.awaitingSync} awaiting Xero</Pill>
                <Pill tone="brass">{pendingComms} comms to send</Pill>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
