import { SectionPage } from '@/components/ops/toa/SectionPage';
import { toaConsents } from '@/lib/customers/toa-architects/demo-data';

const STATUS_COLOUR = {
  green: '#3e7a52',
  amber: '#b98a2e',
  red: '#a4432e',
} as const;

export default function ConsentsPage() {
  return (
    <SectionPage
      title="Consents"
      lede="ARC drafts applications and RFI answers, watches every portal, and flags anything stuck — with the clause it's citing."
    >
      <div className="flex flex-col gap-3">
        {toaConsents.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-ink)]">
                {c.project}
              </h2>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] text-white"
                style={{ backgroundColor: STATUS_COLOUR[c.status] }}
              >
                {c.stage}
              </span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--brand-muted)]">
              {c.council} · {c.portal} · {c.reference} · {c.daysInStage} days in
              stage
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--brand-ink)]">
              {c.statusNote}
            </p>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}
