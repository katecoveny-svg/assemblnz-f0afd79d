import { SectionPage } from '@/components/ops/toa/SectionPage';
import {
  toa16A,
  toaProducerStatements,
  toaProjects,
} from '@/lib/customers/toa-architects/demo-data';

/**
 * Documents — the practice's live document schedule at a glance: current
 * drawing sets per project plus the producer-statement register. ARC's job
 * here is unglamorous and constant: keep the schedule true as files land.
 */
export default function DocumentsPage() {
  return (
    <SectionPage
      title="Documents"
      lede="The document schedule ARC keeps alive — current drawing sets per project, and the producer-statement register on the way to CCC."
    >
      <article className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-ink)]">
          16A Hubert Henderson Place — project register
        </h2>
        <ul className="mt-3 divide-y divide-black/5 text-sm">
          {toa16A.register.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 truncate text-[color:var(--brand-ink)]">
                {d.name}
                <span className="text-[color:var(--brand-muted)]"> · {d.detail}</span>
              </span>
              <span className="shrink-0 text-xs text-[color:var(--brand-muted)]">
                {d.status}
              </span>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-ink)]">
          Drawing sets
        </h2>
        <ul className="mt-3 divide-y divide-black/5 text-sm">
          {toaProjects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 truncate text-[color:var(--brand-ink)]">
                {p.name}
                <span className="text-[color:var(--brand-muted)]"> · {p.location}</span>
              </span>
              <span className="shrink-0 text-xs capitalize text-[color:var(--brand-muted)]">
                {p.stage} set · current (demo)
              </span>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-ink)]">
          Producer statements
        </h2>
        <ul className="mt-3 divide-y divide-black/5 text-sm">
          {toaProducerStatements.map((ps) => (
            <li key={ps.id} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 truncate text-[color:var(--brand-ink)]">
                <span className="mr-2 rounded border border-black/10 px-1.5 py-0.5 text-[10px] font-semibold">
                  {ps.kind}
                </span>
                {ps.project}
                <span className="text-[color:var(--brand-muted)]"> · {ps.discipline} · {ps.firm}</span>
              </span>
              <span className="shrink-0 text-xs text-[color:var(--brand-muted)]">
                {ps.status} · for {ps.requiredFor.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-[color:var(--brand-muted)]">
          files live in the practice&apos;s own Dropbox / Drive / SharePoint —
          ARC reads and indexes, it doesn&apos;t move your archive (demo)
        </p>
      </article>
    </SectionPage>
  );
}
