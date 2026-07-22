'use client';

/**
 * Orchestrator for the private Woolworths "assembled" concept. Holds the
 * scenario and derives the ONE `ScenarioRun` that every section reads, so the
 * customer view, inside-the-journey view, negotiation, director's cut, memory,
 * cross-surface, commercial hypothesis, human rescue and proof are always the
 * same run (brief addition #3).
 *
 * The page is an editorial arc: a private arrival, the one lever, then "the
 * mirror" (customer surface + operations surface, two truths of one moment),
 * the constellation, and the wow-factors that all recompute from the shared
 * run — closing on three ways to reply instead of "book a demo".
 */

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BASE_SCENARIO,
  buildScenarioRun,
  type Scenario,
} from '@/lib/concepts/woolworths-assembled';
import { recipientFor } from '@/lib/concepts/recipients';
import { SIGNED_URL_COPY, TWO_TRUTHS_COPY, PHONE_DEMO_COPY } from '@/lib/concepts/everyday-rewards-copy';
import { Container, Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';
import { PrivateInvitation } from './PrivateInvitation';
import { ChangeOneThing } from './ChangeOneThing';
import { PhoneDemo } from './PhoneDemo';
import { JourneyInside } from './SharedRunViews';
import { Constellation } from './Constellation';
import { AgentNegotiation } from './AgentNegotiation';
import { DirectorsCut } from './DirectorsCut';
import { LiveSignal } from './LiveSignal';
import { MemoryPassport } from './MemoryPassport';
import { CrossSurface } from './CrossSurface';
import { CommercialHypothesis } from './CommercialHypothesis';
import { BeforeWith } from './BeforeWith';
import { HumanRescue } from './HumanRescue';
import { AskThisJourney } from './AskThisJourney';
import { KaimahiAgent } from './KaimahiAgent';
import { PilotSimulator } from './PilotSimulator';
import { ReplyVerbs } from './ReplyVerbs';

export function AssembledExperience() {
  const params = useSearchParams();
  const recipient = recipientFor(params.get('for'));
  const [scenario, setScenario] = useState<Scenario>(BASE_SCENARIO);
  const data = useMemo(() => buildScenarioRun(scenario), [scenario]);
  const journeyRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.page}>
      <Container style={{ paddingTop: 28, paddingBottom: 0 }}>
        {/* signed-url strip — who this private link was prepared for */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            flexWrap: 'wrap',
            fontFamily: 'var(--edr-mono), monospace',
            fontSize: 10.5,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8a959c',
            paddingBottom: 10,
            borderBottom: '1px solid rgba(34,48,60,0.08)',
          }}
        >
          <span>
            {SIGNED_URL_COPY.eyebrow}{' '}
            <strong style={{ color: '#c65100' }}>
              {recipient.personalised ? `${recipient.fullName} · ${recipient.org}` : recipient.org}
            </strong>
          </span>
          <span>{SIGNED_URL_COPY.suffix}</span>
        </div>

        <div
          className={styles.statusStrip}
          style={{ background: '#ffe6d1', color: '#c65100', margin: '24px 0 0' }}
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

        {/* the one lever */}
        <section className={styles.section} ref={journeyRef}>
          <ChangeOneThing scenario={scenario} onChange={setScenario} />
        </section>

        {/* 01 · the mirror — one moment, two truths, visible at both ends */}
        <section className={styles.section}>
          <Eyebrow>{TWO_TRUTHS_COPY.sectionLabel}</Eyebrow>
          <DisplayHeading size={34}>{TWO_TRUTHS_COPY.heading}</DisplayHeading>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: '#3a474e', maxWidth: 660, margin: '12px 0 28px' }}>
            {TWO_TRUTHS_COPY.body}
          </p>

          <div className={styles.grid2} style={{ gap: 32, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a959c', marginBottom: 14 }}>
                {TWO_TRUTHS_COPY.customerLabel}
              </div>
              <div style={{ fontSize: 12.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#c65100', marginBottom: 10 }}>
                {PHONE_DEMO_COPY.eyebrow}
              </div>
              <PhoneDemo data={data} />
              <p style={{ fontSize: 13, color: '#8a959c', margin: '16px 0 18px', maxWidth: 380 }}>
                {TWO_TRUTHS_COPY.customerNote}
              </p>
              <KaimahiAgent />
            </div>

            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a959c', marginBottom: 14 }}>
                {TWO_TRUTHS_COPY.opsLabel}
              </div>
              <JourneyInside data={data} />
              <p style={{ fontSize: 13, color: '#8a959c', marginTop: 16, maxWidth: 420 }}>
                {TWO_TRUTHS_COPY.opsNote}
              </p>
            </div>
          </div>
        </section>

        {/* the journey, assembled in space */}
        <section className={styles.section}>
          <Constellation data={data} />
        </section>

        <section className={styles.section}>
          <AgentNegotiation data={data} />
        </section>

        <section className={styles.section}>
          <DirectorsCut data={data} />
        </section>

        <section className={styles.section}>
          <LiveSignal />
        </section>

        <section className={styles.section}>
          <MemoryPassport data={data} />
        </section>

        <section className={styles.section}>
          <CrossSurface data={data} />
        </section>

        <section className={styles.section}>
          <CommercialHypothesis data={data} />
        </section>

        <section className={styles.section}>
          <BeforeWith />
        </section>

        <section className={styles.section}>
          <HumanRescue data={data} />
        </section>

        <section className={styles.section}>
          <AskThisJourney data={data} />
        </section>

        <section className={styles.section}>
          <PilotSimulator />
        </section>

        {/* the reply — not "book a demo" */}
        <section className={styles.section}>
          <ReplyVerbs recipient={recipient} />
        </section>

        <section className={styles.section}>
          <p style={{ fontSize: 12.5, color: '#8a959c', lineHeight: 1.6, maxWidth: 680 }}>
            Independent concept by assembl. Not affiliated with, endorsed by, or
            representing Woolworths New Zealand or Everyday Rewards. Catalogue, prices,
            household and figures are illustrative; no order is placed and no live system
            is connected. The one live input on this page — the Auckland temperature — is
            clearly labelled as a live signal.
          </p>
        </section>
      </Container>
    </div>
  );
}
