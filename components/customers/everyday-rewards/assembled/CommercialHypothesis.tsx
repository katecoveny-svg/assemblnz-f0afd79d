'use client';

/**
 * #11 — A commercial hypothesis that changes with the journey. Not a static
 * calculator: as the "change one thing" levers move the run, the commercial
 * opportunity and the pilot measures recompute from the same run state. It
 * proves assembl designs testable commercial systems, not screens.
 *
 * Everything here is derived from the shared run + scenario. Figures are
 * modelled / illustrative for the concept, labelled as such — never measured.
 */

import { useMemo } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE_DARK = '#c65100';

type Effect = { dir: '+' | '−'; text: string };

function hypothesisFor(data: ScenarioRun) {
  const { plan, scenario } = data;
  const overBudget = !plan.withinBudget;
  const glutenFree = scenario.glutenFree;

  const intervention = overBudget
    ? 'budget rescue — swaps proposed to hold the ceiling'
    : glutenFree
      ? 'dietary guard — a household constraint honoured automatically'
      : 'prepared week — an ordinary wait turned into an approved shop';

  const effects: Effect[] = overBudget
    ? [
        { dir: '+', text: 'basket completion' },
        { dir: '+', text: 'customer trust in the total' },
        { dir: '−', text: 'abandonment at the budget line' },
      ]
    : glutenFree
      ? [
          { dir: '+', text: 'relevance for constrained households' },
          { dir: '+', text: 'repeat use' },
          { dir: '−', text: 'wrong-item complaints' },
        ]
      : [
          { dir: '+', text: 'wait-moment participation' },
          { dir: '+', text: 'points redeemed with intent' },
          { dir: '−', text: 'planning time abandoned' },
        ];

  const measures = overBudget
    ? ['budget-exception recovery rate', 'approved substitution rate', 'repeat use within 30 days']
    : glutenFree
      ? ['dietary-constraint accuracy', 'approved-without-edit rate', 'repeat use within 30 days']
      : ['wait-to-review conversion', 'approved basket rate', 'repeat use within 30 days'];

  return { intervention, effects, measures, overBudget };
}

export function CommercialHypothesis({ data }: { data: ScenarioRun }) {
  const h = useMemo(() => hypothesisFor(data), [data]);

  return (
    <div>
      <Eyebrow>Commercial hypothesis · recomputes with the journey</Eyebrow>
      <DisplayHeading size={30}>A testable system, not a static calculator</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 640, margin: '12px 0 24px' }}>
        Change a lever above and the opportunity moves with it. This is the current hypothesis for
        the run you are looking at — the intervention it added, the effects it would expect, and the
        measures a pilot would track.
      </p>

      <div className={styles.grid2} style={{ gap: 16, maxWidth: 900 }} key={data.run.id}>
        <div className={styles.assemble} style={{ padding: '18px 20px', borderRadius: 14, border: '1px solid rgba(34,48,60,0.12)', background: '#fff' }}>
          <Label>intervention added</Label>
          <p style={{ fontSize: 16, lineHeight: 1.45, color: NAVY, fontWeight: 600, margin: '6px 0 18px' }}>{h.intervention}</p>

          <Label>possible effects</Label>
          <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {h.effects.map((e) => (
              <li key={e.text} style={{ fontSize: 14, color: CHARCOAL, display: 'flex', gap: 8 }}>
                <span style={{ fontWeight: 700, color: e.dir === '+' ? '#2e7d32' : '#bd161c', width: 12 }}>{e.dir}</span>
                {e.text}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.assemble} style={{ padding: '18px 20px', borderRadius: 14, border: '1px solid rgba(34,48,60,0.12)', background: '#fbfaf7' }}>
          <Label>pilot measures added</Label>
          <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {h.measures.map((m, i) => (
              <li key={m} style={{ fontSize: 14.5, color: NAVY, display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 11, color: ORANGE_DARK }}>{String(i + 1).padStart(2, '0')}</span>
                {m}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 12, color: GREY, marginTop: 16 }}>Modelled for the concept · not measured.</p>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREY }}>
      {children}
    </div>
  );
}
