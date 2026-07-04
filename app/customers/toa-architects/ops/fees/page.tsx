import { SectionPage } from '@/components/ops/toa/SectionPage';
import { toaFeeProposal } from '@/lib/customers/toa-architects/demo-data';

export default function FeesPage() {
  const p = toaFeeProposal;
  const totalHours = p.phases.reduce((h, ph) => h + ph.hours, 0);
  const max = Math.max(...p.phases.map((ph) => ph.fee));

  return (
    <SectionPage
      title="Fees"
      lede="From a client brief, ARC drafts the fee proposal — hours per phase on the NZIA/ACE basis, letter and spreadsheet in the practice's own template."
    >
      <article className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-ink)]">
            {p.project} — {p.clientName}
          </h2>
          <span className="text-xs uppercase tracking-wide text-[color:var(--brand-muted)]">
            {p.status} (demo)
          </span>
        </div>
        <p className="mt-1 text-xs text-[color:var(--brand-muted)]">{p.basis}</p>

        <div className="mt-5 flex flex-col gap-2">
          {p.phases.map((ph) => (
            <div key={ph.phase} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-sm text-[color:var(--brand-ink)]">
                {ph.phase}
              </span>
              <span className="relative h-5 flex-1 overflow-hidden rounded-sm bg-black/5">
                <span
                  className="absolute inset-y-0 left-0 rounded-sm"
                  style={{
                    width: `${(ph.fee / max) * 100}%`,
                    backgroundColor: 'var(--brand-accent)',
                    opacity: 0.85,
                  }}
                />
              </span>
              <span className="w-16 shrink-0 text-right text-sm text-[color:var(--brand-ink)]">
                {ph.hours}h
              </span>
              <span className="w-20 shrink-0 text-right text-sm text-[color:var(--brand-ink)]">
                ${ph.fee.toLocaleString('en-NZ')}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-black/10 pt-3">
          <span className="text-sm text-[color:var(--brand-muted)]">
            {totalHours} hours across four phases
          </span>
          <span className="font-[family-name:var(--font-brand-display)] text-lg font-semibold text-[color:var(--brand-ink)]">
            ${p.total.toLocaleString('en-NZ')} + GST (demo)
          </span>
        </div>

        <p className="mt-4 rounded-lg bg-[color:var(--brand-bg)] px-3 py-2 text-[12px] text-[color:var(--brand-muted)]">
          Output: cover letter (practice letterhead) + phase spreadsheet.
          Scaled from the draft RC scope — two 65 m² units on a sloped site;
          the principal adjusts hours and rates before anything leaves the
          studio.
        </p>
      </article>
    </SectionPage>
  );
}
