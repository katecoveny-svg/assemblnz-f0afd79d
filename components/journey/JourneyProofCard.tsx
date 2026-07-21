import type { CustomerJourney, JourneyProofSummary } from '@/lib/journey/types';
import styles from './journey.module.css';

type Metric = { value: string; label: string; estimated?: boolean };

/**
 * Reusable premium "operational certificate" for a journey run. Reports what
 * actually happened; every estimated/simulated figure is labelled. Not a
 * gamified score. Reusable across customers and sectors.
 */
export function JourneyProofCard({
  proof,
  journey,
}: {
  proof: JourneyProofSummary;
  journey: CustomerJourney;
}) {
  const metrics: Metric[] = [
    { value: `${Math.round(proof.stageCompletionRate * 100)}%`, label: 'Journey completed' },
    { value: String(proof.contextQuestionsAsked), label: 'Questions asked' },
    { value: `${proof.approvedActionCount}/${proof.proposedActionCount}`, label: 'Actions approved' },
    { value: String(proof.humanInterventionCount), label: 'Human handoffs' },
    {
      value: proof.estimatedCustomerMinutesSaved != null ? `~${proof.estimatedCustomerMinutesSaved}m` : '—',
      label: 'Customer time saved',
      estimated: true,
    },
    {
      value: proof.estimatedStaffMinutesSaved != null ? `~${proof.estimatedStaffMinutesSaved}m` : '—',
      label: 'Staff time saved',
      estimated: true,
    },
    { value: `${proof.policyChecksPassed}`, label: 'Policy checks passed' },
    {
      value: proof.budgetVarianceNzd != null ? `${proof.budgetVarianceNzd >= 0 ? '+' : '−'}$${Math.abs(proof.budgetVarianceNzd).toFixed(0)}` : '—',
      label: 'Budget variance',
      estimated: true,
    },
  ];

  return (
    <div className={styles.proof}>
      <p className={styles.proofSeal}>assembl proof · {journey.name}</p>
      <h2 className={styles.headline} style={{ marginTop: '0.5rem' }}>
        The experience, proven
      </h2>
      <p className={styles.lede}>{journey.objective}</p>

      <div className={styles.metrics}>
        {metrics.map((m) => (
          <div key={m.label} className={styles.metric}>
            <div className={styles.metricValue}>{m.value}</div>
            <div className={styles.metricLabel}>{m.label}</div>
            {m.estimated && <div className={styles.metricEst}>Estimated</div>}
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
