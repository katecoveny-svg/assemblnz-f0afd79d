import { RECOGNITION } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, Eyebrow, PageHeading, TonePill } from '../_components/ui';

export default function RecognitionPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · staff recognition"
        title="Recognition & CPD"
        intro={RECOGNITION.note}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <Eyebrow>Keeper of the month · {RECOGNITION.keeperOfMonth.month}</Eyebrow>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[26px]" style={{ color: 'var(--tenant-ink)' }}>
            {RECOGNITION.keeperOfMonth.name}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--tenant-muted)' }}>
            {RECOGNITION.keeperOfMonth.reason}
          </p>
        </Card>

        <Card>
          <Eyebrow>Tenure milestones</Eyebrow>
          <ul className="mt-3 space-y-2.5">
            {RECOGNITION.milestones.map((m) => (
              <li key={m.name} className="flex items-center justify-between">
                <span className="text-[14px]" style={{ color: 'var(--tenant-ink)' }}>{m.name}</span>
                <span className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-display)] text-[17px]" style={{ color: 'var(--tenant-primary)' }}>{m.milestone}</span>
                  <span className="text-[12px]" style={{ color: 'var(--tenant-muted)' }}>{m.when}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Eyebrow>CPD tracker</Eyebrow>
          <ul className="mt-3 space-y-2.5">
            {RECOGNITION.cpd.map((c) => (
              <li key={c.name} className="flex items-start justify-between gap-2">
                <span className="text-[13px]" style={{ color: 'var(--tenant-ink)' }}>
                  <span className="font-medium">{c.name}</span> — {c.item}
                </span>
                <TonePill tone={c.status}>{c.status === 'ok' ? 'On track' : 'Due'}</TonePill>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
