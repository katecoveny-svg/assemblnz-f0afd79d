'use client';

import type { PricingTier } from '@/lib/agent-app/types';

export type HoursBackPricingProps = {
  sectionId?: string;
  titleId?: string;
  eyebrow: string;
  title: string;
  support: string;
  tiers: readonly PricingTier[];
  hoursBack: string;
  hoursBackNote: string;
  meterLabel?: string;
};

/**
 * Look / Practice / Studio / Enterprise ladder framed as hours back,
 * plus a credit meter for the preview conversation.
 */
export function HoursBackPricing({
  sectionId = 'aa-pricing',
  titleId = 'aa-pricing-title',
  eyebrow,
  title,
  support,
  tiers,
  hoursBack,
  hoursBackNote,
  meterLabel = 'Hours-back meter · DEMO',
}: HoursBackPricingProps) {
  const maxHours = Math.max(
    1,
    ...tiers.map((t) => (typeof t.hoursBack === 'number' ? t.hoursBack : 0)),
  );

  return (
    <section className="aa-section" aria-labelledby={titleId} id={sectionId}>
      <div className="aa-section-head">
        <p className="aa-eyebrow aa-mono">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        <p>{support}</p>
      </div>

      <div className="aa-pricing-grid">
        {tiers.map((tier) => (
          <article key={tier.name} className="aa-tier">
            <h3>{tier.name}</h3>
            <p className="aa-tier-price">{tier.price}</p>
            <p>{tier.detail}</p>
            <p className="aa-tier-credits aa-mono">{tier.credits}</p>
            {typeof tier.hoursBack === 'number' ? (
              <p className="aa-tier-hours aa-mono">~{tier.hoursBack}h back / week</p>
            ) : null}
          </article>
        ))}
      </div>

      <div className="aa-credit-meter" aria-label={meterLabel}>
        <div className="aa-credit-meter-head">
          <p className="aa-mono aa-credit-meter-label">{meterLabel}</p>
          <p className="aa-mono aa-credit-meter-scale">0 → {maxHours}h</p>
        </div>
        <div className="aa-credit-meter-track" role="presentation">
          {tiers.map((tier) => {
            const hours = typeof tier.hoursBack === 'number' ? tier.hoursBack : 0;
            const width = Math.max(6, Math.round((hours / maxHours) * 100));
            return (
              <div key={tier.name} className="aa-credit-meter-row">
                <span className="aa-mono">{tier.name}</span>
                <div className="aa-credit-meter-bar-wrap">
                  <div
                    className="aa-credit-meter-bar"
                    style={{ width: `${width}%` }}
                    data-tier={tier.name.toLowerCase()}
                  />
                </div>
                <span className="aa-mono">{hours > 0 ? `${hours}h` : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="aa-hours">
        <strong>{hoursBack}</strong>
        <span>{hoursBackNote}</span>
      </div>
    </section>
  );
}
