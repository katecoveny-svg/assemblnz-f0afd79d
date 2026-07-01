import { EVENTS, type ZooEvent } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, Eyebrow, PageHeading, TonePill } from '../_components/ui';

const TYPE_LABEL: Record<ZooEvent['type'], string> = {
  school: 'School group',
  'night-tour': 'Night tour',
  'keeper-for-a-day': 'Keeper for a day',
  corporate: 'Corporate hire',
};

export default function EventsPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · events & programmes"
        title="Education & events calendar"
        intro="School groups, night tours, keeper-for-a-day and corporate hires. Keeper drafts itineraries, waitlists and H&S briefings — for the education and events teams to review and confirm."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {EVENTS.map((e) => (
          <Card key={e.id} as="article">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full px-2.5 py-1 text-[10.5px] font-medium" style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}>
                {TYPE_LABEL[e.type]}
              </span>
              <TonePill tone={e.status}>{e.status === 'ok' ? 'Set' : 'Watch'}</TonePill>
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-[18px] leading-tight" style={{ color: 'var(--tenant-ink)' }}>{e.title}</h2>
            <p className="mt-1 text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>{e.when} · {e.headcount}</p>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>{e.note}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
