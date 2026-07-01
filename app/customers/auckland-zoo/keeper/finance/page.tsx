import { FINANCE } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, DraftChip, Eyebrow, PageHeading, TonePill } from '../_components/ui';

export default function FinancePage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · finance"
        title="Finance & funding"
        intro={FINANCE.note}
      />

      <Card className="mb-4">
        <Eyebrow>Council reporting</Eyebrow>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>{FINANCE.councilReporting}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <Eyebrow>Donations</Eyebrow>
          <ul className="mt-3 space-y-3">
            {FINANCE.donations.map((d) => (
              <li key={d.source}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--tenant-ink)' }}>{d.source}</span>
                  <TonePill tone={d.trend}>Tracking</TonePill>
                </div>
                <p className="mt-1 text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>{d.note}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <Eyebrow>Grant applications</Eyebrow>
            <DraftChip>Draft for finance</DraftChip>
          </div>
          <ul className="mt-3 space-y-3">
            {FINANCE.grants.map((g) => (
              <li key={g.funder}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--tenant-ink)' }}>{g.funder}</span>
                  <TonePill tone={g.status}>{g.status === 'ok' ? 'Ready' : 'In progress'}</TonePill>
                </div>
                <p className="text-[12px]" style={{ color: 'var(--tenant-muted)' }}>{g.purpose}</p>
                <p className="mt-1 text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>{g.note}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-6 rounded-xl px-4 py-3 text-[12.5px] leading-relaxed" style={{ background: 'var(--tenant-cream)', color: 'var(--tenant-muted)' }}>
        Figures are illustrative placeholders. Keeper drafts reports, acquittals and grant applications for the
        finance team to review — it never moves money or lodges anything itself.
      </p>
    </div>
  );
}
