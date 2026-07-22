'use client';

/**
 * The two representations the brief requires — the customer experience and the
 * inside-the-journey view — both read the SAME `ScenarioRun`. The run id shown
 * in each header is identical by construction; changing a lever rebuilds both.
 */

import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { Card, Eyebrow } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const ORANGE = '#fd6400';
const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';

function groupByCategory(basket: ScenarioRun['plan']['basket']) {
  const map = new Map<string, ScenarioRun['plan']['basket']>();
  for (const item of basket) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  return [...map.entries()];
}

export function CustomerExperience({ data }: { data: ScenarioRun }) {
  const { plan, run } = data;
  const overBudget = !plan.withinBudget;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <Eyebrow>The prepared shop</Eyebrow>
        <span style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10, color: GREY }}>
          run {run.id}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '4px 0 2px' }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: NAVY, fontVariantNumeric: 'tabular-nums' }}>
          ${plan.estimatedTotalNzd.toFixed(2)}
        </span>
        <span style={{ fontSize: 14, color: overBudget ? '#bd161c' : GREY }}>
          {plan.budgetCeilingNzd != null
            ? overBudget
              ? `$${plan.overBudgetByNzd.toFixed(2)} over the $${plan.budgetCeilingNzd} budget`
              : `within the $${plan.budgetCeilingNzd} budget`
            : 'indicative total'}
        </span>
      </div>

      <div
        className={styles.statusStrip}
        style={{ background: '#f2f2f2', color: CHARCOAL, marginBottom: 18 }}
      >
        approval-ready · nothing ordered
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 8 }}>
          Meals for the weekend
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {plan.meals.map((m) => (
            <span
              key={m.id}
              style={{ fontSize: 13, padding: '6px 12px', borderRadius: 999, background: '#ffe6d1', color: '#c65100' }}
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.assemble} key={run.id}>
        {groupByCategory(plan.basket).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY, marginBottom: 4 }}>
              {category}
            </div>
            {items.map((i) => (
              <div key={i.sku} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: CHARCOAL, padding: '3px 0' }}>
                <span>
                  {i.quantity}× {i.name}
                  {!i.available ? <em style={{ color: '#bd161c' }}> · was out of stock</em> : null}
                </span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>${i.lineTotalNzd.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {plan.excludedForDiet.length ? (
        <p style={{ fontSize: 12.5, color: GREY, marginTop: 10, borderTop: '1px solid rgba(34,48,60,0.08)', paddingTop: 10 }}>
          Left out to honour the household&rsquo;s needs: {plan.excludedForDiet.join('; ')}.
        </p>
      ) : null}
    </Card>
  );
}

const STAGE_LABEL: Record<string, string> = {
  entry: 'Told us what life looks like',
  intent: 'Understood the intent',
  context: 'Asked only what mattered',
  recommendation: 'Assembled the plan',
  commitment: 'Your call',
  action: 'Prepared the basket',
  wait: 'Assembling',
  fulfilment: 'Ready for you',
  resolution: 'When something changed',
  continuation: 'Made next time easier',
};

export function JourneyInside({ data }: { data: ScenarioRun }) {
  const { run, proof } = data;
  const approved = run.proposedActions.filter((a) => a.status === 'completed');
  const passedChecks = run.verifications.filter((v) => v.status === 'passed').length;
  const agentsSeen = [...new Set(run.timeline.map((e) => e.agentId).filter(Boolean))] as string[];

  return (
    <Card style={{ background: '#fbfaf7' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <Eyebrow>Inside the journey</Eyebrow>
        <span style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10, color: GREY }}>
          run {run.id}
        </span>
      </div>

      <p style={{ fontSize: 13, color: GREY, margin: '2px 0 16px' }}>
        The same run the customer sees — operator detail only.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
        <Metric label="Current stage" value={STAGE_LABEL[run.currentStageId] ?? run.currentStageId} />
        <Metric label="Status" value={run.status.replace(/_/g, ' ')} />
        <Metric label="Agents that acted" value={String(agentsSeen.length)} />
        <Metric label="Verification checks passed" value={`${passedChecks}/${run.verifications.length}`} />
      </div>

      <SectionLabel>Agents on this run</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {agentsSeen.map((a) => (
          <span key={a} style={{ fontSize: 12.5, padding: '5px 11px', borderRadius: 999, border: '1px solid rgba(34,48,60,0.16)', color: NAVY, textTransform: 'capitalize' }}>
            {a.replace(/-/g, ' ')}
          </span>
        ))}
      </div>

      <SectionLabel>Approvals</SectionLabel>
      <div style={{ marginBottom: 16 }}>
        {approved.length ? (
          approved.map((a) => (
            <div key={a.id} style={{ fontSize: 13, color: CHARCOAL, padding: '4px 0' }}>
              ✓ {a.title} <span style={{ color: GREY }}>· {a.execution}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: GREY }}>No actions approved yet.</div>
        )}
      </div>

      <SectionLabel>Evidence used</SectionLabel>
      <div style={{ marginBottom: 16 }}>
        {run.evidence.slice(0, 5).map((e) => (
          <div key={e.id} style={{ fontSize: 12.5, color: CHARCOAL, padding: '3px 0' }}>
            <strong style={{ color: NAVY }}>{e.label}:</strong> {e.detail}
          </div>
        ))}
      </div>

      <SectionLabel>Proof</SectionLabel>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <Metric label="Context questions asked" value={String(proof.contextQuestionsAsked)} />
        <Metric label="Actions proposed" value={String(proof.proposedActionCount)} />
        <Metric label="Policy checks passed" value={String(proof.policyChecksPassed)} />
      </div>
      <p style={{ fontSize: 11.5, color: GREY, marginTop: 12 }}>
        {proof.estimatedOnly ? 'Every figure here is estimated or simulated for this concept — not measured.' : ''}
      </p>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, textTransform: 'capitalize' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: GREY, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY, margin: '2px 0 8px' }}>
      {children}
    </div>
  );
}
