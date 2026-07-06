/**
 * SourcesPanel — "where the answers come from". Every ARC reply ends with a
 * trust grade and its sources; this panel is the legend. Tiers are honest:
 * A = official/primary, B = professional guidance, C = general/derived.
 */
const CHAMPAGNE = '#bfa37a';

const SOURCES = [
  { tier: 'A', name: 'NZ Building Code', by: 'MBIE — Acceptable Solutions & Verification Methods' },
  { tier: 'A', name: 'Auckland Unitary Plan', by: 'Auckland Council — operative zone & district rules' },
  { tier: 'A', name: 'Te Aranga Māori Design Principles', by: 'Auckland Council — seven public principles' },
  { tier: 'B', name: 'NZIA guidance', by: 'NZ Institute of Architects — practice notes & templates' },
] as const;

const LEGEND = [
  { tier: 'A', label: 'official / primary source' },
  { tier: 'B', label: 'professional guidance' },
  { tier: 'C', label: 'general / derived' },
] as const;

function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold"
      style={{ backgroundColor: '#0b1f3a', color: CHAMPAGNE, border: `1px solid ${CHAMPAGNE}55` }}
    >
      {tier}
    </span>
  );
}

export function SourcesPanel() {
  return (
    <section aria-label="Where the answers come from" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.18em]"
          style={{ color: '#161516' }}
        >
          Where the answers come from
        </h2>
        <span className="text-xs" style={{ color: '#6f6f64' }}>
          every reply ends with its trust grade and sources
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOURCES.map((s) => (
          <div
            key={s.name}
            className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-4"
          >
            <TierBadge tier={s.tier} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: '#161516' }}>
                {s.name}
              </p>
              <p className="text-[12px] leading-snug" style={{ color: '#6f6f64' }}>
                {s.by}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-black/5 bg-[#f6f4ee] px-4 py-3">
        <span
          className="font-[family-name:var(--font-brand-mono)] text-[10px] uppercase tracking-[0.2em]"
          style={{ color: '#8a744f' }}
        >
          trust legend
        </span>
        {LEGEND.map((l) => (
          <span key={l.tier} className="flex items-center gap-2 text-[12px]" style={{ color: '#363a35' }}>
            <TierBadge tier={l.tier} />
            {l.label}
          </span>
        ))}
      </div>
    </section>
  );
}
