import { NZCCM } from '@/lib/customers/auckland-zoo/data';
import { Card, Eyebrow, PageHeading, StatusDot } from '../_components/ui';

export default function NzccmPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · NZCCM integration"
        title={NZCCM.name}
        intro={NZCCM.summary}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scope */}
        <Card>
          <Eyebrow>Hospital scope · opened {NZCCM.opened}</Eyebrow>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {NZCCM.scope.map((item) => (
              <li
                key={item}
                className="rounded-lg px-3 py-2 text-[13px]"
                style={{ background: 'var(--tenant-cream)', color: 'var(--tenant-ink)' }}
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Caseload */}
        <Card>
          <Eyebrow>Live caseload (illustrative)</Eyebrow>
          <ul className="mt-3 space-y-2.5">
            {NZCCM.caseload.map((c) => (
              <li key={c.label} className="flex items-start gap-2.5">
                <span className="mt-1.5">
                  <StatusDot tone={c.tone} />
                </span>
                <span className="text-[13.5px]" style={{ color: 'var(--tenant-ink)' }}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Bridges */}
      <section className="mt-8">
        <Eyebrow>Keeper bridges into the NZCCM workflow</Eyebrow>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {NZCCM.bridges.map((b) => (
            <Card key={b.title} as="article" className="h-full">
              <h2 className="font-[family-name:var(--font-display)] text-[17px] leading-tight" style={{ color: 'var(--tenant-ink)' }}>
                {b.title}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--tenant-muted)' }}>
                {b.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <p className="mt-8 rounded-xl px-4 py-3 text-[12.5px] leading-relaxed" style={{ background: 'var(--tenant-cream)', color: 'var(--tenant-muted)' }}>
        Profile drawn from Auckland Zoo public materials and the Massey University conservation-medicine
        programme page (scanned per the Kaitiaki spec, 2026-06-29). Concept · pending — assembl is not a
        veterinary practice, not a DOC permitted handler, and not an authorised welfare inspector. Every
        NZCCM output is an unsigned draft for a registered veterinarian to review and sign.
      </p>
    </div>
  );
}
