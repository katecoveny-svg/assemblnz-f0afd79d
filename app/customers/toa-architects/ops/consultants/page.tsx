import { SectionPage } from '@/components/ops/toa/SectionPage';
import { toaConsultants } from '@/lib/customers/toa-architects/demo-data';

const DOT = {
  current: '#3e7a52',
  chasing: '#b98a2e',
  overdue: '#a4432e',
} as const;

export default function ConsultantsPage() {
  return (
    <SectionPage
      title="Consultants"
      lede="ARC keeps the consultant schedule alive — who's on which project, what's outstanding, and a drafted follow-up whenever something slips."
    >
      <div className="flex flex-col gap-3">
        {toaConsultants.map((k) => (
          <article
            key={k.id}
            className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-ink)]">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: DOT[k.status] }}
                />
                {k.firm}
              </h2>
              <span className="text-xs capitalize text-[color:var(--brand-muted)]">
                {k.discipline} · {k.projects.length} project
                {k.projects.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--brand-muted)]">
              {k.projects.join(' · ')}
            </p>
            <p className="mt-3 text-sm text-[color:var(--brand-ink)]">
              {k.outstanding
                ? `Outstanding: ${k.outstanding}. Follow-up drafted, waiting for your yes.`
                : 'Nothing outstanding. ARC re-checks the document schedule as drawings and reports land.'}
            </p>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}
