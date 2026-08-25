import { VOLUNTEERS, VOLUNTEER_NOTE, type Volunteer } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, Eyebrow, PageHeading, TonePill } from '../_components/ui';

const VETTING: Record<Volunteer['vetting'], { label: string; tone: 'ok' | 'watch' | 'urgent' }> = {
  current: { label: 'Vetting current', tone: 'ok' },
  expiring: { label: 'Vetting expiring', tone: 'watch' },
  required: { label: 'Vetting required', tone: 'urgent' },
};

export default function VolunteersPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · volunteers"
        title="Volunteer management"
        intro={VOLUNTEER_NOTE}
      />

      <div className="grid gap-3 md:grid-cols-3">
        {VOLUNTEERS.map((v) => {
          const vet = VETTING[v.vetting];
          return (
            <Card key={v.id} as="article">
              <h2 className="font-[family-name:var(--font-display)] text-[17px]" style={{ color: 'var(--tenant-ink)' }}>{v.name}</h2>
              <p className="text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>{v.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <TonePill tone={v.trained ? 'ok' : 'watch'}>{v.trained ? 'Trained' : 'Training due'}</TonePill>
                <TonePill tone={vet.tone}>{vet.label}</TonePill>
              </div>
              <p className="mt-3 text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>
                <span className="font-mono text-[12px] uppercase tracking-[0.1em]">Available</span> · {v.availability}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
