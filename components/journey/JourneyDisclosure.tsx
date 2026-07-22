import { CAPABILITY_REGISTRY, getCapability } from '@/lib/journey/capabilities';
import styles from './journey.module.css';

/**
 * Plain-language public disclosure — never hidden in fine print (brief §11).
 * Explains what is illustrative, what is simulated, whether a retailer is
 * connected, how preferences are stored and removed, and current limitations.
 */
export function JourneyDisclosure() {
  const points: { label: string; text: string }[] = [
    { label: 'Illustrative data', text: getCapability('genome_read')!.disclosure },
    { label: 'Simulated actions', text: getCapability('basket_assembly')!.disclosure },
    { label: 'No retailer connected', text: getCapability('place_order')!.disclosure },
    { label: 'Saving preferences', text: getCapability('run_persistence')!.disclosure },
    { label: 'Proof figures', text: getCapability('proof')!.disclosure },
  ];
  const limitations = Array.from(
    new Set(CAPABILITY_REGISTRY.flatMap((c) => c.limitations)),
  );

  return (
    <details className={styles.disclosure}>
      <summary className={styles.disclosureSummary}>
        What&rsquo;s real, what&rsquo;s simulated — read before you start
      </summary>
      <div className={styles.disclosureBody}>
        <dl className={styles.disclosureList}>
          {points.map((p) => (
            <div key={p.label}>
              <dt>{p.label}</dt>
              <dd>{p.text}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.disclosureLimits}>
          <strong>Current limitations:</strong> {limitations.join(' · ')}
        </p>
      </div>
    </details>
  );
}
