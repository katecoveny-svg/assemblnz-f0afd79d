import { BREEDING_CALENDAR } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, Eyebrow, PageHeading, TaongaBadge, TonePill } from '../_components/ui';

export default function BreedingPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · breeding programme"
        title="Breeding programme calendar"
        intro="Species-recovery breeding schedules and studbook milestones, aligned to the AZA/ZAA programmes Auckland Zoo participates in. For taonga species, naming and whakapapa content is held for iwi — Keeper never generates it."
      />

      <div className="space-y-4">
        {BREEDING_CALENDAR.map((b) => (
          <Card key={b.id} as="article">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-[19px]" style={{ color: 'var(--tenant-ink)' }}>{b.species}</h2>
                <p className="text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>{b.programme}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {b.taonga ? <TaongaBadge /> : null}
                <TonePill tone={b.status}>{b.window}</TonePill>
              </div>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
              <span className="font-medium">Milestone: </span>{b.milestone}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--tenant-muted)' }}>{b.note}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
