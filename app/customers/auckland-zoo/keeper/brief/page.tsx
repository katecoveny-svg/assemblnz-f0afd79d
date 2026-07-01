import { DAILY_BRIEF } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, DraftChip, Eyebrow, PageHeading, StatusDot } from '../_components/ui';

export default function BriefPage() {
  return (
    <div>
      <PageHeading
        eyebrow={`Keeper · leadership brief · ${DAILY_BRIEF.date}`}
        title="Daily brief"
        intro={`Auto-drafted at 07:00 for ${DAILY_BRIEF.for}. Who's on, what's happening, welfare flags, incidents and VIPs — every underlying item links to an unsigned draft.`}
      />

      <div className="mb-4 flex items-center gap-2">
        <DraftChip>Auto-drafted 07:00</DraftChip>
      </div>

      <Card className="mb-4">
        <Eyebrow>On today</Eyebrow>
        <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
          {DAILY_BRIEF.onToday}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <Eyebrow>Welfare flags</Eyebrow>
          <ul className="mt-3 space-y-2.5">
            {DAILY_BRIEF.welfareFlags.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1"><StatusDot tone={f.tone} /></span>
                <span className="text-[13.5px] leading-snug" style={{ color: 'var(--tenant-ink)' }}>{f.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Eyebrow>Incidents & cover</Eyebrow>
          <ul className="mt-3 space-y-2.5">
            {DAILY_BRIEF.incidents.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1"><StatusDot tone={f.tone} /></span>
                <span className="text-[13.5px] leading-snug" style={{ color: 'var(--tenant-ink)' }}>{f.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Eyebrow>Happening today</Eyebrow>
          <ul className="mt-3 space-y-2">
            {DAILY_BRIEF.happening.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px]" style={{ color: 'var(--tenant-ink)' }}>
                <span className="mt-1.5"><StatusDot tone="ok" /></span>
                {h}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Eyebrow>VIPs expected</Eyebrow>
          <ul className="mt-3 space-y-2">
            {DAILY_BRIEF.vips.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px]" style={{ color: 'var(--tenant-ink)' }}>
                <span className="mt-1.5"><StatusDot tone="ok" /></span>
                {v}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-6 rounded-xl px-4 py-3 text-[12.5px] leading-relaxed" style={{ background: 'var(--tenant-cream)', color: 'var(--tenant-muted)' }}>
        {DAILY_BRIEF.note}
      </p>
    </div>
  );
}
