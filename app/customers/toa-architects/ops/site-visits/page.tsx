import { SectionPage } from '@/components/ops/toa/SectionPage';
import { toaSiteVisit } from '@/lib/customers/toa-architects/demo-data';

export default function SiteVisitsPage() {
  const v = toaSiteVisit;
  const wave = [4, 9, 14, 8, 16, 11, 6, 13, 17, 9, 5, 12, 15, 7, 10, 14, 6, 11, 8, 4, 12, 7, 15, 9];

  return (
    <SectionPage
      title="Site Visits"
      lede="Record a voice memo on the walk back to the car; ARC turns it into a structured report and sends it to the right people — after you've read it."
    >
      <article className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        {/* the input */}
        <div className="flex items-center gap-3 rounded-xl bg-[color:var(--brand-bg)] px-4 py-3">
          <span className="flex h-9 flex-1 items-center gap-[2px] overflow-hidden">
            {wave.map((h, i) => (
              <span
                key={i}
                aria-hidden
                className="w-[3px] shrink-0 rounded-full"
                style={{ height: h, backgroundColor: 'var(--brand-accent)', opacity: 0.7 }}
              />
            ))}
          </span>
          <span className="shrink-0 text-xs text-[color:var(--brand-muted)]">
            {Math.floor(v.memoSeconds / 60)}:{String(v.memoSeconds % 60).padStart(2, '0')} voice memo ·{' '}
            {v.recordedBy}
          </span>
        </div>

        <p className="my-3 text-center text-xs text-[color:var(--brand-muted)]">
          ↓ becomes
        </p>

        {/* the output */}
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-ink)]">
            Site visit report — {v.project}
          </h2>
          <p className="mt-1 text-xs text-[color:var(--brand-muted)]">
            {v.date} · {v.weather} · photos attached from the phone&apos;s camera roll
          </p>

          <h3 className="mt-4 text-xs uppercase tracking-wide text-[color:var(--brand-muted)]">
            Progress
          </h3>
          <ul className="mt-1 list-inside list-disc text-sm text-[color:var(--brand-ink)]">
            {v.progress.map((pr) => (
              <li key={pr}>{pr}</li>
            ))}
          </ul>

          <h3 className="mt-4 text-xs uppercase tracking-wide text-[color:var(--brand-muted)]">
            Defects
          </h3>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {v.defects.map((d) => (
              <li key={d.item} className="rounded-lg bg-[color:var(--brand-bg)] px-3 py-2">
                <span className="text-[color:var(--brand-ink)]">{d.item}</span>
                <span className="text-[color:var(--brand-muted)]">
                  {' '}
                  — {d.action} ({d.owner})
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-4 text-xs uppercase tracking-wide text-[color:var(--brand-muted)]">
            Decisions
          </h3>
          <ul className="mt-1 list-inside list-disc text-sm text-[color:var(--brand-ink)]">
            {v.decisions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          <p className="mt-4 border-t border-black/5 pt-2 text-[12px] text-[color:var(--brand-muted)]">
            distribution once approved: {v.distribution.join(' · ')} (demo)
          </p>
        </div>
      </article>
    </SectionPage>
  );
}
