'use client';

/**
 * #13 — The human-rescue moment. One deliberate, graceful handoff: when the
 * journey reaches something it should not decide alone, it packages everything
 * a person needs and hands over — without asking the customer to repeat
 * anything. Resolution over autonomy.
 *
 * The package is assembled from the shared run: the goal from the intent, steps
 * completed from the timeline, evidence from the run's evidence records. The
 * handoff itself mirrors the journey's `human` hand-off rule
 * (ho-unresolved / ho-repeat-reject).
 */

import { useMemo } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { Eyebrow, DisplayHeading, Card } from '@/components/customers/everyday-rewards/ui';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE_DARK = '#c65100';

function packageFor(data: ScenarioRun) {
  const { run, plan, scenario } = data;
  const stepLabels = run.timeline
    .filter((e) => e.summary)
    .slice(0, 5)
    .map((e) => e.summary as string);
  const steps = stepLabels.length
    ? stepLabels
    : ['Understood the household', 'Asked only what mattered', 'Assembled the plan', 'Prepared the basket'];

  const unresolved = !plan.withinBudget
    ? `Best-fit basket is $${plan.overBudgetByNzd.toFixed(0)} over the $${scenario.budgetNzd} ceiling and the customer declined the proposed swaps.`
    : scenario.glutenFree
      ? 'A gluten-free substitute for one shared dinner has no confident in-catalogue match.'
      : 'The customer asked a question the journey should not answer on its own.';

  const next = !plan.withinBudget
    ? 'Offer a manual budget exception or confirm the two premium lines to drop.'
    : 'Confirm a suitable substitution with the customer, or approve a manual add.';

  return {
    goal: `Prepare the weekend shop for a household of ${2 + 5 + scenario.extraGuests}, within about $${scenario.budgetNzd}.`,
    context: `Pescatarian household, no spicy food${scenario.glutenFree ? ', one guest gluten-free' : ''}. ${scenario.nights} nights, click-and-collect.`,
    steps,
    unresolved,
    next,
    evidence: run.evidence.slice(0, 3).map((e) => e.label),
    sentiment: plan.withinBudget ? 'Engaged — happy so far, wants it right.' : 'Cautious — watching the total closely.',
  };
}

export function HumanRescue({ data }: { data: ScenarioRun }) {
  const p = useMemo(() => packageFor(data), [data]);

  return (
    <div>
      <Eyebrow>Human rescue · resolution over autonomy</Eyebrow>
      <DisplayHeading size={30}>When it shouldn’t decide alone, it hands over — cleanly</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 640, margin: '12px 0 24px' }}>
        Not every moment should be automated. Here the journey packages the whole picture and passes
        it to a person — so the customer never has to start again.
      </p>

      <Card style={{ maxWidth: 760 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <Row label="customer goal" value={p.goal} />
          <Row label="known context" value={p.context} />
          <div>
            <RowLabel>steps completed</RowLabel>
            <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {p.steps.map((s, i) => (
                <li key={i} style={{ fontSize: 14, color: CHARCOAL }}>
                  <span style={{ color: '#2e7d32', marginRight: 8 }}>✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <Row label="unresolved issue" value={p.unresolved} emphasise />
          <Row label="recommended next action" value={p.next} />
          <Row label="supporting evidence" value={p.evidence.length ? p.evidence.join(' · ') : 'run record attached'} />
          <Row label="customer sentiment" value={p.sentiment} />
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(34,48,60,0.1)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontSize: 19, color: NAVY }}>
            Ready for Hannah in the service team.
          </span>
          <span style={{ fontSize: 13, color: GREY }}>Nothing repeated. Full context attached.</span>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, emphasise }: { label: string; value: string; emphasise?: boolean }) {
  return (
    <div>
      <RowLabel>{label}</RowLabel>
      <p style={{ fontSize: 14.5, lineHeight: 1.55, color: emphasise ? ORANGE_DARK : CHARCOAL, margin: '6px 0 0', fontWeight: emphasise ? 600 : 400 }}>
        {value}
      </p>
    </div>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREY }}>
      {children}
    </div>
  );
}
