import { PAYROLL } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, DraftChip, Eyebrow, PageHeading } from '../_components/ui';

export default function PayrollPage() {
  return (
    <div>
      <PageHeading
        eyebrow={`Keeper · payroll · ${PAYROLL.period}`}
        title="Payroll — timesheet coding"
        intro={PAYROLL.integration}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DraftChip>Draft for council payroll approval</DraftChip>
        <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}>
          {PAYROLL.provider}
        </span>
        <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: 'rgba(181,115,46,0.16)', color: '#8A5418' }}>
          Read-only integration
        </span>
      </div>

      <Card>
        <Eyebrow>Hours & penalty coding — {PAYROLL.period}</Eyebrow>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr style={{ color: 'var(--tenant-muted)' }}>
                {['Staff', 'Ordinary', 'Sunday', 'Public hol.', 'Alt days', 'Flag'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-mono text-[12px] uppercase tracking-[0.12em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYROLL.lines.map((l) => (
                <tr key={l.staff} className="border-t" style={{ borderColor: 'var(--tenant-line)' }}>
                  <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--tenant-ink)' }}>{l.staff}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--tenant-ink)' }}>{l.ordinary} h</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--tenant-ink)' }}>{l.sunday ? `${l.sunday} h` : '—'}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--tenant-ink)' }}>{l.publicHoliday} h</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--tenant-ink)' }}>{l.altDays}</td>
                  <td className="px-3 py-2.5 text-[12px]" style={{ color: 'var(--tenant-muted)' }}>{l.flag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-6 rounded-xl px-4 py-3 text-[12.5px] leading-relaxed" style={{ background: 'var(--tenant-cream)', color: 'var(--tenant-muted)' }}>
        No dollar amounts are shown — Keeper drafts hours and penalty-rate coding only. Auckland Council payroll
        holds pay rates and processes the pay run. Illustrative demo data.
      </p>
    </div>
  );
}
