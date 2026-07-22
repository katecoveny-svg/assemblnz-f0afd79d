import type { CSSProperties } from 'react';
import type { CustomerJourney } from '@/lib/journey/types';
import type { ConceptConfig } from '@/lib/concepts/types';
import { JourneyExperience } from '@/app/journeys/[journeyId]/JourneyExperience';
import styles from './concept.module.css';

/**
 * Shared private-concept renderer. The editorial frame, runtime, verification
 * and proof are SHARED (it embeds the verified `JourneyExperience`, so the
 * customer view and inside-the-journey view are two representations of the SAME
 * run — one run id, one event stream, one set of approvals + ProofMetrics).
 *
 * The tenant supplies only its signature (arrival framing), brand tokens and
 * language. The concept's brand accent is applied via the `--a-*` token layer so
 * the shared journey UI inherits it, while primary CTAs stay calm graphite.
 */
export function ConceptExperience({
  concept,
  journey,
  previewMode,
}: {
  concept: ConceptConfig;
  journey: CustomerJourney;
  previewMode: boolean;
}) {
  const brandVars = {
    '--a-accent': concept.brand.accent,
    '--a-accent-deep': concept.brand.accentDeep,
    '--a-accent-soft': concept.brand.accentSoft ?? 'rgba(0,0,0,0.06)',
    '--concept-accent': concept.brand.accent,
    '--concept-ink': concept.brand.ink,
  } as CSSProperties;

  return (
    <div className={styles.root} style={brandVars}>
      {previewMode && (
        <div className={styles.previewBanner}>
          Preview mode · signed magic links not configured in this environment
        </div>
      )}

      {/* Concept chrome */}
      <header className={styles.chrome}>
        <span className={styles.lockup}>
          {concept.org} <span className={styles.cross}>×</span> assembl
        </span>
        <span className={styles.programme}>{concept.programme}</span>
      </header>

      {/* Signature arrival — tenant-specific, not a shared card shape */}
      <section className={styles.arrival}>
        <p className={styles.eyebrow}>{concept.signature.eyebrow}</p>
        <h1 className={styles.hook}>{concept.signature.hook}</h1>
        <p className={styles.hookLong}>{concept.signature.hookLong}</p>
        <p className={styles.scenario}>{concept.signature.scenario}</p>
      </section>

      {/* The one verified journey — customer + inside views on a single run */}
      <section className={styles.journeyMount}>
        <JourneyExperience journey={journey} />
      </section>

      {/* Commercial model */}
      <section className={styles.commercial}>
        <p className={styles.sectionLabel}>The commercial model</p>
        <div className={styles.chips}>
          {concept.commercial.chips.map((c) => (
            <span key={c} className={styles.chip}>{c}</span>
          ))}
        </div>
        <div className={styles.split}>
          <div><span className={styles.splitKey}>consumer</span><p>{concept.commercial.model.consumer}</p></div>
          <div><span className={styles.splitKey}>client</span><p>{concept.commercial.model.client}</p></div>
          <div><span className={styles.splitKey}>assembl</span><p>{concept.commercial.model.assembl}</p></div>
        </div>
      </section>

      {/* Pilot ask */}
      <section className={styles.pilot}>
        <p className={styles.sectionLabel}>The pilot ask</p>
        <p className={styles.pilotAsk}>{concept.commercial.pilotAsk}</p>
        <a className={styles.contact} href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>
      </section>

      {/* Disclosure — verbatim, not fine print */}
      <p className={styles.disclosure}>{concept.disclosure}</p>
    </div>
  );
}
