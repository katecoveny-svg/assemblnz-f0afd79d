import { SPECIES } from '@/lib/customers/auckland-zoo/data';
import {
  Card,
  DemoTag,
  Eyebrow,
  PageHeading,
  SpeciesSilhouette,
  StatusDot,
  TaongaBadge,
  WelfarePill,
} from '../_components/ui';

export default function SpeciesPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · species management"
        title="Species recovery & studbook view"
        intro="One card per Zoo Threatened Species Recovery species — the named animals in each, welfare-code compliance status, and breeding-plan progress. Illustrative statuses only; every action ships as a draft."
      />

      <div className="space-y-5">
        {SPECIES.map((s) => (
          <Card key={s.slug} as="article">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              {/* Silhouette + identity */}
              <div className="flex items-start gap-4 md:w-72 md:shrink-0">
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary)' }}
                >
                  <SpeciesSilhouette slug={s.slug} className="h-10 w-10" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-[family-name:var(--font-display)] text-[21px] leading-tight" style={{ color: 'var(--tenant-ink)' }}>
                    {s.name}
                  </h2>
                  <p className="text-[12.5px] italic" style={{ color: 'var(--tenant-muted)' }}>
                    {s.scientific}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <WelfarePill status={s.welfare} />
                    {s.taonga ? <TaongaBadge /> : null}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
                  {s.blurb}
                </p>

                <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--tenant-muted)' }}>
                      Recovery programme
                    </dt>
                    <dd className="mt-0.5 text-[13.5px]" style={{ color: 'var(--tenant-ink)' }}>
                      {s.recoveryProgramme}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--tenant-muted)' }}>
                      Breeding plan
                    </dt>
                    <dd className="mt-0.5 text-[13.5px]" style={{ color: 'var(--tenant-ink)' }}>
                      {s.breedingPlan}
                    </dd>
                  </div>
                </dl>

                {/* Breeding progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[12px]" style={{ color: 'var(--tenant-muted)' }}>
                    <span>Breeding-plan progress (illustrative)</span>
                    <span>{s.breedingProgress}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: 'var(--tenant-primary-soft)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.breedingProgress}%`, background: 'var(--tenant-primary)' }}
                    />
                  </div>
                </div>

                {/* Animals */}
                <div className="mt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--tenant-muted)' }}>
                    Individual animals
                  </p>
                  <ul className="mt-2 space-y-2">
                    {s.animals.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2"
                        style={{ background: 'var(--tenant-cream)' }}
                      >
                        <StatusDot tone={a.statusTone} />
                        <span className="text-[13.5px] font-medium" style={{ color: 'var(--tenant-ink)' }}>
                          {a.name}
                        </span>
                        <span className="text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>
                          {a.age} · {a.status}
                        </span>
                        <span className="ml-auto">
                          <DemoTag>{a.provenance}</DemoTag>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
