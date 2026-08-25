import { SectionPage } from '@/components/ops/toa/SectionPage';
import { toaClientUpdates, toaProjects } from '@/lib/customers/toa-architects/demo-data';

export default function ClientsPage() {
  return (
    <SectionPage
      title="Clients"
      lede="Every Friday ARC drafts one update per live project — photos, decisions, next week's plan, contractor status. The principal reads, tweaks, approves."
    >
      <div className="flex flex-col gap-3">
        {toaClientUpdates.map((u) => {
          const project = toaProjects.find((p) => p.name === u.project);
          return (
            <article
              key={u.id}
              className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-ink)]">
                  {u.project}
                </h2>
                <span className="text-xs text-[color:var(--brand-muted)]">
                  to {project?.clientName ?? 'client'} · week ending {u.weekEnding}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[color:var(--brand-muted)]">
                    This week
                  </dt>
                  <dd className="mt-1 text-[color:var(--brand-ink)]">
                    {u.photosThisWeek} site photos ·{' '}
                    {u.decisionsMade.length} decision
                    {u.decisionsMade.length === 1 ? '' : 's'} recorded
                  </dd>
                  <ul className="mt-1 list-inside list-disc text-[13px] text-[color:var(--brand-ink)]">
                    {u.decisionsMade.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[color:var(--brand-muted)]">
                    Next week
                  </dt>
                  <dd className="mt-1 text-[color:var(--brand-ink)]">{u.nextWeek}</dd>
                  <dt className="mt-2 text-xs uppercase tracking-wide text-[color:var(--brand-muted)]">
                    Contractor
                  </dt>
                  <dd className="mt-1 text-[color:var(--brand-ink)]">
                    {u.contractorStatus}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-black/5 pt-2 text-[12px] text-[color:var(--brand-muted)]">
                draft — saves the principal 3–4 hours of Friday writing, goes
                nowhere without approval (demo)
              </p>
            </article>
          );
        })}
      </div>
    </SectionPage>
  );
}
