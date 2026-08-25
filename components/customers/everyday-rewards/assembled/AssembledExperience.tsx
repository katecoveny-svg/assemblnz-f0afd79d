'use client';

/**
 * The private Woolworths "assembled" concept — one calm scene, not a scroll
 * (design constitution §9, §10, §24).
 *
 * Purpose first (§21): a single hero statement, then the ONE thing that
 * matters — the wait assembling into a prepared shop (§17). Everything else is
 * progressive disclosure: the operator's "inside the journey" view is a mode
 * toggle (§18), and the agents, memory, economics and proof are depths opened
 * on demand, never stacked down the page. It closes on a single next action.
 *
 * Every surface reads the ONE shared `ScenarioRun`, so the lever, the phone,
 * the journey view and every depth always describe the same week. Nothing is
 * ordered; figures are simulated and labelled.
 */

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BASE_SCENARIO,
  buildScenarioRun,
  type Scenario,
} from '@/lib/concepts/woolworths-assembled';
import { recipientFor } from '@/lib/concepts/recipients';
import { SIGNED_URL_COPY, HERO_COPY } from '@/lib/concepts/everyday-rewards-copy';
import { Container } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';
import { ChangeOneThing } from './ChangeOneThing';
import { WaitAssembly } from './WaitAssembly';
import { JourneyInside } from './SharedRunViews';
import { Depths } from './Depths';
import { ReplyVerbs } from './ReplyVerbs';

type Mode = 'customer' | 'journey';

export function AssembledExperience() {
  const params = useSearchParams();
  const recipient = recipientFor(params.get('for'));
  const [scenario, setScenario] = useState<Scenario>(BASE_SCENARIO);
  const [mode, setMode] = useState<Mode>('customer');
  const [leverOpen, setLeverOpen] = useState(false);
  const data = useMemo(() => buildScenarioRun(scenario), [scenario]);

  return (
    <div className={styles.page}>
      <Container style={{ paddingTop: 28 }}>
        {/* signed-url strip — quiet, who this was prepared for */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            flexWrap: 'wrap',
            fontFamily: 'var(--edr-mono), monospace',
            fontSize: 12,
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
      </Container>

      {/* ── the scene ──────────────────────────────────────────────────── */}
      <Container style={{ paddingTop: 'clamp(40px, 8vh, 96px)', paddingBottom: 'clamp(40px, 8vh, 96px)' }}>
        {/* purpose, first */}
        <div style={{ maxWidth: 760, marginBottom: 'clamp(32px, 5vw, 56px)' }}>
          <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c65100', marginBottom: 16 }}>
            {recipient.personalised ? `${recipient.firstName} — ${HERO_COPY.eyebrow}` : HERO_COPY.eyebrow}
          </div>
          <h1 style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontWeight: 500, fontSize: 'clamp(2.6rem, 6vw, 4rem)', lineHeight: 1.02, letterSpacing: '-0.02em', color: '#22303c', margin: 0 }}>
            {HERO_COPY.heading}
          </h1>
          <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', lineHeight: 1.55, color: '#3a474e', maxWidth: 620, margin: '22px 0 0' }}>
            {HERO_COPY.line}
          </p>
        </div>

        {/* the two quiet controls: the mode, and the one lever */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            type="button"
            className={styles.depthLink}
            data-open={leverOpen}
            onClick={() => setLeverOpen((v) => !v)}
          >
            change one thing {leverOpen ? '✕' : '→'}
          </button>
        </div>

        {leverOpen ? (
          <div className={styles.assemble} style={{ marginBottom: 'clamp(28px, 4vw, 44px)', maxWidth: 760 }}>
            <ChangeOneThing scenario={scenario} onChange={setScenario} />
          </div>
        ) : null}

        {/* the one thing that matters */}
        {mode === 'customer' ? (
          <WaitAssembly data={data} />
        ) : (
          <div style={{ maxWidth: 760 }}>
            <JourneyInside data={data} />
          </div>
        )}
      </Container>

      {/* ── go deeper — hidden until asked for ─────────────────────────── */}
      <Container style={{ paddingTop: 'clamp(36px, 5vw, 64px)', paddingBottom: 'clamp(36px, 5vw, 64px)', borderTop: '1px solid rgba(34,48,60,0.08)' }}>
        <Depths data={data} />
      </Container>

      {/* ── the next action ────────────────────────────────────────────── */}
      <Container style={{ paddingTop: 'clamp(36px, 5vw, 64px)', paddingBottom: 'clamp(28px, 4vw, 48px)', borderTop: '1px solid rgba(34,48,60,0.08)' }}>
        <ReplyVerbs recipient={recipient} />
        <p style={{ fontSize: 12.5, color: '#8a959c', lineHeight: 1.6, maxWidth: 680, marginTop: 40 }}>
          Independent concept by assembl. Not affiliated with, endorsed by, or representing
          Woolworths New Zealand or Everyday Rewards. Catalogue, prices, household and figures
          are illustrative; no order is placed and no live system is connected. The one live
          input — the Auckland temperature, under &ldquo;the one live signal&rdquo; — is labelled as such.
        </p>
      </Container>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div role="tablist" aria-label="View" style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 999, background: '#f2f2f2' }}>
      {(['customer', 'journey'] as const).map((m) => (
        <button
          key={m}
          role="tab"
          aria-selected={mode === m}
          type="button"
          onClick={() => onChange(m)}
          style={{
            padding: '9px 18px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13.5,
            fontWeight: 700,
            background: mode === m ? '#fff' : 'transparent',
            color: mode === m ? '#c65100' : '#8a959c',
            boxShadow: mode === m ? '0 2px 8px rgba(34,48,60,0.10)' : 'none',
          }}
        >
          {m === 'customer' ? HERO_COPY.customerMode : HERO_COPY.journeyMode}
        </button>
      ))}
    </div>
  );
}
