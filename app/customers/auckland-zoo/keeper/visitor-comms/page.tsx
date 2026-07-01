import { VISITOR_COMMS, VISITOR_COMMS_NOTE, type VisitorComm } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, DraftChip, Eyebrow, PageHeading } from '../_components/ui';

const KIND_LABEL: Record<VisitorComm['kind'], string> = {
  booking: 'Booking confirmation',
  quote: 'Group tour quote',
  review: 'Review response',
};

export default function VisitorCommsPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · visitor comms"
        title="Visitor communications"
        intro={VISITOR_COMMS_NOTE}
      />

      <div className="space-y-4">
        {VISITOR_COMMS.map((c) => (
          <Card key={c.id} as="article">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full px-2.5 py-1 text-[10.5px] font-medium" style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}>
                {KIND_LABEL[c.kind]} · {c.channel}
              </span>
              <DraftChip />
            </div>
            <h2 className="mt-2 text-[15px] font-medium" style={{ color: 'var(--tenant-ink)' }}>{c.subject}</h2>
            <blockquote className="mt-2 rounded-xl border-l-4 px-4 py-3 text-[13.5px] italic leading-relaxed" style={{ borderColor: 'var(--tenant-primary)', background: 'var(--tenant-cream)', color: 'var(--tenant-ink)' }}>
              {c.preview}
            </blockquote>
          </Card>
        ))}
      </div>
    </div>
  );
}
