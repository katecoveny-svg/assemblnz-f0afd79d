import type { CustomerJourney, JourneyProofSummary, ProofMetric } from '@/lib/journey/types';
import styles from './journey.module.css';

// Honest source-type labels — measured/calculated read as trustworthy;
// estimated/simulated are visibly caveated (never presented as measured).
const SOURCE_LABEL: Record<ProofMetric['sourceType'], string> = {
  measured: 'Measured',
  calculated: 'Calculated',
  customer_reported: 'Customer reported',
  model_assessed: 'Model assessed',
  estimated: 'Estimated',
  simulated: 'Simulated',
};

function formatValue(m: ProofMetric): string {
  if (typeof m.value === 'string') return m.value;
  if (m.unit === 'percent') return `${m.value}%`;
  if (m.unit === 'minutes') return `~${m.value}m`;
  if (m.unit === 'nzd') return `${m.value >= 0 ? '+' : '−'}$${Math.abs(m.value).toFixed(0)}`;
  return String(m.value);
}

/**
 * Reusable premium "operational certificate" for a journey run. Every metric
 * shows its data lineage (source type); estimated/simulated figures are never
 * presented as measured. Not a gamified score.
 */
export function JourneyProofCard({
  proof,
  journey,
}: {
  proof: JourneyProofSummary;
  journey: CustomerJourney;
}) {
  return (
    <div className={styles.proof}>
      <p className={styles.proofSeal}>assembl proof · {journey.name}</p>
      <h2 className={styles.headline} style={{ marginTop: '0.5rem' }}>
        The experience, proven
      </h2>
      <p className={styles.lede}>{journey.objective}</p>

      <div className={styles.metrics}>
        {proof.lineage.map((m) => (
          <div key={m.id} className={styles.metric} title={m.methodology}>
            <div className={styles.metricValue}>{formatValue(m)}</div>
            <div className={styles.metricLabel}>{m.name}</div>
            <div className={styles.metricEst}>
              {SOURCE_LABEL[m.sourceType]}
              {m.confidence ? ` · ${m.confidence}` : ''}
            </div>
          </div>
        ))}
      </div>

      {proof.assumptionsSurfaced.length > 0 && (
        <>
          <p className={styles.eyebrow} style={{ marginTop: '1.25rem' }}>Assumptions surfaced</p>
          <ul className={styles.list}>
            {proof.assumptionsSurfaced.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      {proof.unresolvedIssues.length > 0 && (
        <>
          <p className={styles.eyebrow} style={{ marginTop: '1.25rem', color: '#8a6b1f' }}>Unresolved</p>
          <ul className={styles.list}>
            {proof.unresolvedIssues.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </>
      )}

      <p className={styles.eyebrow} style={{ marginTop: '1.25rem' }}>Known limitations</p>
      <ul className={styles.list}>
        {proof.limitations.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
