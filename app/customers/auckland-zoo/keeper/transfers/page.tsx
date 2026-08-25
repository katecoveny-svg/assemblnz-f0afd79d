import { TRANSFERS } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, DraftChip, Eyebrow, PageHeading, TonePill } from '../_components/ui';

export default function TransfersPage() {
  const incoming = TRANSFERS.filter((t) => t.direction === 'incoming');
  const outgoing = TRANSFERS.filter((t) => t.direction === 'outgoing');
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · animal transfers"
        title="Transfer records"
        intro="Incoming animals from other institutions and outgoing releases — with CITES permits and MPI biosecurity (Import Health Standard) pre-flight checks drafted. Every permit and chain-of-custody note is an unsigned draft for a permitted handler to sign."
      />

      <Section title="Outgoing" rows={outgoing} />
      <div className="mt-6" />
      <Section title="Incoming" rows={incoming} />
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: typeof TRANSFERS }) {
  return (
    <section>
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-3 space-y-3">
        {rows.map((t) => (
          <Card key={t.id} as="article">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-[18px]" style={{ color: 'var(--tenant-ink)' }}>{t.animal}</h2>
              <TonePill tone={t.status}>{t.status === 'ok' ? 'On track' : 'Checks pending'}</TonePill>
            </div>
            <p className="mt-1 text-[13px]" style={{ color: 'var(--tenant-muted)' }}>
              {t.from} → {t.to}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}>
                {t.compliance}
              </span>
              <DraftChip />
            </div>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>{t.note}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
