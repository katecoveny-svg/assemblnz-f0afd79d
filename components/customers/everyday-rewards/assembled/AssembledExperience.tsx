'use client';

/**
 * Orchestrator for the private Woolworths "assembled" concept. Holds the
 * scenario and derives the ONE `ScenarioRun` that every section reads, so the
 * customer view, inside-the-journey view, negotiation, director's cut, ask
 * panel and proof are always the same run (brief addition #3).
 */

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BASE_SCENARIO,
  buildScenarioRun,
  type Scenario,
} from '@/lib/concepts/woolworths-assembled';
import { recipientFor } from '@/lib/concepts/recipients';
import { Container } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';
import { PrivateInvitation } from './PrivateInvitation';
import { ChangeOneThing } from './ChangeOneThing';
import { PhoneCustomerView, JourneyInside } from './SharedRunViews';
import { AgentNegotiation } from './AgentNegotiation';
import { DirectorsCut } from './DirectorsCut';
import { BeforeWith } from './BeforeWith';
import { AskThisJourney } from './AskThisJourney';
import { KaimahiAgent } from './KaimahiAgent';
import { PilotSimulator } from './PilotSimulator';

type View = 'customer' | 'inside';

export function AssembledExperience() {
  const params = useSearchParams();
  const recipient = recipientFor(params.get('for'));
  const [scenario, setScenario] = useState<Scenario>(BASE_SCENARIO);
  const [view, setView] = useState<View>('customer');
  const data = useMemo(() => buildScenarioRun(scenario), [scenario]);
  const journeyRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.page}>
      <Container style={{ paddingTop: 40, paddingBottom: 0 }}>
        <div
          className={styles.statusStrip}
          style={{ background: '#ffe6d1', color: '#c65100', marginBottom: 24 }}
        >
          concept · everyday rewards × assembl · illustrative, nothing ordered
        </div>
      </Container>

      <Container>
        <section className={styles.section}>
          <PrivateInvitation
            recipient={recipient}
            onExperience={() => journeyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
        </section>

        <section className={styles.section} ref={journeyRef}>
          <ChangeOneThing scenario={scenario} onChange={setScenario} />
        </section>

        <section className={styles.section}>
          <ViewToggle view={view} onChange={setView} />
          <div style={{ marginTop: 24 }}>
            {view === 'customer' ? (
              <div className={styles.grid2} style={{ alignItems: 'center' }}>
                <PhoneCustomerView data={data} />
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a959c', marginBottom: 10 }}>
                    the customer view
                  </div>
                  <p style={{ fontSize: 15.5, lineHeight: 1.65, color: '#3a474e', maxWidth: 460 }}>
                    What the shopper sees in the Everyday Rewards app: the week understood, the shop
                    prepared, the total held against their budget. Nothing is ordered until they
                    approve. Change a lever above and the phone reassembles from the same run.
                  </p>
                  <p style={{ fontSize: 13, color: '#8a959c', marginTop: 14, marginBottom: 20 }}>
                    Switch to <strong>inside the journey</strong> to see the agents, evidence and
                    proof behind exactly this shop.
                  </p>
                  <KaimahiAgent />
                </div>
              </div>
            ) : (
              <JourneyInside data={data} />
            )}
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
          <AskThisJourney data={data} />
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

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Experience view"
      style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 999, background: '#f2f2f2' }}
    >
      {(['customer', 'inside'] as const).map((v) => (
        <button
          key={v}
          role="tab"
          aria-selected={view === v}
          type="button"
          onClick={() => onChange(v)}
          style={{
            padding: '9px 18px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            background: view === v ? '#fff' : 'transparent',
            color: view === v ? '#c65100' : '#8a959c',
            boxShadow: view === v ? '0 2px 8px rgba(34,48,60,0.10)' : 'none',
          }}
        >
          {v === 'customer' ? 'customer experience' : 'inside the journey'}
        </button>
      ))}
    </div>
  );
}
