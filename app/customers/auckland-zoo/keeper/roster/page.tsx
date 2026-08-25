import { SHIFTS, ROSTER_DATE, COVER_REQUESTS, HOLIDAYS_ACT_NOTE, type ShiftRate } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, DraftChip, Eyebrow, PageHeading, TonePill } from '../_components/ui';

const RATE_LABEL: Record<ShiftRate, { label: string; tone: 'ok' | 'watch' | 'urgent' }> = {
  ordinary: { label: 'Ordinary', tone: 'ok' },
  sunday: { label: 'Sunday loading', tone: 'watch' },
  'public-holiday': { label: 'Public holiday 1.5× + alt day', tone: 'urgent' },
};

export default function RosterPage() {
  return (
    <div>
      <PageHeading
        eyebrow={`Keeper · staff & rosters · ${ROSTER_DATE}`}
        title="Rosters, shifts & cover"
        intro="Shifts across enclosures, on-call rotations and cover requests — with Holidays Act 2003 penalty rates worked out for you. Keeper drafts the timesheet coding; council payroll approves and pays."
      />

      {/* Cover requests */}
      <section className="mb-6">
        <Eyebrow>Cover requests</Eyebrow>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {COVER_REQUESTS.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-medium" style={{ color: 'var(--tenant-ink)' }}>{c.shift}</p>
                <TonePill tone={c.status === 'open' ? 'urgent' : 'ok'}>{c.status === 'open' ? 'Open' : 'Filled'}</TonePill>
              </div>
              <p className="mt-1 text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>{c.reason}</p>
              <p className="mt-1 text-[12px]" style={{ color: 'var(--tenant-muted)' }}>{c.rate}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Roster table */}
      <section>
        <div className="flex items-center justify-between">
          <Eyebrow>Today's roster</Eyebrow>
          <DraftChip>Timesheet coding — draft for payroll</DraftChip>
        </div>
        <div className="mt-3 overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--tenant-line)' }}>
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}>
                {['Staff', 'Role', 'Area', 'Shift', 'Rate'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-mono text-[12px] uppercase tracking-[0.12em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHIFTS.map((s) => {
                const rate = RATE_LABEL[s.rate];
                return (
                  <tr key={s.id} className="border-t" style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--tenant-ink)' }}>
                      {s.staff}
                      {s.onCall ? <span className="ml-1.5 rounded px-1.5 py-0.5 text-[12px] font-semibold uppercase" style={{ background: 'var(--tenant-accent)', color: '#fff' }}>on call</span> : null}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--tenant-muted)' }}>{s.role}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--tenant-ink)' }}>{s.area}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px]" style={{ color: 'var(--tenant-ink)' }}>{s.start}–{s.end}</td>
                    <td className="px-4 py-2.5"><TonePill tone={rate.tone}>{rate.label}</TonePill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 rounded-xl border-l-4 px-4 py-3 text-[12.5px] leading-relaxed" style={{ borderColor: 'var(--tenant-accent)', background: 'rgba(181,115,46,0.07)', color: 'var(--tenant-ink)' }}>
        <span className="font-medium">Holidays Act 2003 · </span>{HOLIDAYS_ACT_NOTE}
      </p>
    </div>
  );
}
