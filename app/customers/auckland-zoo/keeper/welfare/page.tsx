import {
  SPECIES,
  WELFARE_RECORDS,
  WELFARE_SUMMARY,
  getSpecies,
} from '@/lib/customers/auckland-zoo/data';
import { Card, Eyebrow, PageHeading, SpeciesSilhouette, WelfarePill } from '../_components/ui';

export default function WelfarePage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · welfare compliance"
        title="Welfare-code compliance tracker"
        intro="Every enclosure checked against the MPI Code of Welfare (Zoos) and the ZAA Accreditation Manual. Keeper surfaces gaps as they emerge — not after the audit. Statuses here are illustrative for the demo, never a real audit record."
      />

      {/* Summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Compliant" value={WELFARE_SUMMARY.compliant} status="compliant" />
        <SummaryCard label="Review due" value={WELFARE_SUMMARY.reviewDue} status="review-due" />
        <SummaryCard label="Gaps flagged" value={WELFARE_SUMMARY.gaps} status="gap-flagged" />
      </div>

      {/* Records grouped by species */}
      <div className="space-y-5">
        {SPECIES.map((s) => {
          const records = WELFARE_RECORDS.filter((r) => r.speciesSlug === s.slug);
          if (records.length === 0) return null;
          return (
            <Card key={s.slug} as="section">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary)' }}
                >
                  <SpeciesSilhouette slug={s.slug} className="h-7 w-7" />
                </span>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-[18px]" style={{ color: 'var(--tenant-ink)' }}>
                    {s.name}
                  </h2>
                  <p className="text-[12px]" style={{ color: 'var(--tenant-muted)' }}>
                    {records.length} welfare {records.length === 1 ? 'record' : 'records'}
                    {s.taonga ? ' · taonga species — cultural content kaumātua-gated' : ''}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {records.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border p-4"
                    style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-cream)' }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[14px] font-medium" style={{ color: 'var(--tenant-ink)' }}>
                        {r.enclosure}
                      </p>
                      <WelfarePill status={r.status} />
                    </div>
                    <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: 'var(--tenant-muted)' }}>
                      {r.code}
                    </p>
                    <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
                      {r.requirement}
                    </p>
                    <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: 'var(--tenant-muted)' }}>
                      {r.note}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--tenant-muted)' }}>
                      Last checked {r.lastChecked}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: 'compliant' | 'review-due' | 'gap-flagged';
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <Eyebrow>{label}</Eyebrow>
        <WelfarePill status={status} />
      </div>
      <p className="mt-2 font-[family-name:var(--font-display)] text-[36px] leading-none" style={{ color: 'var(--tenant-ink)' }}>
        {value}
      </p>
    </Card>
  );
}
