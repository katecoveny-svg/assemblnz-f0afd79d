'use client';

/**
 * Orchestrator for the private Woolworths "assembled" concept. Holds the
 * scenario and derives the ONE `ScenarioRun` that every section reads, so the
 * customer view, inside-the-journey view, negotiation, director's cut and
 * proof are always the same run (brief addition #3).
 */

import { useMemo, useState } from 'react';
import {
  BASE_SCENARIO,
  buildScenarioRun,
  type Scenario,
} from '@/lib/concepts/woolworths-assembled';
import { Container } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';
import { ChangeOneThing } from './ChangeOneThing';
import { CustomerExperience, JourneyInside } from './SharedRunViews';
import { AgentNegotiation } from './AgentNegotiation';
import { DirectorsCut } from './DirectorsCut';
import { BeforeWith } from './BeforeWith';
import { PilotSimulator } from './PilotSimulator';

export function AssembledExperience() {
  const [scenario, setScenario] = useState<Scenario>(BASE_SCENARIO);
  const data = useMemo(() => buildScenarioRun(scenario), [scenario]);

  return (
    <div className={styles.page}>
      <Container style={{ paddingTop: 40, paddingBottom: 0 }}>
        <div
          className={styles.statusStrip}
          style={{ background: '#ffe6d1', color: '#c65100', marginBottom: 20 }}
        >
          concept · everyday rewards × assembl · illustrative, nothing ordered
        </div>
      </Container>

      <Container>
        <section className={styles.section}>
          <ChangeOneThing scenario={scenario} onChange={setScenario} />
        </section>

        <section className={styles.section}>
          <div className={styles.grid2}>
            <CustomerExperience data={data} />
            <JourneyInside data={data} />
          </div>
        </section>

        <section className={styles.section}>
          <AgentNegotiation data={data} />
        </section>

        <section className={styles.section}>
          <DirectorsCut data={data} />
        </section>

        <section className={styles.section}>
          <BeforeWith />
        </section>

        <section className={styles.section}>
          <PilotSimulator />
        </section>

        <section className={styles.section}>
          <p style={{ fontSize: 12.5, color: '#8a959c', lineHeight: 1.6, maxWidth: 680 }}>
            Independent concept by assembl. Not affiliated with, endorsed by, or
            representing Woolworths New Zealand or Everyday Rewards. Catalogue, prices,
            household and figures are illustrative; no order is placed and no live system
            is connected.
          </p>
        </section>
      </Container>
    </div>
  );
}
